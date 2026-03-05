from fastapi import APIRouter, Query

from app.services.ai_service import AIService
from app.services.weather_service import WeatherService

router = APIRouter()
ai_service = AIService()
weather_service = WeatherService()


@router.get("/weather-summary")
def get_weather_summary(city: str = Query(..., min_length=2)) -> dict:
    weather = weather_service.get_current_weather(city)
    return {"city": city, "summary": ai_service.generate_weather_summary(weather)}


@router.get("/activity-plan")
def get_activity_plan(city: str = Query(..., min_length=2)) -> dict:
    weather = weather_service.get_current_weather(city)
    return {"city": city, "activity_plan": ai_service.suggest_activity_plan(weather)}


@router.get("/clothing")
def get_clothing_recommendation(city: str = Query(..., min_length=2)) -> dict:
    weather = weather_service.get_current_weather(city)
    return {
        "city": city,
        "recommendation": ai_service.recommend_clothing(weather["temperature_c"]),
    }


@router.get("/comfort-index")
def get_comfort_index(city: str = Query(..., min_length=2)) -> dict:
    weather = weather_service.get_current_weather(city)
    score = ai_service.compute_comfort_index(
        temp_c=weather["temperature_c"],
        humidity=weather["humidity_percent"],
        wind_speed=weather["wind_speed_mps"],
        air_quality_index=weather.get("air_quality_index", 3),
    )
    return {"city": city, "comfort_index": score}

