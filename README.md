# Mahoujin

A mobile-first web app that transforms crystal photographs into summoned creatures.

## Local dev setup

### Prerequisites

- Node.js 20+
- npm

### Install

```bash
npm install
```

### Configure environment

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini Vision API key for crystal analysis |
| `COMFYUI_BASE_URL` | Base URL for your ComfyUI instance (e.g. `http://localhost:8188`) |

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Path | Screen |
|---|---|
| `/` | Capture — photograph your crystal |
| `/onboarding` | Onboarding — intro shown once |
| `/analysis` | Analysis — Gemini vision pipeline |
| `/summoning` | Summoning — creature reveal animation |
| `/choice` | Keep or Release — creature fate |
| `/shelf` | Crystal Shelf — your collection |

## Other commands

```bash
npm run build      # Production build
npm run lint       # ESLint
npm run type-check # TypeScript check
```
