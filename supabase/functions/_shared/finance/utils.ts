import type { DraftImportSource, FinanceSpendingEvent } from "./types.ts";

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseNumber(value: unknown) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function parseBoolean(value: unknown) {
  return Boolean(value);
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function parseString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

export function normalizeCategory(value: unknown) {
  const category = parseString(value, "Other");
  return category || "Other";
}

export function toIsoDate(value: Date) {
  return value.toISOString().split("T")[0];
}

export function getMonthStart(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getMonthEnd(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function getDaysInMonth(date = new Date()) {
  return getMonthEnd(date).getDate();
}

export function getMonthMetrics(
  spendingEvents: FinanceSpendingEvent[],
  date = new Date(),
) {
  const monthKey = getMonthKey(date);
  const monthStart = getMonthStart(date);
  const previousMonthStart = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const previousMonthKey = getMonthKey(previousMonthStart);
  const currentMonthEvents = spendingEvents.filter((event) => event.date.startsWith(monthKey));
  const previousMonthEvents = spendingEvents.filter((event) =>
    event.date.startsWith(previousMonthKey),
  );
  const currentMonthSpent = currentMonthEvents.reduce(
    (sum, event) => sum + parseNumber(event.total),
    0,
  );
  const previousMonthSpent = previousMonthEvents.reduce(
    (sum, event) => sum + parseNumber(event.total),
    0,
  );
  const elapsedDays = Math.max(
    1,
    Math.min(
      getDaysInMonth(date),
      Math.floor((date.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)) + 1,
    ),
  );
  const daysInMonth = getDaysInMonth(date);

  return {
    monthKey,
    currentMonthEvents,
    previousMonthEvents,
    currentMonthSpent,
    previousMonthSpent,
    elapsedDays,
    daysInMonth,
  };
}

export function parseDateInput(value: unknown, fallbackDate: string) {
  const parsed = new Date(parseString(value, fallbackDate));
  if (Number.isNaN(parsed.getTime())) {
    return fallbackDate;
  }

  return toIsoDate(parsed);
}

export function buildDraftDedupeKey(input: {
  userId: string;
  source: DraftImportSource;
  transactionDate: string;
  merchant: string;
  amount: number;
  description?: string;
}) {
  return [
    input.userId,
    input.source,
    input.transactionDate,
    input.merchant.toLowerCase().replace(/\s+/g, " ").trim(),
    input.amount.toFixed(2),
    parseString(input.description)
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim(),
  ].join("::");
}

export function parseCsvRows(csvText: string) {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index];
    const next = csvText[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(current);
      current = "";
      if (row.some((cell) => cell.trim().length > 0)) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    if (row.some((cell) => cell.trim().length > 0)) {
      rows.push(row);
    }
  }

  return rows.map((cells) => cells.map((cell) => cell.trim()));
}

export function inferCategoryFromMerchant(merchant: string, description: string) {
  const haystack = `${merchant} ${description}`.toLowerCase();
  if (/(grocery|supermarket|market|grocer)/.test(haystack)) return "Groceries";
  if (/(uber|taxi|bus|train|fuel|gas|transport|matatu)/.test(haystack)) return "Transport";
  if (/(netflix|spotify|subscription|membership|plan)/.test(haystack)) return "Subscriptions";
  if (/(restaurant|coffee|cafe|lunch|dinner|food|takeout)/.test(haystack)) return "Food";
  if (/(rent|utility|internet|water|electricity|bill)/.test(haystack)) return "Bills";
  if (/(pharmacy|clinic|doctor|health)/.test(haystack)) return "Health";
  if (/(amazon|shop|mall|store|shopping)/.test(haystack)) return "Shopping";
  return "Other";
}

export function readGatewayContentText(content: unknown) {
  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((part) => {
      if (typeof part === "string") {
        return part;
      }

      if (part && typeof part === "object" && "text" in part) {
        return typeof part.text === "string" ? part.text : "";
      }

      return "";
    })
    .join("")
    .trim();
}

export function parseGatewayJson<T>(content: unknown) {
  const raw = readGatewayContentText(content);
  if (!raw) {
    return null;
  }

  const normalized = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    return JSON.parse(normalized) as T;
  } catch (error) {
    console.error("finance-core gateway JSON parse error:", error, normalized);
    return null;
  }
}
