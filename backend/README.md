# CivicBridge AI Backend

FastAPI backend for CivicBridge AI features: document explanation, application roadmaps, career advice, and chat.

## Requirements

- Python 3.11+
- A [Google Gemini API key](https://aistudio.google.com/apikey) (optional — the API returns high-quality fallback responses when no key is set)

## Setup

1. **Create a virtual environment** (recommended):

   ```bash
   cd backend
   python -m venv .venv
   ```

   Activate it:

   - Windows (PowerShell): `.venv\Scripts\Activate.ps1`
   - macOS/Linux: `source .venv/bin/activate`

2. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables**:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set your Gemini API key:

   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

## Run

From the `backend/` directory:

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

Interactive docs: `http://localhost:8000/docs`

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/ai/explain-document` | Explain a government document |
| `POST` | `/api/ai/roadmap` | Generate an application roadmap |
| `POST` | `/api/ai/career-advice` | Personalized career advice |
| `POST` | `/api/ai/chat` | Chat with CivicBridge assistant |

## Frontend integration

Set the Next.js frontend env variable to point at this server:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

CORS is enabled for `http://localhost:3000` and `https://*.vercel.app`.

## Notes

- Uses `gemini-2.0-flash` with automatic fallback to `gemini-1.5-flash`.
- If the API key is missing or Gemini fails, endpoints return curated fallback responses instead of errors.
