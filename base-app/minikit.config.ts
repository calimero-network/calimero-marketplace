const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "eyJmaWQiOjEzOTIxNjQsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg0MjIxMTYzNDZFN2JjN0YzMUY0MjI5MmJDODQ1MzEwMzFhMzBEZjY4In0",
    payload: "eyJkb21haW4iOiJjYWxpbWVyby1tYXJrZXRwbGFjZS52ZXJjZWwuYXBwIn0",
    signature: "Wys0aor0yvY3SIT5scBzsnZxt+/crEhnwBnctDs5zw0bSipEfVe+u2QNrwLvdhq9F6fW+i90HuWS61iUgH/RMBw="
  },
  miniapp: {
    version: "1",
    name: "Cubey", 
    subtitle: "Your AI Ad Companion", 
    description: "Ads",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/blue-icon.png`,
    splashImageUrl: `${ROOT_URL}/blue-hero.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["marketing", "ads", "quickstart", "waitlist"],
    heroImageUrl: `${ROOT_URL}/blue-hero.png`, 
    tagline: "",
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: `${ROOT_URL}/blue-hero.png`,
  },
  baseBuilder: {
    allowedAddresses: ["0x6f26a74B5825c2B2b22a16EfB7709365c5533B7D"]
  },
} as const;

