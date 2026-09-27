# Reelshq

Turborepo monorepo for a short-form video processing pipeline. A typed encode engine handles media work, and a Next.js app provides the upload interface.

## Architecture

```
apps/web        Next.js front end â€” upload UI and API route
packages/engine Framework-agnostic TypeScript encode engine
test-data/      Sample 4K60 source and optimized output
scripts/        Standalone encode test runner
```

- **Turbo** orchestrates builds and tasks across the workspace
- **Engine** is decoupled from the app, so it can be reused or scripted independently
- **Probe + encode + profiles** are separated inside the engine, so container inspection, encoding, and quality presets can evolve on their own

## Features

- Upload route (`app/api/upload`) wired to the engine
- Quality profiles for different output targets
- Media probing for container/codec inspection before encode
- Reproducible encode test using a bundled 4K60 sample

## Tech Stack

- Turborepo + npm workspaces
- TypeScript throughout
- Next.js (App Router) + Tailwind CSS
- Media probing/encoding via the engine package

## Project Structure

```
apps/web/
  app/            # page, layout, api/upload route, globals.css
  components/     # Upload.tsx
packages/engine/
  src/            # index.ts, encode.ts, probe.ts, profiles.ts, cli.ts
turbo.json        # pipeline definition
scripts/          # test-encode.mjs
```

## Getting Started

```bash
npm install
npm run dev
```

**Author:** Raliq Hidayat BM3
