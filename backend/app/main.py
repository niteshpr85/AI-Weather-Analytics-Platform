from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.ai_routes import router as ai_router
from app.routes.weather_routes import router as weather_router

app = FastAPI(
    title="AI Weather Analytics Platform API",
    version="0.1.0",
    description="Backend APIs for weather data, analytics, and AI insights.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(weather_router, prefix="/weather", tags=["weather"])
app.include_router(ai_router, prefix="/ai", tags=["ai"])


@app.get("/")
def health_check() -> dict:
    return {"status": "ok", "service": "ai-weather-analytics-backend"}

