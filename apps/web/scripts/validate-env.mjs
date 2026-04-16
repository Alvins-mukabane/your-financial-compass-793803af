const requiredVars = [
  "VITE_SUPABASE_PROJECT_ID",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "VITE_SUPABASE_URL",
];

const recommendedVars = ["GROQ_API_KEY", "TAVILY_API_KEY"];

function isMissing(name) {
  const value = process.env[name];
  return typeof value !== "string" || value.trim().length === 0;
}

const missingRequired = requiredVars.filter(isMissing);
const missingRecommended = recommendedVars.filter(isMissing);

if (missingRequired.length > 0) {
  console.error("Missing required environment variables:");
  for (const name of missingRequired) {
    console.error(`- ${name}`);
  }
  process.exit(1);
}

console.log("Required environment variables look good.");

if (missingRecommended.length > 0) {
  console.warn("Optional AI/provider environment variables are not set:");
  for (const name of missingRecommended) {
    console.warn(`- ${name}`);
  }
  console.warn(
    "The app can still build, but live AI or research features may fall back or degrade.",
  );
}
