# AI Weather Analytics Platform

Full-stack weather application with a React frontend and FastAPI backend that provides:
- Current weather data
- 7-day forecast
- Air quality details
- AI weather summary
- Clothing recommendation
- Activity planning
- Comfort index API
- In-app weather chatbot (rule-based)
- Favorite cities and recent searches

## Project Structure

```text
Weather APP/
|-- backend/
|   |-- app/
|   |   |-- main.py
|   |   |-- routes/
|   |   |-- services/
|   |   |-- models/
|   |   |-- config/
|   |   `-- utils/
|   `-- requirements.txt
|-- frontend/
|   |-- src/
|   |-- package.json
|   `-- vite.config.js
|-- ml_models/
|-- documentation/
`-- README.md
```

## Tech Stack

- Frontend: React, Vite, Axios
- Backend: FastAPI, Uvicorn, Pydantic
- Data/ML libs: NumPy, Pandas, Scikit-learn, TensorFlow
- Optional provider integration: OpenWeatherMap API

## Prerequisites

- Python 3.12+
- Node.js 18+ (or 20+ recommended)
- npm

## Run Locally

### 1. Backend Setup

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Optional ML dependencies (only if you start using training/inference code):

```powershell
pip install -r requirements-ml.txt
```

Backend URLs:
- API root: `http://127.0.0.1:8000/`
- Swagger docs: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup

Open a new terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL (default): `http://localhost:5173`

The frontend is configured to call backend APIs at `http://localhost:8000`.

## Environment Variables

Create `backend/.env`:

```env
OPENWEATHER_API_KEY=your_api_key_here
OPENWEATHER_BASE_URL=https://api.openweathermap.org
```

Current implementation note:
- The backend `WeatherService` currently returns demo/mock weather, forecast, and air quality data.
- `OPENWEATHER_API_KEY` is defined for provider integration and future live-data usage.

## Available API Endpoints

### Weather Routes

- `GET /weather/current?city={city}`
- `GET /weather/forecast?city={city}`
- `GET /weather/air-quality?city={city}`

### AI Routes

- `GET /ai/weather-summary?city={city}`
- `GET /ai/activity-plan?city={city}`
- `GET /ai/clothing?city={city}`
- `GET /ai/comfort-index?city={city}`

## Frontend Features

- City search with suggestions
- Current weather and 7-day forecast cards
- Air quality indicator
- AI summary and recommendations
- Chat widget for weather Q&A
- Recent searches persistence (`localStorage`)
- Favorite cities persistence (`localStorage`)

## Scripts

### Frontend (`frontend/package.json`)

- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run preview` - Preview build
- `npm run lint` - Run ESLint

## Upload to GitHub

If this folder is not yet a Git repo:

```powershell
git init
git add .
git commit -m "Initial project setup"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

If already initialized:

```powershell
git add .
git commit -m "Update project"
git push
```

## Deployment (Recommended)

Use:
- Backend: Render (Web Service)
- Frontend: Vercel (Static React app)

Deployment config files included:
- `render.yaml` (Render backend blueprint)
- `vercel.json` (Vercel build config for monorepo)

### 1. Deploy Backend on Render

Create a new Web Service from your GitHub repo with:
- Root Directory: `backend`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

Environment variables:
- `OPENWEATHER_API_KEY=your_api_key_here`
- `OPENWEATHER_BASE_URL=https://api.openweathermap.org`

After deploy, copy backend URL:
- Example: `https://your-backend.onrender.com`

### 2. Deploy Frontend on Vercel

Import the same GitHub repo in Vercel with:
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

Environment variable:
- `VITE_API_BASE_URL=https://your-backend.onrender.com`

Redeploy frontend after setting env var.

## Documentation

- Architecture: `documentation/ARCHITECTURE.md`
- Project details: `documentation/AI_WEATHER_ANALYTICS_PLATFORM.md`
- ML folder notes: `ml_models/README.md`

## Future Enhancements

- Replace mock weather service with live OpenWeather API data
- Add ML model training and inference pipelines in `ml_models/`
- Add authentication, rate limiting, and structured logging
- Add tests for backend routes and frontend components
