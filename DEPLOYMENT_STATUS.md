# CivicBridge — Deployment Status

> Living checklist. Updated as work progresses so everyone knows what is done **right now**.

**Last updated:** 2026-08-04 01:35 IST  
**Owner:** Snigdha (`snigdha-0210`)  
**Repo:** https://github.com/Snigdha-0210/CivicBridge_AI

---

## Verdict (read this first)

| Question | Answer |
| --- | --- |
| Best host? | **Vercel** — Next.js + FastAPI as one project (Services) |
| Can the agent deploy? | **Yes for Vercel** (you were already logged in). Done. |
| What you still must do | Add `civicbridge-ai.vercel.app` to Firebase **Authorized domains** |

---

## Live URLs

| Service | URL | Status |
| --- | --- | --- |
| **Website (use this)** | https://civicbridge-ai.vercel.app | ✅ LIVE |
| API health (devs only) | https://civicbridge-ai.vercel.app/health | ✅ backend status check |
| Inspect | https://vercel.com/snigdha-0210s-projects/civicbridge-ai | dashboard |

---

## Architecture

```text
Browser ──► https://civicbridge-ai.vercel.app
              ├── service "web"  → Next.js 16
              └── service "api"  → FastAPI + Gemini  (/health, /api/*)
              └── Firebase (Auth / Firestore / Storage)
```

---

## Progress

| Step | Status | Notes |
| --- | --- | --- |
| 1. Choose platform | ✅ | Vercel Services (not Render for v1) |
| 2. `vercel.json` services + rewrites | ✅ | web + api |
| 3. Same-origin API base in `api.ts` | ✅ | prod uses `""` |
| 4. Status tracker file | ✅ | this file |
| 5. Link project `civicbridge-ai` | ✅ | GitHub connected |
| 6. Env vars (Firebase + Gemini) | ✅ | prod / preview / development |
| 7. Production deploy | ✅ | aliased to `civicbridge-ai.vercel.app` |
| 8. Smoke test home + `/health` + login | ✅ | all HTTP 200; Gemini configured |
| 9. `.vercelignore` for secrets | ✅ | blocks `.env` uploads |
| 10. Firebase authorized domains | ⏳ **YOU** | add `civicbridge-ai.vercel.app` |
| 11. Commit / push deploy files | ✅ Done | Live URL in README + deploy configs on GitHub |

---

## Who does what

### Agent already did
- Chose Vercel-only deploy (most compatible with your login + stack)
- Configured Services + rewrites
- Set env vars from local gitignored files (values not written into this markdown)
- Deployed production and verified `/health`

### You must do (one step)
1. Open [Firebase Console](https://console.firebase.google.com/) → project `govt-867e6`  
2. **Authentication → Settings → Authorized domains**  
3. Add: `civicbridge-ai.vercel.app`  
4. (Optional) Test Google / email login on the live site

Without that domain, Firebase login on the live URL will fail even though the site loads.

---

## Environment (names only — no secrets)

| Variable | On Vercel? |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_*` (7 keys) | ✅ |
| `GEMINI_API_KEY` | ✅ |
| `GEMINI_MODEL_PRIMARY` / `_FALLBACK` | ✅ |
| `NEXT_PUBLIC_API_URL` | intentionally **unset** (same-origin) |

---

## Change log

| When (IST) | Update |
| --- | --- |
| 2026-08-04 01:10 | Status file created. Confirmed Vercel login. |
| 2026-08-04 01:15 | Switched to Vercel Services; updated `vercel.json` + `api.ts`. |
| 2026-08-04 01:22 | Linked project; pushed env vars. |
| 2026-08-04 01:25 | **Production LIVE** at https://civicbridge-ai.vercel.app — health OK, Gemini configured. |
| 2026-08-04 01:28 | Pushed live URL + deploy configs to GitHub. Keys already on Vercel — no new keys needed from you for deploy. |
| 2026-08-04 01:35 | Full smoke check: pages 200, `/health` OK, AI chat + explain OK. Only Firebase authorized domain left for login. |

---

## Next action

1. **You:** add `civicbridge-ai.vercel.app` to Firebase authorized domains (needed for live login)
2. Open https://civicbridge-ai.vercel.app and try login + AI chat
