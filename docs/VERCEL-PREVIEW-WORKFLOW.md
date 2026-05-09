# DataSpark — Vercel Preview Workflow

This project now includes a GitHub Actions workflow that automatically creates a Vercel preview deployment for every pull request.

- Workflow file: `.github/workflows/vercel-preview.yml`
- Trigger: PR opened / synchronized / reopened
- Result: URL is posted as a PR comment

---

## 1) One-time setup (required)

In your GitHub repository settings (`Settings -> Secrets and variables -> Actions`), add these secrets:

1. `VERCEL_TOKEN`
   - Create in Vercel: **Account Settings -> Tokens**
2. `VERCEL_ORG_ID`
   - Value from `.vercel/project.json` after linking locally
3. `VERCEL_PROJECT_ID`
   - Value from `.vercel/project.json` after linking locally

> Note: `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` are consumed by the Vercel CLI after `vercel pull` and are standard for CI-based Vercel deploys.

---

## 2) Local link (maintainer machine)

Run once on a machine with Vercel CLI access:

```bash
npx vercel link
```

This creates `.vercel/project.json` locally (do not commit this directory).

---

## 3) How preview URLs are delivered

For each PR, the workflow:

1. Installs dependencies and builds the app.
2. Pulls preview env config from Vercel.
3. Builds and deploys with Vercel CLI.
4. Posts a PR comment like:
   - `✅ Vercel preview is ready: https://<deployment>.vercel.app`

---

## 4) Manual fallback command (if GitHub Actions is unavailable)

```bash
npx vercel pull --yes --environment=preview
npx vercel build
npx vercel deploy --prebuilt
```

Use the returned URL to validate:

- `/`
- `/platform`
- `/dashboard` (redirect to `/platform`)

---

## 5) Troubleshooting

- **Error: Missing token / unauthorized**
  - Recreate `VERCEL_TOKEN` and update GitHub secret.
- **Error: project not linked**
  - Run `npx vercel link` locally and confirm org/project IDs.
- **Build passes locally but fails in preview**
  - Compare env variables in Vercel Preview vs local `.env`.
