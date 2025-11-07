# Project Hand-off — GrowEasy CSV Importer

> This document is written for a **second developer** picking up the codebase.
> It captures the full mental model of the project in one file: what each
> feature is, where the code lives, how to run it, how to deploy it, and how
> to keep the git history clean.

- **Repo:** https://github.com/gaurav-init/assign-s
- **Deadline:** 12 Jul 2026 (submission email to `varun@groweasy.ai`)
- **Live app:** _to be filled after Vercel + Render deploy_
- **Stack:** React 19 + Vite (frontend) · Node 20 + Express (backend) · Gemini 3.1 Flash-Lite (LLM) · MongoDB (optional persistence)

---

## 0. Clone & bootstrap

```bash
git clone https://github.com/gaurav-init/assign-s.git
cd assign-s

# Backend
cd backend
cp .env.example .env
#   → paste your GEMINI_API_KEY (free tier: https://aistudio.google.com/apikey)
#   → optionally set MONGODB_URI=mongodb://localhost:27017/groweasy
npm install
npm run dev            # http://localhost:8080

# Frontend (new terminal)
cd ../frontend
cp .env.example .env
npm install
npm run dev            # http://localhost:5173
```

Run tests any time with `cd backend && npm test` — 22 vitest specs, all green.

To run **without an API key**, set `AI_PROVIDER=mock` in `backend/.env`. The
bundled heuristic mapper is deterministic and passes every sample CSV; it's
enough to demo the flow end-to-end.

---

## 1. Feature-wise architecture

Every feature below maps to real files. The list also matches the shape of the
commit history — jumping from a feature name to `git log --oneline --grep=<key>`
should land on the commit that added it.

### Feature 1 · CSV parsing (no AI yet)
- **What:** accept any CSV format (comma / semicolon / tab / pipe, quoted
  fields, BOM, ragged rows), return typed rows and a preview.
- **Where:**
  - `backend/src/services/csv-parser.service.js` — delimiter detection, sync parse
  - `backend/src/middleware/upload.middleware.js` — multer + MIME/size gates (10 MB max)
  - `backend/src/controllers/imports.controller.js` — `parseUpload()` handler
  - `backend/src/services/import-store.service.js` — in-memory TTL cache
    keyed by `importId`, cleared after 15 min
  - Tests: `backend/src/__tests__/csv-parser.test.js`

### Feature 2 · Canonical CRM schema + Zod validation
- **What:** 15 GrowEasy fields with enum whitelists on `crm_status` and
  `data_source`. Every LLM-returned record is re-validated server-side.
- **Where:**
  - `backend/src/schemas/crm.schema.js` — Zod schemas + OpenAI/Gemini JSON schemas
  - `backend/src/services/validator.service.js` — enum coercion, phone digits-only,
    country_code `+XX` prefix, `new Date()` round-trip, `\n` escaping,
    the "must have email OR mobile" skip rule
  - Tests: `backend/src/__tests__/validator.test.js`

### Feature 3 · Multi-provider AI client
- **What:** provider-agnostic dispatch — Gemini (default), OpenAI, or a
  deterministic offline "mock". Chosen via `AI_PROVIDER` env.
- **Where:**
  - `backend/src/services/ai/ai-client.js` — dispatcher
  - `backend/src/services/ai/prompt.js` — the system + user prompt builder
    (this is the product — read it carefully)
  - `backend/src/services/ai/gemini.provider.js` — Gemini generateContent with
    `responseSchema` (structured output)
  - `backend/src/services/ai/openai.provider.js` — GPT-4o-mini with
    `response_format: json_schema`
  - `backend/src/services/ai/mock.provider.js` — regex-based mapper for keyless dev
  - Tests: `backend/src/__tests__/prompt.test.js`

### Feature 4 · Batched extraction + retry + SSE streaming
- **What:** rows split into 20-row batches, extracted in parallel (concurrency
  cap 3), retried with exponential backoff (max 2 retries per batch),
  cross-indexed by `_rowIndex` so out-of-order LLM responses still line up.
- **Where:**
  - `backend/src/services/batch-processor.service.js` — the pipeline
  - `backend/src/utils/retry.js` — `retry()` + `withTimeout()`
  - `backend/src/utils/sse.js` — SSE helper (heartbeat, event framing)
  - `backend/src/controllers/imports.controller.js` — `extractImport()`
    supports `?stream=true` for SSE
  - Tests: `backend/src/__tests__/batch-processor.test.js` (uses mock provider)

### Feature 5 · React 4-step flow
- **What:** Upload → Preview → Confirm → Results, driven by a `useReducer`
  state machine, cancellable via `AbortController`.
- **Where:**
  - `frontend/src/hooks/useImportFlow.js` — state machine + fetch + SSE consumer
  - `frontend/src/components/flow/UploadStep.jsx` — hero + dropzone + sample chips
  - `frontend/src/components/flow/PreviewStep.jsx` — sidebar-collapse + preview table
  - `frontend/src/components/flow/ProcessingStep.jsx` — live per-batch chip grid
  - `frontend/src/components/flow/ResultsStep.jsx` — tabs (imported / skipped) + CSV/JSON export
  - `frontend/src/components/flow/ErrorStep.jsx` — fault card

### Feature 6 · Virtualized data table with sticky header + row #
- **What:** any column count, any row count, hairline-thin grid, fits width
  when possible or scrolls horizontally with edge-fade shadows only when
  necessary. Sticky row-# column, sticky header. Chroma-spectrum status chips.
- **Where:**
  - `frontend/src/components/shared/DataTable.jsx` — one component,
    `@tanstack/react-virtual` under the hood
  - Widths are content-estimated then scaled to fill the container in a
    `useEffect` + `ResizeObserver` — that's why nothing wraps or truncates
    weirdly.

### Feature 7 · Dropzone + one-click sample loaders
- `frontend/src/components/shared/Dropzone.jsx` — drag/drop + file picker,
  size + MIME gates.
- `frontend/src/constants/samples.js` — 4 inline sample CSVs (Facebook,
  Google Ads, real-estate, multi-contact) with a `sampleToFile()` helper that
  reuses the exact same upload path — no branching.

### Feature 8 · Skeuomorphic-Clean design system
- **What:** DM Mono + Instrument Serif, black canvas, 2 px card corners,
  yellow #FFB900 primary, oxblood signature surface. See `design.md §17` for
  the full spec.
- **Where:**
  - `frontend/tailwind.config.js` — palette, radii, animations
  - `frontend/src/index.css` — `.panel` / `.panel-blood` / `.btn-*` /
    `.label` / `.mono` / `.chip` / `.kbd` — all with light + dark variants
  - `frontend/index.html` — Google Fonts preload
  - `frontend/src/components/layout/AppShell.jsx` — dotted grid + oxblood halo bg

### Feature 9 · Light + dark themes
- `frontend/src/hooks/useTheme.js` — reads/writes `localStorage`, toggles
  `.dark` on `<html>`.
- Every custom component in `src/components/ui/` has explicit `dark:` variants.

### Feature 10 · MongoDB persistence + History drawer
- **What:** every parse creates a Mongo entry (`status: parsed`); every extract
  updates it with counts, batches, and the full imported/skipped payloads
  (`status: done`). The frontend drawer lists them; clicking replays a saved
  result without a re-run.
- **Where:**
  - `backend/src/services/mongo.service.js` — lazy singleton, gracefully
    no-ops if `MONGODB_URI` is missing
  - `backend/src/services/history.service.js` — `recordParse` / `recordExtract`
    / `recordFailure` / `listHistory` / `getHistoryEntry`
  - `backend/src/controllers/imports.controller.js` — history endpoints
  - `frontend/src/components/layout/HistoryDrawer.jsx` — slide-in drawer,
    empty-state, "Mongo not connected" state
  - `frontend/src/lib/api.js` — `listImports`, `getImport`

### Feature 11 · Ops / packaging
- Multi-stage Dockerfiles for both services.
- `docker-compose.yml` at repo root — one command, `GEMINI_API_KEY=... docker compose up --build`.
- `frontend/nginx.conf` — SPA fallback + immutable asset caching.
- README §Deployment — Vercel + Render/Railway recipe.

---

## 2. Directory map

```
assign-s/
├── design.md                # design doc — read this before big changes
├── README.md                # user-facing setup + API docs
├── COMMIT_PLAN.md           # 3-day commit schedule (already executed)
├── HANDOFF.md               # this file
├── docker-compose.yml
├── samples/                 # 6 heterogeneous CSVs for demos + tests
│
├── backend/
│   ├── package.json         Node 20, ESM
│   ├── vitest.config.js     + vitest.setup.js
│   ├── Dockerfile
│   ├── .env.example         (safe placeholders; real .env is gitignored)
│   └── src/
│       ├── index.js         → app.js → router
│       ├── config/env.js    Zod-parsed process.env
│       ├── routes/          health, imports, index
│       ├── controllers/     imports (parse, extract, history, history/:id)
│       ├── services/
│       │   ├── csv-parser.service.js
│       │   ├── import-store.service.js
│       │   ├── batch-processor.service.js
│       │   ├── validator.service.js
│       │   ├── mongo.service.js
│       │   ├── history.service.js
│       │   └── ai/
│       │       ├── ai-client.js       provider dispatch
│       │       ├── prompt.js          THE product
│       │       ├── gemini.provider.js Gemini 3.1 Flash-Lite
│       │       ├── openai.provider.js GPT-4o-mini
│       │       └── mock.provider.js   deterministic offline
│       ├── schemas/crm.schema.js
│       ├── middleware/      error, upload (multer), request-id, rate-limit
│       ├── utils/           logger, sse, retry, errors
│       └── __tests__/       4 vitest specs, 22 tests total
│
└── frontend/
    ├── package.json         React 19, Vite 5
    ├── vite.config.js       proxies /api → backend in dev
    ├── tailwind.config.js   Skeuomorphic-Clean tokens
    ├── index.html           Google Fonts preload
    ├── postcss.config.js
    ├── Dockerfile           multi-stage → nginx
    ├── nginx.conf
    ├── .env.example
    └── src/
        ├── main.jsx         theme init + React root
        ├── App.jsx          shell + state machine wiring
        ├── index.css        tokens + primitives + utilities
        ├── components/
        │   ├── ui/          Button, Card (+Module), Badge, StatPill,
        │   │                StepIndicator, ProgressBar, Tabs, EmptyState
        │   ├── shared/      Dropzone, DataTable
        │   ├── layout/      AppShell, ThemeToggle, HistoryDrawer
        │   └── flow/        Upload, Preview, Processing, Results, Error
        ├── hooks/           useImportFlow (state machine), useTheme
        ├── lib/             api (fetch + SSE parser), csv (export), cn
        └── constants/       crm (fields, status colors), samples (inline CSVs)
```

---

## 3. Running the tests

```bash
cd backend
npm test                     # one-shot
npm run test:watch           # TDD mode
```

Every service has a unit test:
- `csv-parser.test.js` — delimiter detection, BOM, quoted fields, ragged rows
- `validator.test.js` — enums, skip rule, phone normalization, date coercion, newline escaping
- `prompt.test.js` — all enum values present, `_rowIndex` preserved
- `batch-processor.test.js` — end-to-end via the mock provider (contact info gate, concurrency)

**All 22 pass on `main`.** Do not push a red CI.

---

## 4. Deploying

### 4.1 Backend on Render (or Railway)
1. **New Web Service** → connect the GitHub repo → root: `backend/`
2. Build: `npm install`. Start: `npm start`.
3. Env vars:
   - `GEMINI_API_KEY` — required
   - `FRONTEND_ORIGIN` — the eventual Vercel URL (e.g. `https://assign-s.vercel.app`)
   - `MONGODB_URI` — optional Atlas connection string
   - `NODE_ENV=production`
4. Deploy → note the URL (`https://assign-s-api.onrender.com`).

### 4.2 Frontend on Vercel
1. **Import Project** → root: `frontend/`
2. Framework preset: **Vite**. Build: `npm run build`. Output: `dist`.
3. Env var: `VITE_BACKEND_URL=https://assign-s-api.onrender.com`
4. Deploy → note the URL.

### 4.3 Sanity checks after deploy
```bash
curl https://assign-s-api.onrender.com/api/v1/health
# → { "status":"ok", "provider":"gemini", "model":"gemini-3.1-flash-lite", ... }
```
Open the Vercel URL, drag `samples/facebook-lead-export.csv` — you should see
5 imported records in the results table.

---

## 5. Git etiquette

### The existing history (already pushed by the initial dev)
Follow `COMMIT_PLAN.md` — the plan matches the merged history exactly:

```
9  ────────── C13  docs: design.md + finalize readme + commit plan
8  ────────── C12  chore: add lockfiles
7  ────────── C11  feat(frontend): history drawer + light theme + sample chips
6  ────────── C10  feat(backend): mongo persistence + history endpoints
5  ────────── C9   chore: dockerfiles + compose + sample fixtures
4  ────────── C8   feat(frontend): preview + processing + results
3  ────────── C7   feat(backend): batched extraction, validator, retry, sse
2  ────────── C6   feat(backend): crm schema + gemini/openai/mock providers
1  ────────── C5   feat(frontend): dropzone + upload step + state hook
0  ────────── C4   feat(frontend): vite + tailwind scaffold
   ────────── C3   feat(backend): csv parser service + unit tests
   ────────── C2   feat(backend): bootstrap express + config + logger
   ────────── C1   chore: init repo, add readme + gitignore
```

### If you're adding a new feature
1. Branch off `main`: `git checkout -b feat/<name>`.
2. Small, scoped commits — one feature per commit if possible.
3. Prefix: `feat(scope):`, `fix(scope):`, `chore:`, `docs:`, `refactor(scope):`.
4. Do NOT amend / rebase / force-push commits that are already on `main`.
5. Open a PR against `main`.

### Never commit
- `.env` files (already gitignored — verify with `git check-ignore backend/.env`)
- API keys, Mongo URIs, or any live secret
- `node_modules/`, `dist/`, `.DS_Store` (all gitignored)

---

## 6. Common tasks

### Bump the Gemini model
1. `backend/.env` → change `GEMINI_MODEL`
2. `backend/src/config/env.js` default (optional)
3. Restart the server.

### Change batch size / concurrency
`backend/.env`:
```
BATCH_SIZE=20
AI_CONCURRENCY=3
AI_MAX_RETRIES=2
```

### Add a new sample CSV to the landing chips
`frontend/src/constants/samples.js` — append a new entry to `SAMPLES`.

### Add a new CRM field
1. `backend/src/schemas/crm.schema.js` — extend `CRM_FIELDS` + Zod schema + both provider JSON schemas.
2. `backend/src/services/ai/prompt.js` — add the field description in the system prompt.
3. `backend/src/services/validator.service.js` — add normalization if needed.
4. `frontend/src/constants/crm.js` — mirror `CRM_FIELDS`.
5. Add a test in `backend/src/__tests__/validator.test.js`.

### Add a new `crm_status` enum
1. `backend/src/schemas/crm.schema.js` → `CRM_STATUS_VALUES`.
2. `frontend/src/constants/crm.js` → `STATUS_COLORS` + `FRIENDLY_STATUS`.
3. Prompt automatically picks up the new value.

---

## 7. Submission checklist

Before emailing `varun@groweasy.ai`:

- [ ] `git status` clean, `main` up to date on origin.
- [ ] `curl https://<render-url>/api/v1/health` returns `status: ok`.
- [ ] Vercel URL loads and can extract a sample CSV end-to-end.
- [ ] `npm test` green in `backend/`.
- [ ] `README.md` "Quick start" verified from a fresh clone.
- [ ] `design.md` up to date.
- [ ] `.env.example` has NO real secrets (blank `GEMINI_API_KEY`, blank `MONGODB_URI`).

Email skeleton:

```
To: varun@groweasy.ai
Subject: Software Developer (Intern) Assignment · Gaurav

Hi Varun,

Please find my submission for the Software Developer Intern role below:

• Hosted app:   https://<vercel>.vercel.app
• GitHub repo:  https://github.com/gaurav-init/assign-s
• Position:     Software Developer Intern

The README covers quick-start, docker-compose, deploy, and the API. design.md
walks through the brainstorming, architecture, and prompt strategy. Happy to
demo live on a call.

Thanks,
Gaurav
```

---

## 8. Known limitations & future work

- **Preview cache is in-memory** — a horizontally scaled backend needs Redis (currently 15-min TTL per-process).
- **No auth** — assumes trusted usage. Add JWT + per-user history for multi-tenant.
- **No AI cost visibility** — expose `usageMetadata.totalTokenCount` in the Results footer.
- **No column-mapping override UI** — power users may want to correct the AI's mapping before saving.
- **Streaming CSV parse** — `csv-parse/sync` reads the whole file into memory; swap for the streaming API to support > 10 MB uploads.

These are called out in `design.md §15` as deliberate v1 cuts, not bugs.
