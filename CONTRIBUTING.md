# Contributing to CivicBridge AI

Thanks for your interest in improving CivicBridge AI. This project aims to make Indian government schemes, scholarships, and civic opportunities easier to discover — with accurate data and clear guidance.

## How to contribute

1. **Fork** the repository and create a branch from `main`.
2. Keep changes focused (one feature or fix per PR).
3. Do **not** commit secrets (`.env`, API keys, service accounts).
4. Match existing TypeScript / Python style in the repo.
5. Open a Pull Request with a clear summary and test notes.

## Local setup

```bash
# Frontend
npm install
cp .env.example .env.local
# fill Firebase keys
npm run dev

# Backend
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1   # Windows
pip install -r requirements.txt
cp .env.example .env
# fill GEMINI_API_KEY
uvicorn main:app --reload --port 8001
```

## Scheme data

Real scheme listings live in `src/lib/schemes-data.ts`. When adding or updating a scheme:

- Use the official ministry / portal name
- Link a real `officialUrl`
- Keep eligibility and documents accurate
- Prefer ₹ for currency amounts

## Code of conduct

Be respectful. Assume good intent. No harassment, spam, or malicious PRs.
