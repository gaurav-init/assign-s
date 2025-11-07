# GrowEasy AI CSV Importer — Design Document

> **Status:** Design v1.1
> **Owner:** Software Developer Intern Assignment (GrowEasy)
> **Stack:** **React 19 + Vite** (JavaScript) + **Node.js 20 / Express** (JavaScript, ESM) + Gemini (with OpenAI/mock fallback) + MongoDB (persistence, optional)
> **Visual language:** *System Interface — Skeuomorphic Clean* (see §17)

---

## 17. Design System — Skeuomorphic Clean

Adapted from the Neuform "System Interface – Skeuomorphic Clean" template by
Meng To (@mengto). The aesthetic is **operational, dense, technical**: dark
background, high-contrast type, sharp corners, mono + serif combo, tactile
skeuomorphic surfaces without gloss.

### 17.1 Colors (design tokens)

| Role | Hex | Usage |
|---|---|---|
| `primary` | `#FFB900` | Primary calls-to-action, highlights, active state |
| `accent` | `#F78200` | Secondary highlights, hover, gradients with primary |
| `secondary` | `#000000` | Deepest black — used sparingly for pure contrast |
| `background` | `#000000` | Root canvas |
| `surface` | `#521111` | Signature deep-red surface for hero panels + featured cards |
| `surface-2` | `#0d0d0d` | Neutral surface for dense grids / tables |
| `surface-3` | `#141414` | Elevated card interior |
| `text-primary` | `#FFFFFF` | Body and headline text |
| `text-secondary` | `#A1A1AA` | Muted labels, metadata |
| `border` | `#A3A3A3` at 20 % | Hairline dividers (rgba `163,163,163,0.2`) |

**Chroma spectrum** — used for status chips and semantic accents:

| Name | Hex | Semantic in this app |
|---|---|---|
| Green | `#5EBD3E` | `GOOD_LEAD_FOLLOW_UP`, imported count |
| Yellow | `#FFB900` | Primary, retries, warnings |
| Orange | `#F78200` | Accent, active batch |
| Red | `#E23838` | `BAD_LEAD`, failed batches, skipped |
| Purple | `#973999` | `SALE_DONE`, source: sarjapur_plots |
| Blue | `#009CDF` | `DID_NOT_CONNECT`, informational |

### 17.2 Typography

- **DM Mono** — display headers, labels, metadata, table cells, all technical /
  system text. Weights: 400, 500.
- **Instrument Serif** — body copy, hero headline, descriptive paragraphs.
  Italic used for emphasis inside serif runs.
- **Inter** — silent fallback for platform UI (buttons, form controls) — kept
  compact, only where a sans face is unavoidable.

| Token | Font | Size | Line-height | Tracking |
|---|---|---|---|---|
| `display-lg` | Instrument Serif | 56 – 72 px | 1.05 | −0.02em |
| `display-md` | Instrument Serif | 40 px | 1.1 | −0.015em |
| `heading` | DM Mono 500 | 14 – 16 px | 1.3 | 0.02em, uppercase |
| `body-md` | Instrument Serif | 16 px | 1.55 | 0 |
| `label-md` | DM Mono 500 | 11 – 12 px | 1.2 | 0.08em, uppercase |
| `mono-sm` | DM Mono 400 | 11 – 12 px | 1.35 | 0 |

### 17.3 Spacing scale

Follows the source: **8 / 16 / 24 / 40 / 64 / 80 px**. Cards use **24 px**
padding, sections **80 px**. Grid gap defaults to **16 px**.

### 17.4 Radius

| Token | Radius | Applied to |
|---|---|---|
| `card` | **2 px** | Cards, table container, drawer panels |
| `control` | **4 px** | Buttons, inputs, dropdown menus |
| `pill` | **9999 px** | Status chips, badges, dot markers |

Sharp corners are intentional — a defining feature of the source system. Do
not soften them.

### 17.5 Elevation — Skeuomorphic tactile shadows

Instead of soft drop shadows, we combine an **outer shadow** with an **inner
highlight** to give surfaces a tactile / etched feel.

```css
/* card, default */
box-shadow:
  0 1px 0 0 rgba(255, 255, 255, 0.06) inset,       /* top inner highlight */
  0 0 0 1px rgba(163, 163, 163, 0.14),             /* hairline ring */
  0 8px 24px -12px rgba(0, 0, 0, 0.8);             /* soft ambient */

/* button, primary (yellow) */
box-shadow:
  0 1px 0 0 rgba(255, 255, 255, 0.35) inset,       /* top bevel */
  0 -1px 0 0 rgba(0, 0, 0, 0.25) inset,            /* bottom shadow */
  0 6px 20px -6px rgba(255, 185, 0, 0.6);          /* colored glow */

/* button, pressed */
transform: translateY(1px);
box-shadow:
  0 0 0 1px rgba(0, 0, 0, 0.35) inset,
  0 2px 8px -2px rgba(0, 0, 0, 0.6);
```

### 17.6 Signature motifs

- **Bento layout** — dense grid of small cards with numeric metrics.
- **Module IDs** — cards labeled `MODULE_A1`, `CORE_GRID`, `CLUSTER_ONE`, etc.
  in DM Mono uppercase. We reuse this pattern for `MODULE_UPLOAD`,
  `MODULE_PREVIEW`, `MODULE_EXTRACT`, `MODULE_RESULTS`.
- **Spectrum bar** — six-swatch chroma row referenced as a legend for status
  colors on the Results screen.
- **Hairline dividers** — 1-px lines at `rgba(163,163,163,0.14)`; the ONLY
  border language.
- **Dotted / cross-hair grid background** — subtle `#1a1a1a` dots on the
  `#000` canvas at 24-px spacing.
- **Sharp corners + inner-top highlight** everywhere — the "skeuomorphic clean"
  contract.

### 17.7 Motion

Restrained. Masked reveals + staggered fade-up for cards. Buttons: `translateY(1px)`
on press, no scale. Hover: 1-px yellow ring, no glow bloom. Ambient auroras are
retired in favor of a static dotted grid.

### 17.8 Guardrails

- Never flatten to a generic card grid — preserve the operational density.
- Never round card corners above 2 px.
- Never use gradients on body text; gradient only appears on the primary CTA and
  on the display headline's accent word.
- Deep-red `#521111` is a signature — use it on the hero panel and on the
  active-step marker. Do not scatter it as a generic accent.
- All technical / metadata labels are DM Mono UPPERCASE with `0.08em` tracking.

---


---

## 1. Problem Framing

Build an **AI-powered CSV Importer** for GrowEasy CRM. Users upload CSVs from *any* source
(Facebook Lead Export, Google Ads, Excel, Real-Estate CRM exports, marketing agency
exports, hand-rolled spreadsheets). Column names, ordering, casing, delimiters, and
value formats are all unpredictable. The system must:

1. Ingest the raw CSV.
2. Preview it exactly as uploaded (no AI yet — user validates first).
3. On confirmation, send the records to an LLM.
4. The LLM intelligently maps columns → canonical GrowEasy CRM fields, cleans values,
   enforces enum constraints, and merges spillover into `crm_note`.
5. Backend returns structured JSON: imported records + skipped records + counts.

**The value is in the AI prompting**, not the CSV parsing. That is what the assignment
explicitly calls out as the differentiator, and where we invest most of the design
effort.

---

## 2. Brainstorming — Approaches Considered

### 2.1 Approach A — Rule-based header matching (rejected)
Maintain a big alias dictionary (`"mobile", "phone", "contact_no", "phone_num", ...`).
Fast, cheap, deterministic. **Rejected** because:
- Fails on non-English or bespoke column names.
- Can't reason about value semantics (e.g., a column called `notes` containing an email).
- Can't intelligently split `+91 98765...` into `country_code` + `mobile_without_country_code`.
- The assignment explicitly wants AI-driven mapping.

### 2.2 Approach B — Two-phase: AI header-map, then row transform (rejected)
Ask AI once: "which source column maps to which CRM field?" Then transform locally.
- Cheap (one AI call per file).
- But loses per-row intelligence — can't detect that row 42 has the phone number
  buried in the `notes` column while row 43 has it in `contact`.
- Can't apply enum normalization per-cell.

### 2.3 Approach C — Per-record AI extraction, batched (chosen)
Send N records at a time to the LLM with a strict JSON schema prompt. LLM returns
extracted records + skip reasons. Then aggregate.
- Robust across messy per-row data.
- Batch size tunable (default 20) — balances context vs. throughput.
- Naturally supports parallel batches, retry per-batch, streaming progress.
- Cost: N/batch_size LLM calls per file. Acceptable.

**Decision: Approach C.**

### 2.4 Approach D — Hybrid: header map + per-row cleanup (considered, deferred)
Best long-term for cost, but adds complexity for a take-home. Documented for future.

---

## 3. Canonical CRM Schema

Extracted per record:

| Field | Type | Notes |
|---|---|---|
| `created_at` | ISO string / date-parseable | Must satisfy `new Date(x)` |
| `name` | string | |
| `email` | string | Primary; extras → `crm_note` |
| `country_code` | string | e.g. `+91`, `91`, `1` — normalize with leading `+` optional |
| `mobile_without_country_code` | string | Digits only |
| `company` | string | |
| `city` / `state` / `country` | string | |
| `lead_owner` | string | Often an email or name |
| `crm_status` | enum | `GOOD_LEAD_FOLLOW_UP` \| `DID_NOT_CONNECT` \| `BAD_LEAD` \| `SALE_DONE` |
| `crm_note` | string | Catch-all for remarks + spillover |
| `data_source` | enum | `leads_on_demand` \| `meridian_tower` \| `eden_park` \| `varah_swamy` \| `sarjapur_plots` — else blank |
| `possession_time` | string | |
| `description` | string | |

**Validation rules (backend-enforced after AI response):**
1. Skip record if BOTH `email` and `mobile_without_country_code` are missing.
2. `crm_status` must be one of the 4 enum values or `null`.
3. `data_source` must be one of the 5 enum values or blank.
4. `created_at` must round-trip through `new Date()`.
5. Newlines in string fields escaped as `\n` (single CSV row remains valid).

---

## 4. Architecture

```
┌────────────────────┐        upload         ┌───────────────────────────┐
│   Next.js 14 App   │ ────────────────────▶ │  Express API (Node 20)    │
│  (React 18, TS)    │                       │                           │
│                    │  SSE progress stream  │  ┌─────────────────────┐  │
│  - Dropzone        │ ◀──────────────────── │  │ CSV Parser Service  │  │
│  - Preview Table   │                       │  └─────────────────────┘  │
│  - Confirm         │  JSON result          │  ┌─────────────────────┐  │
│  - Results Table   │ ◀──────────────────── │  │ Batch Processor     │  │
│                    │                       │  └─────────────────────┘  │
└────────────────────┘                       │  ┌─────────────────────┐  │
                                             │  │ AI Extraction Svc   │──┼──▶ OpenAI / Gemini
                                             │  └─────────────────────┘  │
                                             │  ┌─────────────────────┐  │
                                             │  │ Prompt Builder      │  │
                                             │  └─────────────────────┘  │
                                             │  ┌─────────────────────┐  │
                                             │  │ Validator (Zod)     │  │
                                             │  └─────────────────────┘  │
                                             └───────────────────────────┘
```

**Backend is stateless.** No DB required. Each request self-contained. This makes
horizontal scaling trivial (Railway, Render, Fly, containers).

---

## 5. API Design

Base URL: `${BACKEND_URL}/api/v1`

### `POST /imports/parse`
Parses (no AI). Multipart form. Returns preview rows + inferred columns.

**Request:** `multipart/form-data` with `file: <csv>`
**Response 200:**
```json
{
  "importId": "imp_9f3...",

  
  "columns": ["created_at","name","email","phone",...],
  "rowCount": 152,
  "previewRows": [ { "created_at": "2026-...", ... }, ... ],
  "rawCsvBase64": "..."   // returned so client can re-submit without re-uploading
}
```

Alternative (chosen): the client keeps the parsed rows in memory and re-sends them
on confirm, or the server holds them in a short-lived in-memory cache keyed by
`importId` with a 15-minute TTL. **We use the in-memory cache** — simpler client,
still stateless across restarts (acceptable for a homework).

### `POST /imports/:importId/extract`
Kicks off AI extraction. Client picks streaming or JSON.

**Query:** `?stream=true` → SSE. Default: JSON.
**Response 200 (JSON):**
```json
{
  "importId": "imp_...",
  "totalRows": 152,
  "imported": [ /* canonical CRM records */ ],
  "skipped": [ { "rowIndex": 3, "reason": "no email/mobile", "raw": {...} } ],
  "counts": { "imported": 148, "skipped": 4, "total": 152 },
  "batches": { "total": 8, "succeeded": 8, "failed": 0, "retries": 1 }
}
```

**SSE event stream:**
```
event: progress
data: {"batchIndex":0,"total":8,"status":"processing"}

event: batch_done
data: {"batchIndex":0,"imported":18,"skipped":2}

event: done
data: { ...full result payload... }

event: error
data: {"message":"..."}
```

### `GET /health`
Simple health check for platform.

### Error contract
All errors are structured:
```json
{ "error": { "code": "INVALID_CSV", "message": "...", "details": {...} } }
```
Error codes: `INVALID_FILE`, `INVALID_CSV`, `IMPORT_NOT_FOUND`, `AI_UPSTREAM_FAILED`, `RATE_LIMITED`, `INTERNAL`.

---

## 6. AI Prompting Strategy

The prompt is the product. Design principles:

1. **System prompt** encodes the schema, enums, and rules **exactly once** and is
   cached (OpenAI prompt caching / Gemini system instructions).
2. **User prompt** contains only the batch of raw rows as JSON (short, cache-miss
   is only the delta).
3. **Structured output**: OpenAI `response_format: { type: "json_schema" }` with a
   strict schema forces valid JSON. Gemini uses `responseSchema`.
4. **Enum enforcement** in the schema itself — the model literally cannot emit an
   invalid `crm_status`.
5. **`skipped` array is part of the schema** — the model reports its own skips
   with reasons, and we cross-check server-side.
6. **`_reasoning` field per record** (dropped before sending to client) — used
   during dev to debug misclassifications.

Prompt outline:
```
SYSTEM:
You are a CRM lead extraction engine. You will receive raw CSV rows from arbitrary
sources. Extract each row into the GrowEasy canonical CRM format.

RULES:
- Map columns semantically, not by name. Prefer value semantics over header hints.
- created_at: MUST be parseable by `new Date(x)`. If ambiguous, normalize to ISO 8601.
- name: full name. Combine first+last if split.
- email: PRIMARY email only. Any extra emails → append to crm_note as "Additional emails: a@b.com, c@d.com".
- Phone: split into country_code (with leading '+') and mobile_without_country_code (digits only). Extras → crm_note.
- crm_status: ONLY {GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE}. Map free text like "closed" → SALE_DONE, "not interested" → BAD_LEAD, "busy" → DID_NOT_CONNECT, "follow up" → GOOD_LEAD_FOLLOW_UP. If unclear, null.
- data_source: ONLY {leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots}. If none match confidently, "".
- crm_note: absorb remarks, notes, extra emails/phones, and any info that doesn't fit a canonical field.
- Newlines in strings must be escaped as \n.
- Skip a record ONLY when BOTH email AND mobile are missing. Record it in skipped[] with reason.
- Do not invent data. Missing fields → null.

Return JSON: { extracted: CRMRecord[], skipped: {rowIndex, reason}[] }.

USER:
[
  { "_rowIndex": 0, "Full Name": "John Doe", "Contact": "+91 98765 43210", ... },
  ...
]
```

### 6.1 Batching
- Default batch size: **20 rows** (tunable via env). Balances context and cost.
- Batches processed with a small concurrency pool (default 3) — respects rate limits.
- Each batch call includes `_rowIndex` so we can correlate outputs even if the
  model reorders.

### 6.2 Retry
- Per batch: up to 2 retries on 5xx / timeout / malformed JSON, exponential
  backoff (500ms → 1500ms).
- On final failure, batch's rows go to `skipped[]` with `reason: "ai_batch_failed"`.
- Progress stream reports retries so UI can show them.

### 6.3 Validation & post-processing
After the LLM returns, backend Zod-validates every record:
- Coerces enums; unknown → null / "".
- Verifies `created_at` with `new Date`.
- Enforces the "must have email OR mobile" rule (belt-and-suspenders).
- Normalizes country_code to `+XX`.
- Strips control characters, collapses whitespace.

---

## 7. Frontend UX Flow

**Design language:** Modern, glassmorphic, subtle gradients, dark-mode-first. Font
stack: Inter / Geist. Tailwind + shadcn-inspired primitives + Framer Motion.

### Screens
1. **Upload** — full-page hero, gradient background, animated dropzone.
   - Drag & drop with dashed border → glow on hover.
   - Or click to open picker.
   - File type + size validation (`.csv`, max 10 MB).
   - Sample template download link.

2. **Preview** — split view.
   - Left: file metadata card (name, size, row count, column count).
   - Right: virtualized scrollable table (sticky header, both scroll axes).
   - Bottom bar: `Cancel` / `Confirm & Import with AI` (primary CTA).

3. **Processing** — in-place progress card.
   - Overall progress bar + per-batch chip grid (pending/processing/done/failed).
   - Streams via SSE; retries shown as amber chips.
   - Cancel button aborts the in-flight fetch (`AbortController`).

4. **Results** — two-tab view.
   - **Imported** tab: virtualized canonical table.
   - **Skipped** tab: rows + reasons.
   - Summary strip: `✓ 148 imported · ✗ 4 skipped · 8 batches · 1 retry`.
   - Export: `Download CSV` (canonical format), `Download JSON`.
   - `Import another file` returns to step 1.

### Components (shadcn-style, custom-built)
- `Dropzone`, `Button`, `Card`, `Tabs`, `Table`, `ProgressBar`, `Badge`, `Toast`,
  `ThemeToggle`, `StatPill`.

### State machine
```
idle → uploading → preview → confirming → processing → done
                     ↑                        ↓
                     └──── cancel ────────────┘
```
Managed with a simple `useReducer` in `useImportFlow` hook.

### Accessibility
- All interactive elements keyboard-navigable.
- Dropzone announces state changes via `aria-live`.
- Contrast ratio ≥ 4.5 in both themes.

### Responsive
- Mobile: single column, table becomes horizontally scrollable card.
- Desktop ≥ 1024px: two-column preview.

---

## 8. Folder Structure

```
assignment/
├── design.md
├── README.md
├── docker-compose.yml
├── .gitignore
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── .env.example
│   └── src/
│       ├── index.ts                  # bootstrap
│       ├── app.ts                    # express app assembly
│       ├── config/
│       │   └── env.ts                # zod-parsed env
│       ├── routes/
│       │   ├── index.ts
│       │   ├── health.route.ts
│       │   └── imports.route.ts
│       ├── controllers/
│       │   └── imports.controller.ts
│       ├── services/
│       │   ├── csv-parser.service.ts
│       │   ├── import-store.service.ts   # in-memory TTL cache
│       │   ├── batch-processor.service.ts
│       │   ├── ai/
│       │   │   ├── ai-client.ts          # provider-agnostic interface
│       │   │   ├── openai.provider.ts
│       │   │   ├── gemini.provider.ts
│       │   │   └── prompt.ts             # system+user prompt builders
│       │   └── validator.service.ts
│       ├── schemas/
│       │   └── crm.schema.ts             # Zod schemas
│       ├── middleware/
│       │   ├── error.middleware.ts
│       │   ├── upload.middleware.ts      # multer
│       │   └── request-id.middleware.ts
│       ├── utils/
│       │   ├── logger.ts
│       │   ├── sse.ts
│       │   └── retry.ts
│       └── __tests__/
│           ├── csv-parser.test.ts
│           ├── validator.test.ts
│           └── prompt.test.ts
└── frontend/                                # Vite + React 19 (JavaScript)
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    ├── Dockerfile
    ├── nginx.conf
    ├── .env.example
    └── src/
        ├── main.jsx                          # React root
        ├── App.jsx                           # top-level shell
        ├── index.css                         # tailwind + globals
        ├── components/
        │   ├── ui/                           # primitives (Button, Card, Table, ...)
        │   ├── flow/
        │   │   ├── UploadStep.jsx
        │   │   ├── PreviewStep.jsx
        │   │   ├── ProcessingStep.jsx
        │   │   └── ResultsStep.jsx
        │   ├── layout/
        │   │   ├── AppShell.jsx
        │   │   └── ThemeToggle.jsx
        │   └── shared/
        │       ├── Dropzone.jsx
        │       ├── DataTable.jsx
        │       └── StatPill.jsx
        ├── hooks/
        │   ├── useImportFlow.js
        │   ├── useTheme.js
        │   └── useSSE.js
        ├── lib/
        │   ├── api.js
        │   ├── csv.js
        │   └── cn.js
        └── constants/
            └── crm.js
```

---

## 9. Tech Choices — Rationale

| Choice | Why |
|---|---|
| **React 19 + Vite** | Applicant explicitly requested React (not Next.js). Vite gives sub-second dev HMR and a lean production build; ideal for a client-heavy SPA like this. |
| **JavaScript (ESM)** | Per applicant preference. JSDoc annotations where non-obvious for IDE type hints. |
| **React Router v6** | Not strictly needed (single flow) but wired for future multi-page growth. |
| **TailwindCSS v3** | Fastest way to hit "modern UI" bar; small bundle when purged. |
| **Framer Motion** | Micro-interactions (dropzone glow, tab transitions) with zero fuss. |
| **shadcn-style primitives** | We hand-roll a lean set instead of pulling shadcn CLI — full control, no bloat. |
| **Express 4** | Assignment specifies. Battle-tested. |
| **Zod** | Runtime validation. Used for env, request bodies, and the LLM response schema itself. |
| **Multer** | Standard Express file upload. |
| **csv-parse** | Streaming CSV parser, handles quoted commas, BOM, embedded newlines. |
| **OpenAI GPT-4o-mini** | Cheap ($0.15/M input), fast, supports JSON schema mode. Fallback: Gemini 2.5 Flash. |
| **In-memory store** | Homework; keeps backend stateless-per-process, no DB dep. Would be Redis in prod. |
| **SSE (not WebSocket)** | Server → client only; simpler, works through proxies, no lib needed. |
| **Vitest** | Fast, ESM-native, jest-compatible API. |

---

## 10. Edge Cases & Handling

| Case | Handling |
|---|---|
| Empty CSV | 400 `INVALID_CSV` — "no rows". |
| Header row only | Same as above. |
| BOM at start | csv-parse strips. |
| Semicolon / tab delimiter | csv-parse auto-detects when `delimiter: undefined`. |
| Embedded quotes/commas | csv-parse handles per RFC 4180. |
| Non-UTF8 | Rejected with clear error; users prompted to re-save as UTF-8. |
| Very wide (100+ cols) | Preview clipped to first 25 cols with "+N more" chip. |
| Very tall (10k+ rows) | Preview shows first 100 rows; processing runs on the full set with virtualized results table. |
| LLM returns fewer records than sent | We cross-index by `_rowIndex`; missing rows land in `skipped` with reason `ai_missing_row`. |
| LLM returns malformed JSON | Retry with exponential backoff, then skip the batch. |
| Duplicate emails within upload | Kept; no dedup (product decision — the CRM handles that). |
| Race: same importId requested twice | Second call gets the cached result; extraction is idempotent per import. |
| File larger than 10 MB | Rejected client-side and server-side (`multer` limit). |
| API key missing at boot | Fail fast in `config/env.ts`. |
| SSE stream aborted client-side | Server detects `req.on('close')` and cancels the batch pool. |

---

## 11. Performance

- **CSV parsing**: streamed; O(n) memory in row count only for the preview cache.
- **AI batches**: parallelism cap of 3 (env-tunable). At batch size 20, that's
  60 rows in flight — comfortable within OpenAI TPM for 4o-mini.
- **Frontend table**: virtualized (`@tanstack/react-virtual`) so 10k+ rows render at 60fps.
- **Bundle size target**: < 200 KB gzipped for the initial route.

---

## 12. Security

- File type check (magic bytes + mime + extension).
- Size cap (10 MB).
- No SQL, no eval, no template injection paths.
- CORS locked to configured frontend origin.
- API key stays server-side only.
- Rate-limit: 30 req/min/IP on `/imports/*` (in-memory bucket — Redis in prod).

---

## 13. Testing

- **Unit tests** (Vitest, backend):
  - CSV parser edge cases (delimiters, quotes, BOM).
  - Validator (enum coercion, skip logic, phone splitting).
  - Prompt builder deterministic output for same input.
- **Integration test**: end-to-end mock — inject a stub AI provider, POST a
  fixture CSV, assert canonical output.
- **Manual test corpus**: `backend/__tests__/fixtures/` with
  `facebook_lead_export.csv`, `google_ads.csv`, `messy_realestate.csv`,
  `edge_case_multi_email.csv`.

---

## 14. Deployment

| Piece | Target |
|---|---|
| Frontend | Vercel (Next.js native) |
| Backend | Railway or Render (Node + Docker) |
| Env vars | `OPENAI_API_KEY`, `FRONTEND_ORIGIN`, `BATCH_SIZE`, `AI_CONCURRENCY` |

`docker-compose.yml` lets a reviewer spin up both services locally with one
command.

---

## 15. What's NOT in v1 (deliberate cuts)

- User auth (out of scope).
- Persisting imports to a DB (in-memory only).
- Column mapping UI (users could override the AI) — nice-to-have.
- Multi-file batch import.
- i18n.

These are documented so a reviewer knows they were considered, not forgotten.

---

## 16. Success Criteria (mapped to the rubric)

| Rubric item | How we address it |
|---|---|
| AI prompt engineering | §6 — schema-constrained JSON, per-row batching, enum enforcement, retry, cross-indexed. |
| Backend quality | Layered arch (routes → controllers → services), Zod schemas, structured errors, batch pool, tests. |
| Frontend quality | 4-step flow, dropzone, sticky/virtualized tables, dark mode, SSE progress, toasts, keyboard nav. |
| Code quality | TS everywhere, single-responsibility modules, no dead code, prettier + eslint. |
| Overall engineering | Docker, README, deploy targets, edge-case handling, health check, request IDs. |
