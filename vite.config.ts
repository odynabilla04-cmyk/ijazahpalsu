// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Pin Nitro preset to "vercel" so self-deploys to Vercel produce the right output.
// Inside a Lovable build this override is ignored and Cloudflare is forced.
export default defineConfig({
  nitro: { preset: "vercel" },
});
