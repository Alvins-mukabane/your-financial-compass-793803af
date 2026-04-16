export const CHAT_STARTER_STORAGE_KEY = "eva-chat-starter";

export type ChatStarterPayload = {
  starterPrompt: string;
  autoStart?: boolean;
};

type LaunchFileHandle = {
  kind?: string;
  name?: string;
  getFile: () => Promise<File>;
};

type TitlebarRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type WindowControlsOverlayLike = EventTarget & {
  visible: boolean;
  getTitlebarAreaRect: () => TitlebarRect;
};

const MAX_SHARED_TEXT_LENGTH = 1800;
const MAX_FILE_PREVIEW_LENGTH = 2400;
const MAX_FILE_COUNT = 3;

function trimPreview(value: string, maxLength: number) {
  const normalized = value.trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trimEnd()}\n\n[Truncated for preview]`;
}

export function saveChatStarter(payload: ChatStarterPayload) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(CHAT_STARTER_STORAGE_KEY, JSON.stringify(payload));
}

export function readChatStarter() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(CHAT_STARTER_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as ChatStarterPayload;
    if (!parsed.starterPrompt?.trim()) {
      return null;
    }
    return parsed;
  } catch {
    clearChatStarter();
    return null;
  }
}

export function clearChatStarter() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(CHAT_STARTER_STORAGE_KEY);
}

export function getShareOrProtocolStarter(search: string) {
  const params = new URLSearchParams(search);
  const title = params.get("title")?.trim();
  const text = params.get("text")?.trim();
  const url = params.get("url")?.trim();
  const payload = params.get("payload")?.trim();
  const source = params.get("source")?.trim();

  if (!title && !text && !url && !payload) {
    return null;
  }

  const lines: string[] = [];

  if (payload) {
    lines.push(`Protocol payload: ${payload}`);
  }

  if (title) {
    lines.push(`Title: ${title}`);
  }

  if (text) {
    lines.push(`Text: ${trimPreview(text, MAX_SHARED_TEXT_LENGTH)}`);
  }

  if (url) {
    lines.push(`URL: ${url}`);
  }

  return {
    starterPrompt: [
      "Review this shared item in the context of my finances.",
      "Tell me what matters, what I should pay attention to, and what action I should take next.",
      "",
      ...lines,
    ].join("\n"),
    autoStart: false,
    source: source ?? "share",
  };
}

async function getFilePreview(file: File) {
  const rawText = await file.text();
  let preview = trimPreview(rawText, MAX_FILE_PREVIEW_LENGTH);

  if (file.type === "application/json") {
    try {
      preview = trimPreview(JSON.stringify(JSON.parse(rawText), null, 2), MAX_FILE_PREVIEW_LENGTH);
    } catch {
      preview = trimPreview(rawText, MAX_FILE_PREVIEW_LENGTH);
    }
  }

  return [
    `File: ${file.name}`,
    `Type: ${file.type || "text/plain"}`,
    "",
    preview,
  ].join("\n");
}

export async function getFileLaunchStarter(handles: readonly LaunchFileHandle[] | undefined) {
  if (!handles?.length) {
    return null;
  }

  const previews: string[] = [];

  for (const handle of handles.slice(0, MAX_FILE_COUNT)) {
    if (typeof handle.getFile !== "function") {
      continue;
    }

    const file = await handle.getFile();
    if (!file.type.startsWith("text/") && file.type !== "application/json") {
      previews.push([
        `File: ${file.name}`,
        `Type: ${file.type || "unknown"}`,
        "",
        "This file type cannot be previewed directly. Please help me understand what I should do with it.",
      ].join("\n"));
      continue;
    }

    previews.push(await getFilePreview(file));
  }

  if (!previews.length) {
    return null;
  }

  return {
    starterPrompt: [
      "I opened these files in eva.",
      "Please review them, help me understand the financial meaning, and suggest the next action.",
      "",
      previews.join("\n\n---\n\n"),
    ].join("\n"),
    autoStart: false,
  };
}

export function syncWindowControlsOverlay() {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const nav = navigator as Navigator & {
    windowControlsOverlay?: WindowControlsOverlayLike;
  };

  const overlay = nav.windowControlsOverlay;
  if (!overlay) {
    return () => undefined;
  }

  const root = document.documentElement;

  const applyGeometry = () => {
    const visible = overlay.visible;
    root.dataset.windowControlsOverlay = visible ? "visible" : "hidden";

    const rect = overlay.getTitlebarAreaRect();
    root.style.setProperty("--titlebar-area-x", `${rect.x}px`);
    root.style.setProperty("--titlebar-area-y", `${rect.y}px`);
    root.style.setProperty("--titlebar-area-width", `${rect.width}px`);
    root.style.setProperty("--titlebar-area-height", `${rect.height}px`);
  };

  applyGeometry();
  overlay.addEventListener("geometrychange", applyGeometry);

  return () => {
    overlay.removeEventListener("geometrychange", applyGeometry);
  };
}
