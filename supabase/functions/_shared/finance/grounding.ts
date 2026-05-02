import { buildBootstrap } from "./bootstrap.ts";
import { parseNumber, parseString } from "./utils.ts";

export type GroundedSearchRequest = {
  query: string;
  user_intent?: string | null;
  finance_context_mode?: "none" | "summary" | "full";
  require_citations?: boolean;
};

export type GroundedSearchResult = {
  beta: true;
  answer: string;
  citations: Array<{ title: string; url: string }>;
  search_queries: string[];
  freshness_timestamp: string;
  confidence: "low" | "medium" | "high";
};

export type PlaceSearchRequest = {
  query: string;
  location_bias?: { latitude: number; longitude: number; radius_meters?: number } | null;
  requested_purpose?: string | null;
  max_results?: number;
};

export type PlaceSearchResult = {
  beta: true;
  places: Array<{
    name: string;
    address: string | null;
    maps_url: string | null;
    website_url: string | null;
    rating: number | null;
    price_level: string | null;
  }>;
  finance_aware_summary: string;
  freshness_timestamp: string;
  confidence: "low" | "medium" | "high";
};

function groundingEnabled() {
  return Deno.env.get("EVA_GEMINI_GROUNDING_ENABLED") === "true";
}

function mapsEnabled() {
  return Deno.env.get("EVA_GOOGLE_MAPS_ENABLED") === "true";
}

function financeSummary(bootstrap: Awaited<ReturnType<typeof buildBootstrap>>) {
  const summary = bootstrap.dashboard_summary;
  const forecast = bootstrap.forecast;
  return [
    `Cash balance: ${summary.cash_balance}`,
    `Monthly income: ${summary.monthly_income}`,
    `Monthly fixed expenses: ${summary.monthly_fixed_expenses}`,
    `Monthly cashflow: ${summary.monthly_cashflow}`,
    `Projected free cash: ${forecast?.projected_free_cash ?? summary.monthly_cashflow}`,
    `Health score: ${summary.health_score}`,
  ].join("; ");
}

function fallbackSearchResult(query: string, message: string): GroundedSearchResult {
  return {
    beta: true,
    answer: message,
    citations: [],
    search_queries: query ? [query] : [],
    freshness_timestamp: new Date().toISOString(),
    confidence: "low",
  };
}

export async function groundedGoogleSearch(userId: string, request: GroundedSearchRequest): Promise<GroundedSearchResult> {
  const query = parseString(request.query).trim();
  if (!query) {
    throw new Error("Ask EVA what to search for first.");
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!groundingEnabled() || !apiKey) {
    return fallbackSearchResult(
      query,
      "Real-time Google Search grounding is not configured yet. I can still help from your stored EVA finance data, but I will not invent current web facts.",
    );
  }

  const bootstrap = await buildBootstrap(userId, null);
  const includeFinance = request.finance_context_mode !== "none";
  const context = includeFinance ? `\nUser finance snapshot: ${financeSummary(bootstrap)}` : "";
  const intent = parseString(request.user_intent, "finance guidance");
  const prompt = `You are EVA, a warm personal finance assistant. Answer concisely with current, cited facts from Google Search. Do not mutate user data. If the user asks for a purchase decision, combine the web facts with the finance snapshot and clearly say if more price information is needed.\nIntent: ${intent}\nQuestion: ${query}${context}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      tools: [{ google_search: {} }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 900 },
    }),
  });

  const payload = await response.json().catch(() => null) as Record<string, unknown> | null;
  if (!response.ok || !payload) {
    return fallbackSearchResult(query, "Google Search grounding was unavailable just now. Please try again in a moment.");
  }

  const candidates = Array.isArray(payload.candidates) ? payload.candidates : [];
  const first = (candidates[0] ?? {}) as Record<string, unknown>;
  const content = (first.content ?? {}) as Record<string, unknown>;
  const parts = Array.isArray(content.parts) ? content.parts : [];
  const answer = parts
    .map((part) => typeof (part as Record<string, unknown>).text === "string" ? String((part as Record<string, unknown>).text) : "")
    .join("\n")
    .trim();
  const grounding = (first.groundingMetadata ?? {}) as Record<string, unknown>;
  const chunks = Array.isArray(grounding.groundingChunks) ? grounding.groundingChunks : [];
  const citations = chunks.flatMap((chunk) => {
    const web = ((chunk as Record<string, unknown>).web ?? {}) as Record<string, unknown>;
    const url = parseString(web.uri);
    if (!url) return [];
    return [{ title: parseString(web.title, url), url }];
  });
  const searchQueries = Array.isArray(grounding.webSearchQueries)
    ? grounding.webSearchQueries.map((item) => parseString(item)).filter(Boolean)
    : [query];

  return {
    beta: true,
    answer: answer || "I found search results, but Gemini did not return a usable summary. Try a more specific question.",
    citations: citations.slice(0, 6),
    search_queries: searchQueries.slice(0, 4),
    freshness_timestamp: new Date().toISOString(),
    confidence: citations.length ? "high" : "medium",
  };
}

function priceLevelToText(value: unknown) {
  const parsed = parseString(value);
  return parsed ? parsed.replace(/^PRICE_LEVEL_/, "").toLowerCase().replace(/_/g, " ") : null;
}

export async function groundedPlaceSearch(userId: string, request: PlaceSearchRequest): Promise<PlaceSearchResult> {
  const query = parseString(request.query).trim();
  if (!query) {
    throw new Error("Tell EVA what place or merchant to look up first.");
  }

  const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
  if (!mapsEnabled() || !apiKey) {
    return {
      beta: true,
      places: [],
      finance_aware_summary: "Google Maps lookup is not configured yet. I can still compare prices or affordability if you give me the item and price.",
      freshness_timestamp: new Date().toISOString(),
      confidence: "low",
    };
  }

  const maxResults = Math.min(Math.max(Math.trunc(parseNumber(request.max_results ?? 5)), 1), 8);
  const body: Record<string, unknown> = { textQuery: query, maxResultCount: maxResults };
  const bias = request.location_bias;
  if (bias && Number.isFinite(bias.latitude) && Number.isFinite(bias.longitude)) {
    body.locationBias = {
      circle: {
        center: { latitude: bias.latitude, longitude: bias.longitude },
        radius: bias.radius_meters ?? 5000,
      },
    };
  }

  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.googleMapsUri,places.websiteUri,places.rating,places.priceLevel",
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null) as Record<string, unknown> | null;
  if (!response.ok || !payload) {
    return {
      beta: true,
      places: [],
      finance_aware_summary: "Google Maps lookup failed just now. Please try again or search with a more specific place name.",
      freshness_timestamp: new Date().toISOString(),
      confidence: "low",
    };
  }

  const places = (Array.isArray(payload.places) ? payload.places : []).map((item) => {
    const place = item as Record<string, unknown>;
    const displayName = (place.displayName ?? {}) as Record<string, unknown>;
    return {
      name: parseString(displayName.text, "Unnamed place"),
      address: parseString(place.formattedAddress) || null,
      maps_url: parseString(place.googleMapsUri) || null,
      website_url: parseString(place.websiteUri) || null,
      rating: Number.isFinite(Number(place.rating)) ? Number(place.rating) : null,
      price_level: priceLevelToText(place.priceLevel),
    };
  });

  const bootstrap = await buildBootstrap(userId, null);
  const summary = bootstrap.dashboard_summary;
  const top = places[0];
  const purpose = parseString(request.requested_purpose, "compare options");
  const financeAwareSummary = top
    ? `I found ${places.length} place${places.length === 1 ? "" : "s"} for ${purpose}. Start with ${top.name}${top.rating ? ` (${top.rating}/5)` : ""}. For affordability, compare the actual price against your projected monthly free cash of ${summary.monthly_cashflow.toFixed(2)} before committing.`
    : "I could not find matching places. Try adding a city, neighborhood, or exact merchant name.";

  return {
    beta: true,
    places,
    finance_aware_summary: financeAwareSummary,
    freshness_timestamp: new Date().toISOString(),
    confidence: places.length ? "high" : "low",
  };
}
