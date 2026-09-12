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
    // Only VITE_* is public by convention. Preserve the two documented legacy
    // aliases explicitly; a SUPABASE_ prefix would also expose service-role keys.
    envPrefix: "VITE_",
    define: {
      "import.meta.env.SUPABASE_URL": JSON.stringify(env.SUPABASE_URL || ""),
      "import.meta.env.SUPABASE_ANON_KEY": JSON.stringify(env.SUPABASE_ANON_KEY || ""),
    },
    // PGlite ships its own WASM assets — pre-bundling breaks their URLs in dev.
    optimizeDeps: { exclude: ["@electric-sql/pglite"] },
  };
});
