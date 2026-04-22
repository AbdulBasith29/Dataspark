import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { devAiApiPlugin } from "./vite-dev-ai-api.mjs";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      react(),
      devAiApiPlugin({
        anthropicApiKey: env.ANTHROPIC_API_KEY || "",
        geminiApiKey: env.GEMINI_API_KEY || "",
      }),
    ],
    // Expose both VITE_* (Vite default) and SUPABASE_* (per deployment docs) to client code.
    envPrefix: ["VITE_", "SUPABASE_"],
  };
});
