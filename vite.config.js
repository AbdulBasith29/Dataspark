import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Expose both VITE_* (Vite default) and SUPABASE_* (per deployment docs) to client code.
  envPrefix: ["VITE_", "SUPABASE_"],
});
