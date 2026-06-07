# Mahoujin

Mobile-first web app: photograph a hand-drawn magical circle, receive a unique animated creature.

## Local dev

```bash
cp .env.local.example .env.local
# fill in GEMINI_API_KEY
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Path | Screen |
|---|---|
| `/` | CaptureScreen |
| `/onboarding` | OnboardingScreen |
| `/analysis` | AnalysisScreen |
| `/summoning` | SummoningScreen |
| `/choice` | ChoiceScreen |
| `/shelf` | CrystalShelfScreen |

## Env vars

See `.env.local.example`:

- `GEMINI_API_KEY` — Google Gemini 1.5 Flash API key (server-side only)
- `COMFYUI_BASE_URL` — local ComfyUI REST endpoint (default `http://localhost:8188`)

## Deploy

Deploy to [Vercel](https://vercel.com). Set `GEMINI_API_KEY` in Vercel project env vars.
