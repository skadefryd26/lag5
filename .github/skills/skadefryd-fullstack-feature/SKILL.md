---
name: skadefryd-fullstack-feature
description: 'Use when creating, extending, debugging, or testing a Skadefryd 2026 frontend, backend, API endpoint, React screen, TanStack Router route, TanStack Query request, Mantine UI, Express service, or TypeScript feature.'
---

# Skadefryd Full-Stack Feature

## Technology baseline

- Frontend: React, TypeScript, Vite, TanStack Router, TanStack Query, and Mantine.
- Backend: Node.js, TypeScript, and Express.
- Add another library only when it materially helps the requested feature; explain its purpose briefly.

## Build a feature

1. Establish the participant mode with the `skadefryd-participant-workflow` skill.
2. Make sure the work is on its own branch before writing code. Follow `skadefryd-git-help`.
3. Locate the nearest owning frontend or backend module and one focused test or usage. For a new project, first create a clear `frontend/` and `backend/` boundary.
4. Prefer feature-local additions: a route/screen, UI component, query hook, API client, server router, controller, or test in a new feature-named file. Change shared registration, routing, or exports only to connect the addition.
5. On the frontend, use TanStack Router for navigation, TanStack Query for server data, and Mantine components and theming for UI. Keep API requests out of presentational components when a feature hook or API module is appropriate.
6. On the backend, expose typed Express request and response boundaries, validate untrusted input, return useful HTTP status codes, and keep route wiring separate from feature logic when practical.
7. When the feature talks to the AI gateway, follow `skadefryd-ai-gateway`. Set up `.env.local` and the token yourself before the first call rather than after it fails, and keep the token in the backend — never in a `VITE_` variable or anywhere the browser downloads.
8. Keep the project runnable on both macOS and Windows. Team members will have both. Do not put `VAR=value command` in an npm script — that is bash syntax and fails on Windows. Read configuration from `.env.local` in code instead, keep paths out of scripts, and make sure `npm install` and `npm run dev` are the only two commands anyone needs.
9. Do not use real customer, claim, employee, or secret data. Use clearly fictional examples.

## Validation

1. Test locally: run the narrowest existing test, typecheck, lint, or build command, then start the relevant local frontend or backend where behavior needs hands-on verification.
2. For a UI change, verify the normal, loading, empty, and error states where applicable in the local application.
3. Do not add deployment configuration or rely on a hosted environment during the hackathon unless explicitly requested.
4. State exactly what ran locally and any validation that could not run.
