# GrowEasy · AI CSV Importer

An intelligent CSV importer for the GrowEasy CRM. Drop in **any** lead CSV —
Facebook Lead Export, Google Ads Export, Excel, real-estate CRM dumps, marketing
agency exports, hand-rolled spreadsheets — and the system uses an LLM to
extract, clean, and normalize every row into GrowEasy's canonical schema. No
manual column mapping.

- 📄 **Design & brainstorming:** [`design.md`](./design.md)
- 🗓 **Commit plan for the 2-day window:** [`COMMIT_PLAN.md`](./COMMIT_PLAN.md)
- 🎨 **Frontend:** React 19 + Vite + Tailwind + Framer Motion (`frontend/`)
- ⚙️ **Backend:** Node.js 20 + Express + Zod (`backend/`)
- 🗃 **Persistence:** MongoDB (optional — Atlas or local)
- 🤖 **LLM:** Google **Gemini 3.1 Flash-Lite** (default). Pluggable OpenAI + mock providers.

---

## Features

**Frontend**
- Drag-and-drop upload with sticky-header, virtualized preview and results
  tables (`@tanstack/react-virtual`).
- Four-step guided flow: **Upload → Preview → Confirm → Results**.
- **Light and dark** themes, dark by default.
- Live **per-batch progress**, retry chips and skip reasons via SSE.
- Search / filter, JSON + CSV export of the extracted leads.
- **History drawer** — every past import is saved to Mongo, click to replay.
- Fully **responsive** down to mobile.
- Keyboard-navigable, ARIA-labeled, focus rings, `prefers-color-scheme`.

**Backend**
- Clean layered architecture — `routes → controllers → services`.
- **Batched** LLM extraction with a concurrency pool (`p-limit`).
- **Retry** with exponential backoff on transient failures.
- **Streaming** SSE progress events, or a single-shot JSON response.
- Server-side **Zod** validation of every returned record (enum whitelists,
  phone normalization, date coercion, newline escaping).
- Multi-provider (`gemini` | `openai` | `mock`) chosen via env.
- CORS, Helmet, in-memory rate limit, structured error contract, request IDs,
  health check with provider + persistence status.
- **Vitest** unit tests for parser, validator, prompt builder, batch processor.

---

## The extraction pipeline

Rule-based header matching fails on unfamiliar exports. Instead, on **Confirm**
the backend:

1. Splits the rows into batches of **20** (tunable via `BATCH_SIZE`).
2. For each batch, sends the raw rows as JSON to Gemini with a **strict
   response schema** and a system prompt that:
   - Lists every allowed `crm_status` and `data_source` enum value.
   - Instructs the model to map by **meaning**, not by header name.
   - Splits phone numbers into `country_code` + `mobile_without_country_code`.
   - Absorbs extra emails, extra phones, remarks, follow-up notes into `crm_note`.
   - Reports its own skipped rows with reasons.
3. Runs up to `AI_CONCURRENCY` batches in parallel with `AI_MAX_RETRIES`.
4. Every returned record is **re-validated** by Zod — enums are coerced, phones
   normalized, `created_at` round-tripped through `new Date()`, newlines
   escaped, and the "must have email OR mobile" skip rule is re-enforced.

See [`design.md`](./design.md) for the full prompt strategy and rationale.

---

## Quick start (local)

### 0. Prerequisites
- **Node.js 20+**
- **npm 10+**
- A **Gemini API key** (free tier is enough): https://aistudio.google.com/apikey
- *(optional)* MongoDB running locally (`brew install mongodb-community`) — or an Atlas cluster URL

### 1. Backend

```bash
cd backend
cp .env.example .env
# open .env and paste GEMINI_API_KEY
# leave MONGODB_URI blank to run stateless, or set to mongodb://localhost:27017/groweasy
npm install
npm run dev
# → API listening on http://localhost:8080
```

### 2. Frontend (new terminal)

```bash
cd frontend
cp .env.example .env      # VITE_BACKEND_URL=http://localhost:8080
npm install
npm run dev
# → App on http://localhost:5173
```

Open http://localhost:5173, drag one of the fixtures from [`samples/`](./samples/)
onto the dropzone (or use the **Try a sample** chips), and watch the extraction.

### 3. Run without an API key

Set `AI_PROVIDER=mock` in `backend/.env`. This uses a bundled deterministic
heuristic mapper — good enough to demo the whole flow end-to-end without
any keys.

---

## Docker Compose

```bash
# from repo root:
export GEMINI_API_KEY=YOUR_KEY_HERE
docker compose up --build
```

- Backend → http://localhost:8080
- Frontend → http://localhost:5173

---

## Tests

```bash
cd backend
npm test
```

Covers:
- CSV parsing (comma / semicolon / quoted / BOM / ragged rows)
- Record validation (enums, skip rule, phone/date normalization, newline escaping)
- Prompt construction (all enums present, row indices preserved)
- End-to-end batched extraction (via the mock provider)

Current status: **22 / 22 passing**.

---

## Deployment

| Piece | Platform | Notes |
|---|---|---|
| Backend | **Render** or **Railway** | Node service; set `GEMINI_API_KEY`, `FRONTEND_ORIGIN`, `MONGODB_URI`. |
| Frontend | **Vercel** | Framework preset: **Vite**. Set `VITE_BACKEND_URL` to the backend URL. Build: `npm run build`. Output: `dist`. |

Both are also plain-Docker deployable via the included `Dockerfile`s or
`docker-compose.yml`.

---

## Project layout

```
assignment/
├── design.md                # brainstorming + architecture + rationale
├── COMMIT_PLAN.md           # 2-day submission commit schedule
├── docker-compose.yml
├── samples/                 # heterogeneous CSVs for testing
│   ├── reference-groweasy.csv
│   ├── facebook-lead-export.csv
│   ├── google-ads-export.csv
│   ├── messy-realestate.csv         # semicolon delimiter, split names, junk rows
│   ├── marketing-agency.csv         # int'l phones, multi-email
│   └── multi-email-multi-phone.csv  # tests spillover into crm_note
│
├── backend/                 # Node 20 + Express (ESM, JavaScript)
│   ├── src/
│   │   ├── index.js         # bootstrap
│   │   ├── app.js           # express assembly
│   │   ├── config/env.js    # zod-parsed env
│   │   ├── routes/          # health, imports
│   │   ├── controllers/     # request handlers
│   │   ├── services/
│   │   │   ├── csv-parser.service.js
│   │   │   ├── batch-processor.service.js
│   │   │   ├── validator.service.js
│   │   │   ├── import-store.service.js   # in-memory TTL cache
│   │   │   ├── mongo.service.js          # lazy Mongo connection
│   │   │   ├── history.service.js        # persistence layer
│   │   │   └── ai/
│   │   │       ├── ai-client.js          # provider dispatch
│   │   │       ├── prompt.js             # system + user prompts
│   │   │       ├── gemini.provider.js    # Gemini 3.1 Flash-Lite
│   │   │       ├── openai.provider.js    # GPT-4o-mini
│   │   │       └── mock.provider.js      # deterministic offline mapper
│   │   ├── schemas/crm.schema.js
│   │   ├── middleware/      # error, upload, request-id, rate-limit
│   │   ├── utils/           # logger, sse, retry, errors
│   │   └── __tests__/       # vitest specs
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
└── frontend/                # Vite + React 19 (JavaScript)
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── index.css
    │   ├── components/
    │   │   ├── ui/          # Button, Card, Badge, Tabs, ProgressBar, StepIndicator, EmptyState, StatPill
    │   │   ├── shared/      # Dropzone, DataTable (virtualized)
    │   │   ├── layout/      # AppShell, ThemeToggle, HistoryDrawer
    │   │   └── flow/        # UploadStep, PreviewStep, ProcessingStep, ResultsStep, ErrorStep
    │   ├── hooks/           # useImportFlow (state machine), useTheme
    │   ├── lib/             # api (fetch + SSE parser), csv, cn
    │   └── constants/       # crm fields, sample CSVs
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── Dockerfile           # multi-stage → nginx
    ├── nginx.conf
    └── .env.example
```

---

## API

Base URL: `${BACKEND_URL}/api/v1`

### `GET /health`
Returns provider + model + persistence status.

### `POST /imports/parse`
- **Body:** `multipart/form-data` with `file=<csv>`
- **Response:** `{ importId, columns, rowCount, previewRows, ... }`

### `POST /imports/:importId/extract`
- **Query:** `?stream=true` → SSE. Otherwise JSON.
- **Response (JSON):**
  ```json
  {
    "importId": "imp_...",
    "totalRows": 152,
    "imported": [ /* canonical CRM records */ ],
    "skipped":  [ { "rowIndex": 3, "reason": "no email or mobile" } ],
    "counts":   { "imported": 148, "skipped": 4, "total": 152 },
    "batches":  { "total": 8, "succeeded": 8, "failed": 0, "retries": 1 }
  }
  ```
- **SSE events:** `start`, `batch_start`, `batch_retry`, `batch_done`, `batch_failed`, `done`, `result`, `error`.

### `GET /imports/history`
Returns the list of past imports (Mongo). Empty when persistence is off.

### `GET /imports/history/:importId`
Full record with imported + skipped payloads.

### Error contract
```json
{ "error": { "code": "INVALID_CSV", "message": "...", "details": {} } }
```
Codes: `INVALID_FILE`, `INVALID_CSV`, `IMPORT_NOT_FOUND`, `AI_UPSTREAM_FAILED`, `RATE_LIMITED`, `INTERNAL`.

---

## Environment variables

### Backend (`backend/.env`)
| Var | Default | Notes |
|---|---|---|
| `PORT` | `8080` | |
| `NODE_ENV` | `development` | |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | Comma-separated for multi-origin |
| `AI_PROVIDER` | `gemini` | `gemini` \| `openai` \| `mock` |
| `GEMINI_API_KEY` | — | required if provider = gemini |
| `GEMINI_MODEL` | `gemini-3.1-flash-lite` | Cheapest current-gen model |
| `OPENAI_API_KEY` | — | required if provider = openai |
| `OPENAI_MODEL` | `gpt-4o-mini` | |
| `BATCH_SIZE` | `20` | Rows per LLM call |
| `AI_CONCURRENCY` | `3` | Parallel batches |
| `AI_MAX_RETRIES` | `2` | Per batch |
| `AI_TIMEOUT_MS` | `45000` | Per batch |
| `MAX_UPLOAD_MB` | `10` | |
| `IMPORT_CACHE_TTL_MIN` | `15` | In-memory preview cache TTL |
| `MONGODB_URI` | — | leave blank to run stateless |
| `MONGODB_DB` | `groweasy` | |

### Frontend (`frontend/.env`)
| Var | Default | Notes |
|---|---|---|
| `VITE_BACKEND_URL` | `http://localhost:8080` | Backend base URL |

---

## Evaluation-criteria coverage

| Criterion | Where |
|---|---|
| Field extraction accuracy | `services/ai/prompt.js` + Gemini `responseSchema` |
| Intelligent field mapping | Prompt: "map by MEANING, not by column name" + mock fallback |
| Messy datasets | Preview tolerates any layout; validator re-cleans every LLM output |
| Ambiguous columns | LLM decides per-row; skip-rule is a hard server check |
| API design | Layered, structured errors, SSE + JSON, request IDs |
| Batch processing | `services/batch-processor.service.js` — pool, retry, cross-index |
| Error handling | `middleware/error.middleware.js` + `utils/errors.js` |
| Modern UI | Framer-Motion, gradient hero, glassmorphism, dark + light |
| Responsive layout | Tailwind breakpoints throughout; mobile-first grids |
| CSV preview | Virtualized sticky-header table, dual-axis scroll |
| Loading states | Dropzone spinner, per-batch chip grid, progress bar |
| Reusability | UI primitives split, hooks isolated |
| Docker + deploy docs | `docker-compose.yml`, Dockerfiles, README |
| Unit tests | `backend/src/__tests__/` — 22 passing |

Bonus items done: drag & drop, progress indicators, streaming, retry mechanism,
virtualized table, dark mode (+ light mode extra), unit tests, Docker,
MongoDB persistence.

---

## License

MIT
