import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { devAiApiPlugin } from "./vite-dev-ai-api.mjs";
import { devVercelApiPlugin } from "./vite-dev-vercel-api.mjs";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      react(),
      devAiApiPlugin({
        anthropicApiKey: env.ANTHROPIC_API_KEY || "",
        geminiApiKey: env.GEMINI_API_KEY || "",
      }),
      // Stripe + certificate routes in dev, same handlers as production.
      devVercelApiPlugin(env),
    ],
    // Expose both VITE_* (Vite default) and SUPABASE_* (per deployment docs) to client code.
    envPrefix: ["VITE_", "SUPABASE_"],
    // PGlite ships its own WASM assets — pre-bundling breaks their URLs in dev.
    optimizeDeps: { exclude: ["@electric-sql/pglite"] },
  };
});
