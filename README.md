# EduSaathi

### Connecting citizens and students to verified government opportunities

[![License: MIT](https://img.shields.io/badge/License-MIT-0B6E4F.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Gemini-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**EduSaathi** is an opportunity-intelligence platform for Indian citizens and students. It helps students, job seekers, founders, farmers, and families discover scholarships, internships, welfare schemes, and grants — then guides them with eligibility checks, document explanations, application roadmaps, and deadline tracking.

> Eligibility and AI guidance are **advisory**. Always confirm details and submit applications on the **official government portal**.

---

## Problem Statement

Government opportunities in India are abundant, but discovery is fragmented across portals, eligibility language is hard to parse, deadlines get missed, and citizens often rely on middlemen.

**Full problem statement (PDF / Drive):**  
[https://drive.google.com/file/d/1YCXMteweobFCmNhRFFj0VMfzB9vWzO0N/view?usp=drive_link](https://drive.google.com/file/d/1YCXMteweobFCmNhRFFj0VMfzB9vWzO0N/view?usp=drive_link)

---

## Demo Video

Watch the full product walkthrough on YouTube:  
[https://youtu.be/-0bMpg27DJU](https://youtu.be/-0bMpg27DJU)

---

## Deployment

| | |
| --- | --- |
| **Website** | [https://civicbridge-ai.vercel.app](https://civicbridge-ai.vercel.app) |
| **Host** | Vercel (Next.js frontend + FastAPI AI backend) |
| **Status tracker** | [DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md) |

Open the **Website** link above to use the live app. That is the public deployment URL.

`/health` is **not** the website — it is a small backend status URL used to confirm the AI API is up (`{"status":"ok","gemini_configured":true}`). Ordinary visitors do not need it: [https://civicbridge-ai.vercel.app/health](https://civicbridge-ai.vercel.app/health)

---

## Why CivicBridge?

Government opportunity discovery is fragmented across dozens of portals. Citizens often miss deadlines, upload the wrong documents, or fall for unofficial middlemen.

CivicBridge brings the journey into one place:

| Capability | What it does |
| --- | --- |
| **Verified schemes** | 40+ real central schemes with official portal links (NSP, PM-KISAN, PM-JAY, PMAY, SIH, Startup India, PMKVY, and more) |
| **Smart eligibility** | Profile-based match scores with plain-language reasons |
| **Document AI** | Explains dense government notifications in clear steps |
| **Application roadmaps** | Instant step-by-step plans from official scheme processes (optional Gemini refine) |
| **Deadline calendar** | Real deadline dates across scholarships, grants, and welfare schemes |
| **Secure vault** | Store application documents (Firebase Storage when signed in) |
| **AI assistant** | Chat about schemes, documents, and next steps via Gemini |

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| Backend | FastAPI, Google Gemini (`google-genai`) |
| Auth & data | Firebase Authentication, Firestore, Firebase Storage |
| Deploy target | Vercel (Next.js + FastAPI via Services) |

---

## Screenshots

> Add product screenshots under `docs/screenshots/` and embed them here after your first deploy.

```text
docs/screenshots/
  landing.png
  dashboard.png
  opportunities.png
  calendar.png
```

---

## Quick start

### Prerequisites

- Node.js 20+
- Python 3.11+
- Firebase project (Auth + Firestore + Storage)
- Gemini API key ([Google AI Studio](https://aistudio.google.com/))

### 1. Clone

```bash
git clone https://github.com/Snigdha-0210/CivicBridge_AI.git
cd CivicBridge_AI
```

### 2. Frontend

```bash
npm install
cp .env.example .env.local
```

Fill in your Firebase keys in `.env.local` (never commit this file).

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 3. Backend (AI)

```bash
cd backend
python -m venv .venv

# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```

Add `GEMINI_API_KEY` to `backend/.env`, then:

```bash
uvicorn main:app --reload --port 8001
```

Health check: [http://localhost:8001/health](http://localhost:8001/health)

---

## Environment variables

### Frontend (`.env.local`)

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase web app config |
| `NEXT_PUBLIC_API_URL` | FastAPI base URL (default `http://localhost:8001`) |

### Backend (`backend/.env`)

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GEMINI_MODEL_PRIMARY` | Default `gemini-2.5-flash` |
| `GEMINI_MODEL_FALLBACK` | Default `gemini-2.0-flash` |

Templates: [`.env.example`](./.env.example) · [`backend/.env.example`](./backend/.env.example)

> **Security:** Real keys stay on your machine / host. They are gitignored. If a key was ever shared publicly, **rotate it** in Firebase Console and Google AI Studio.

---

## Firebase setup

1. Create a Firebase project and a Web app  
2. **Authentication** → enable Email/Password and Google  
3. Create a **Firestore** database → paste [`firestore.rules`](./firestore.rules)  
4. Create a **Storage** bucket → paste [`storage.rules`](./storage.rules)  
5. Authentication → Settings → Authorized domains → keep `localhost`

---

## Project structure

```text
CivicBridge_AI/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # UI + dashboard shell
│   ├── contexts/            # Auth provider (Firebase)
│   └── lib/                 # Schemes data, eligibility, API, vault
├── backend/
│   ├── app/
│   │   ├── routers/         # /health, /api/ai/*
│   │   └── services/        # Gemini + fallbacks
│   ├── main.py
│   └── requirements.txt
├── firestore.rules
├── storage.rules
├── LICENSE
├── SECURITY.md
└── CONTRIBUTING.md
```

---

## Core features

- **Landing & auth** — Firebase email / Google sign-in, onboarding profile
- **Opportunities** — browse & search verified schemes by category
- **Eligibility checker** — profile vs published criteria
- **Document explainer** — Gemini summary of scheme text / notifications
- **Roadmap** — instant official-process plan + optional AI refine
- **Calendar** — deadline markers for real schemes
- **Vault** — private document uploads
- **Tracker / career / chat / reports / admin** — full citizen workflow

---

## API overview

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Status + `gemini_configured` |
| `POST` | `/api/ai/explain-document` | Explain scheme / notification text |
| `POST` | `/api/ai/roadmap` | Generate application roadmap |
| `POST` | `/api/ai/career-advice` | Skill & course suggestions |
| `POST` | `/api/ai/chat` | Civic opportunity assistant |

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Pull requests that improve scheme accuracy, accessibility, or security are especially welcome.

---

## Security

Please read [SECURITY.md](./SECURITY.md) before reporting vulnerabilities. Never open public issues that include live API keys.

---

## License

This project is licensed under the [MIT License](./LICENSE).

---

## Disclaimer

CivicBridge AI is an independent civic-tech project. It is **not** an official Government of India website. Scheme details can change; always verify on the linked official portal before applying. CivicBridge does not submit applications on your behalf.

---

## Author

Built with care by [**Snigdha**](https://github.com/Snigdha-0210).

If this project helps you or your community, consider starring the repository ⭐
