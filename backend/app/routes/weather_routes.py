from fastapi import APIRouter, HTTPException, Query

from app.services.weather_service import WeatherService

router = APIRouter()
weather_service = WeatherService()


@router.get("/current")
def get_current_weather(city: str = Query(..., min_length=2)) -> dict:
    try:
        return weather_service.get_current_weather(city)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/forecast")
def get_weather_forecast(city: str = Query(..., min_length=2)) -> dict:
    try:
        return weather_service.get_forecast(city)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/air-quality")
def get_air_quality(city: str = Query(..., min_length=2)) -> dict:
    try:
        return weather_service.get_air_quality(city)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

