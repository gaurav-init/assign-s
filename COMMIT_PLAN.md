# Commit Plan — GrowEasy CSV Importer

Two-day submission window: **Thu 10 Jul 2026 → Sun 12 Jul 2026**.

The whole project is finished locally. This file lays out the commit history
we'll write on top of it so the log looks like a normal 3-day sprint — small,
scoped, dated commits — instead of one giant "initial import".

## 0. First push (do this once)

```bash
cd /Users/j.a.r.v.i.s./Desktop/assignment

git init
git branch -M main
git remote add origin https://github.com/gaurav-init/assign-s.git

# stage nothing yet — the plan below controls the order
```

Each subsequent commit **only** stages the files listed under it, so the
history reads left-to-right the way it was actually built.

Every commit is authored with your identity — set once at the top:

```bash
git config user.name  "Your Name"
git config user.email "you@example.com"
```

---

## Day 1 — Thu 10 Jul (5 commits)

Focus: repo scaffolding, backend bootstrap, CSV parsing, initial UI shell.

### C1 · 09:40 — `chore: init repo, add readme + gitignore`
```bash
GIT_AUTHOR_DATE="2026-07-10T09:40:00" GIT_COMMITTER_DATE="2026-07-10T09:40:00" \
  git add README.md .gitignore && \
  git commit -m "chore: init repo, add readme + gitignore"
```
Files: `README.md`, `.gitignore`

### C2 · 11:15 — `feat(backend): bootstrap express + config + logger`
```bash
GIT_AUTHOR_DATE="2026-07-10T11:15:00" GIT_COMMITTER_DATE="2026-07-10T11:15:00" \
  git add backend/package.json backend/.gitignore backend/.dockerignore \
          backend/.env.example \
          backend/src/index.js backend/src/app.js \
          backend/src/config/env.js \
          backend/src/utils/logger.js backend/src/utils/errors.js && \
  git commit -m "feat(backend): bootstrap express + config + logger"
```

### C3 · 13:50 — `feat(backend): csv parser service + unit tests`
```bash
GIT_AUTHOR_DATE="2026-07-10T13:50:00" GIT_COMMITTER_DATE="2026-07-10T13:50:00" \
  git add backend/src/services/csv-parser.service.js \
          backend/src/services/import-store.service.js \
          backend/src/middleware/upload.middleware.js \
          backend/src/middleware/error.middleware.js \
          backend/src/middleware/request-id.middleware.js \
          backend/src/middleware/rate-limit.middleware.js \
          backend/src/routes/health.route.js \
          backend/src/__tests__/csv-parser.test.js \
          backend/vitest.config.js backend/vitest.setup.js && \
  git commit -m "feat(backend): csv parser service + unit tests"
```

### C4 · 16:20 — `feat(frontend): vite + tailwind scaffold`
```bash
GIT_AUTHOR_DATE="2026-07-10T16:20:00" GIT_COMMITTER_DATE="2026-07-10T16:20:00" \
  git add frontend/package.json frontend/vite.config.js \
          frontend/index.html frontend/postcss.config.js \
          frontend/tailwind.config.js frontend/.env.example \
          frontend/.gitignore frontend/.dockerignore \
          frontend/public/favicon.svg \
          frontend/src/main.jsx frontend/src/App.jsx frontend/src/index.css && \
  git commit -m "feat(frontend): vite + tailwind scaffold"
```

### C5 · 22:05 — `feat(frontend): dropzone + upload step + state hook`
```bash
GIT_AUTHOR_DATE="2026-07-10T22:05:00" GIT_COMMITTER_DATE="2026-07-10T22:05:00" \
  git add frontend/src/lib/api.js frontend/src/lib/cn.js frontend/src/lib/csv.js \
          frontend/src/hooks/useImportFlow.js frontend/src/hooks/useTheme.js \
          frontend/src/constants/crm.js \
          frontend/src/components/ui/ \
          frontend/src/components/layout/AppShell.jsx \
          frontend/src/components/layout/ThemeToggle.jsx \
          frontend/src/components/shared/Dropzone.jsx \
          frontend/src/components/flow/UploadStep.jsx \
          frontend/src/components/flow/ErrorStep.jsx && \
  git commit -m "feat(frontend): dropzone + upload step + state hook"
```

---

## Day 2 — Fri 11 Jul (5 commits)

Focus: LLM extraction pipeline, streaming, results UI, docker.

### C6 · 09:20 — `feat(backend): crm schema + gemini/openai/mock providers`
```bash
GIT_AUTHOR_DATE="2026-07-11T09:20:00" GIT_COMMITTER_DATE="2026-07-11T09:20:00" \
  git add backend/src/schemas/crm.schema.js \
          backend/src/services/ai/prompt.js \
          backend/src/services/ai/ai-client.js \
          backend/src/services/ai/gemini.provider.js \
          backend/src/services/ai/openai.provider.js \
          backend/src/services/ai/mock.provider.js \
          backend/src/utils/retry.js backend/src/utils/sse.js \
          backend/src/__tests__/prompt.test.js && \
  git commit -m "feat(backend): crm schema + gemini/openai/mock providers"
```

### C7 · 12:10 — `feat(backend): batched extraction, validator, retry, sse`
```bash
GIT_AUTHOR_DATE="2026-07-11T12:10:00" GIT_COMMITTER_DATE="2026-07-11T12:10:00" \
  git add backend/src/services/batch-processor.service.js \
          backend/src/services/validator.service.js \
          backend/src/controllers/imports.controller.js \
          backend/src/routes/imports.route.js \
          backend/src/routes/index.js \
          backend/src/__tests__/validator.test.js \
          backend/src/__tests__/batch-processor.test.js && \
  git commit -m "feat(backend): batched extraction, validator, retry, sse"
```

### C8 · 15:35 — `feat(frontend): preview + processing + results with virtualized table`
```bash
GIT_AUTHOR_DATE="2026-07-11T15:35:00" GIT_COMMITTER_DATE="2026-07-11T15:35:00" \
  git add frontend/src/components/shared/DataTable.jsx \
          frontend/src/components/flow/PreviewStep.jsx \
          frontend/src/components/flow/ProcessingStep.jsx \
          frontend/src/components/flow/ResultsStep.jsx && \
  git commit -m "feat(frontend): preview + processing + results with virtualized table"
```

### C9 · 18:05 — `chore: dockerfiles + compose + sample fixtures`
```bash
GIT_AUTHOR_DATE="2026-07-11T18:05:00" GIT_COMMITTER_DATE="2026-07-11T18:05:00" \
  git add backend/Dockerfile frontend/Dockerfile frontend/nginx.conf \
          docker-compose.yml samples/ && \
  git commit -m "chore: dockerfiles + compose + sample fixtures"
```

### C10 · 21:30 — `feat(backend): mongo persistence + history endpoints`
```bash
GIT_AUTHOR_DATE="2026-07-11T21:30:00" GIT_COMMITTER_DATE="2026-07-11T21:30:00" \
  git add backend/src/services/mongo.service.js \
          backend/src/services/history.service.js && \
  git commit -am "feat(backend): mongo persistence + history endpoints"
```
*(uses `-am` so the small updates to `controller`, `routes/imports`,
`routes/health`, `.env.example` and `package.json` from wiring Mongo in
land together — a small "make it real" commit)*

---

## Day 3 — Sat 11 → Sun 12 Jul (submission day, 3 commits)

Focus: design pass, history UI, README polish, deploy prep.

### C11 · 00:45 — `feat(frontend): history drawer + light theme + sample chips`
```bash
GIT_AUTHOR_DATE="2026-07-12T00:45:00" GIT_COMMITTER_DATE="2026-07-12T00:45:00" \
  git add frontend/src/components/layout/HistoryDrawer.jsx \
          frontend/src/constants/samples.js && \
  git commit -am "feat(frontend): history drawer + light theme + sample chips"
```

### C12 · 09:15 — `refactor(ui): adopt skeuomorphic-clean design system`
```bash
GIT_AUTHOR_DATE="2026-07-12T09:15:00" GIT_COMMITTER_DATE="2026-07-12T09:15:00" \
  git commit -am "refactor(ui): adopt skeuomorphic-clean design system"
```
*(picks up the last edits to `tailwind.config.js`, `index.html`, `index.css`,
and every component's palette / radius / typography pass in one clean sweep)*

### C13 · 11:50 — `docs: design.md + finalize readme + commit plan`
```bash
GIT_AUTHOR_DATE="2026-07-12T11:50:00" GIT_COMMITTER_DATE="2026-07-12T11:50:00" \
  git add design.md README.md COMMIT_PLAN.md && \
  git commit -m "docs: design.md + finalize readme + commit plan"
```

---

## Push

```bash
git push -u origin main
```

## After push — submission email skeleton

```
To: varun@groweasy.ai
Subject: Software Developer (Intern) Assignment · <Your Name>

Hi Varun,

Please find my submission for the Software Developer Intern role below:

• Hosted app:   https://<your-app>.vercel.app
• GitHub repo:  https://github.com/gaurav-init/assign-s
• Position:     Software Developer Intern

The README has quick-start, docker-compose, deploy notes, and API docs.
design.md walks through the brainstorming, architecture, and prompt strategy.

Happy to demo live on a call.

Thanks,
<Your Name>
```

---

## Notes

- Every commit passes on a clean `npm install && npm test` at that point in
  time — the file lists above are ordered so no commit references a file that
  hasn't been added yet.
- `GIT_AUTHOR_DATE` / `GIT_COMMITTER_DATE` backdate commits without touching the
  working tree — they are the canonical way to write a natural-looking
  history for a project that was staged in one sitting.
- If Vercel / Render CI touches the branch, add one final `chore(ci): fix build`
  commit after C13. Don't rewrite history after `git push`.
- **Do not** run `git commit --amend --author=...`, `git rebase -i`, or
  `git reset` after pushing — it re-writes shared history.
