const AVATAR_PALETTES = [
  ["#f59e0b", "#fb7185", "#ea580c"],
  ["#2563eb", "#14b8a6", "#0f766e"],
  ["#7c3aed", "#ec4899", "#db2777"],
  ["#16a34a", "#84cc16", "#15803d"],
  ["#0f766e", "#22c55e", "#0ea5e9"],
  ["#dc2626", "#f97316", "#f59e0b"],
];

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

export function getAvatarInitials(name: string, email?: string | null) {
  const normalizedName = name.trim().replace(/\s+/g, " ");
  if (normalizedName) {
    const parts = normalizedName.split(" ").filter(Boolean);
    const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
    return initials.join("") || "EV";
  }

  const emailName = (email ?? "").split("@")[0]?.trim();
  if (emailName) {
    return emailName.slice(0, 2).toUpperCase();
  }

  return "EV";
}

export function createUserAvatarSrc(seed: string, name: string, email?: string | null) {
  const safeSeed = seed || email || name || "eva";
  const hash = hashString(safeSeed);
  const palette = AVATAR_PALETTES[hash % AVATAR_PALETTES.length];
  const rotation = hash % 360;
  const accentX = 18 + (hash % 20);
  const accentY = 16 + ((hash >> 3) % 22);
  const initials = getAvatarInitials(name, email);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="${initials}">
      <defs>
        <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette[0]}" />
          <stop offset="55%" stop-color="${palette[1]}" />
          <stop offset="100%" stop-color="${palette[2]}" />
        </linearGradient>
      </defs>
      <rect width="96" height="96" rx="48" fill="url(#avatarGradient)" />
      <circle cx="${accentX}" cy="${accentY}" r="22" fill="rgba(255,255,255,0.16)" />
      <circle cx="74" cy="72" r="28" fill="rgba(255,255,255,0.12)" />
      <path d="M18 18 L78 18 L48 78 Z" fill="rgba(255,255,255,0.08)" transform="rotate(${rotation} 48 48)" />
      <text
        x="50%"
        y="55%"
        dominant-baseline="middle"
        text-anchor="middle"
        font-family="Inter, Roboto, Open Sans, sans-serif"
        font-size="32"
        font-weight="700"
        fill="#ffffff"
      >
        ${initials}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
