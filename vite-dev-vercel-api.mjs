/**
 * Dev-only bridge that mounts the Vercel-style handlers in api/ onto the
 * Vite dev server, so `npm run dev` behaves like production for Stripe and
 * certificate routes (keys come from .env via vite.config). Without this,
 * /api/stripe/* fell through to the SPA and checkout always failed in dev.
 */
import path from "path";
import { pathToFileURL } from "url";

const ROUTES = {
  "/api/stripe/checkout": "api/stripe/checkout.js",
  "/api/stripe/portal": "api/stripe/portal.js",
  "/api/stripe/webhook": "api/stripe/webhook.js",
  "/api/certificates": "api/certificates/index.js",
};

// The Stripe webhook verifies a signature over the raw stream — never
// pre-parse its body.
const RAW_BODY_ROUTES = new Set(["/api/stripe/webhook"]);

// Server-only vars the api/ handlers read. Vite deliberately doesn't put
// these on process.env, so copy them over from the loaded .env.
const ENV_KEYS = /^(STRIPE_|SUPABASE_|VITE_SUPABASE_|ANTHROPIC_|GEMINI_)/;

function readJsonBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

export function devVercelApiPlugin(env = {}) {
  const handlers = new Map();

  async function loadHandler(file) {
    if (!handlers.has(file)) {
      const mod = await import(pathToFileURL(path.resolve(file)).href);
      handlers.set(file, mod.default);
    }
    return handlers.get(file);
  }

  return {
    name: "dev-vercel-api",
    configureServer(server) {
      for (const [k, v] of Object.entries(env)) {
        if (ENV_KEYS.test(k) && v && !process.env[k]) process.env[k] = v;
      }
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url || "").split("?")[0];
        const file = ROUTES[url];
        if (!file) return next();

        // Adapt connect's req/res to the Vercel handler contract.
        req.query = Object.fromEntries(new URL(req.url, "http://localhost").searchParams);
        if (!RAW_BODY_ROUTES.has(url) && req.method !== "GET" && req.method !== "OPTIONS") {
          req.body = await readJsonBody(req);
        }
        res.status = (code) => { res.statusCode = code; return res; };
        res.json = (obj) => {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(obj));
          return res;
        };

        try {
          const handler = await loadHandler(file);
          await handler(req, res);
        } catch (err) {
          if (!res.writableEnded) res.status(500).json({ error: "dev_api_error", message: err?.message });
        }
      });
    },
  };
}
