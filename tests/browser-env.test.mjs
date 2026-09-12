import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { build } from "vite";
import config from "../vite.config.js";

test("compiled client keeps public aliases but excludes server-only secrets", async (t) => {
  const values = {
    SUPABASE_URL: "https://public-example.supabase.co",
    SUPABASE_ANON_KEY: "public-anon-marker",
    VITE_SUPABASE_URL: "https://vite-example.supabase.co",
    VITE_SUPABASE_ANON_KEY: "public-vite-anon-marker",
    SUPABASE_SERVICE_ROLE_KEY: "PRIVATE_SERVICE_ROLE_SENTINEL",
    SUPABASE_OTHER_SECRET: "PRIVATE_SUPABASE_SENTINEL",
    ANTHROPIC_API_KEY: "PRIVATE_AI_SENTINEL",
    STRIPE_SECRET_KEY: "PRIVATE_STRIPE_SENTINEL",
  };
  const saved = Object.fromEntries(Object.keys(values).map((key) => [key, process.env[key]]));
  Object.assign(process.env, values);
  const root = await mkdtemp(join(tmpdir(), "dataspark-env-"));
  t.after(async () => {
    for (const key of Object.keys(values)) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
    await rm(root, { recursive: true, force: true });
  });
  await writeFile(join(root, "main.js"), `console.log(import.meta.env, import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_ANON_KEY, import.meta.env.SUPABASE_SERVICE_ROLE_KEY);`);
  const result = await build({
    ...config({ mode: "production" }),
    root, envDir: root, configFile: false, plugins: [], logLevel: "silent",
    build: { write: false, rollupOptions: { input: join(root, "main.js") } },
  });
  const output = result.output.map((item) => item.code || item.source || "").join("\n");
  for (const value of Object.values(values).filter((value) => value.startsWith("PRIVATE_"))) {
    assert.ok(!output.includes(value), "Server secret leaked into compiled client");
  }
  for (const key of ["SUPABASE_URL", "SUPABASE_ANON_KEY", "VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"]) {
    assert.ok(output.includes(values[key]), key + " must remain available");
  }
});
