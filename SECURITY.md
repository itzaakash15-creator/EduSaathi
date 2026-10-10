# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 0.1.x   | ✅        |

## Reporting a vulnerability

If you discover a security issue in CivicBridge AI (auth bypass, data exposure, insecure rules, dependency CVE, etc.):

1. **Do not** open a public GitHub issue with exploit details.
2. Email the maintainer via GitHub: [@Snigdha-0210](https://github.com/Snigdha-0210)
3. Include steps to reproduce, impact, and (if possible) a suggested fix.

We will acknowledge reports as quickly as possible and coordinate a fix before any public disclosure.

## Secrets & API keys

- Never commit `.env`, `.env.local`, or `backend/.env`.
- Use `.env.example` / `backend/.env.example` as templates only.
- Rotate Firebase and Gemini keys immediately if they are exposed.
- Keep Firestore and Storage security rules least-privilege (see `firestore.rules` and `storage.rules`).

## Responsible use

CivicBridge AI helps citizens discover **official** government schemes. Eligibility results are advisory. Always verify on the official portal before applying. Do not use this project to scrape, abuse, or misrepresent government services.
