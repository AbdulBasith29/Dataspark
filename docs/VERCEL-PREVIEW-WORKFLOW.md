# DataSpark — Vercel Preview Workflow

This project now includes a GitHub Actions workflow that automatically creates a Vercel preview deployment for every pull request.

- Workflow file: `.github/workflows/vercel-preview.yml`
- Trigger: PR opened / synchronized / reopened, or manual `workflow_dispatch`
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
npx vercel@53.2.0 pull --yes --environment=preview --token "$VERCEL_TOKEN"
npx vercel@53.2.0 build --token "$VERCEL_TOKEN"
npx vercel@53.2.0 deploy --prebuilt --token "$VERCEL_TOKEN"
```

Use the returned URL to validate:

- `/`
- `/platform`
- `/dashboard` (redirect to `/platform`)

---

## 5) Troubleshooting

- **Error: `No existing credentials found` or the log shows `--token=` with nothing after it**
  - `VERCEL_TOKEN` is missing, empty, or unavailable to this workflow run. Add `VERCEL_TOKEN` under GitHub **Settings -> Secrets and variables -> Actions**. If the PR is from a fork, secrets will not be exposed; run the workflow from a branch in the main repository or use the manual fallback locally.
- **Error: Missing project/org IDs**
  - Add `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` as GitHub Actions secrets.
- **Error: project not linked**
  - Run `npx vercel link` locally and confirm org/project IDs.
- **Build passes locally but fails in preview**
  - Compare env variables in Vercel Preview vs local `.env`.
---

## 6) What the secret validation step does

The workflow fails early with a clear GitHub Actions error if any of these are absent:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

This avoids the confusing Vercel CLI error where the command appears in logs as `--token=` and then fails with `No existing credentials found`.

