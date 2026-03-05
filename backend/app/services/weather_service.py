from __future__ import annotations

from datetime import datetime
from typing import Any

import requests

from app.config.settings import get_settings
from app.utils.cache_manager import cached


class WeatherService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.base_url = self.settings.openweather_base_url.rstrip("/")
        self.api_key = self.settings.openweather_api_key

    @cached(ttl_seconds=600)
    def _geocode_city(self, city: str) -> dict[str, Any]:
        url = f"{self.base_url}/geo/1.0/direct"
        params = {"q": city, "limit": 1, "appid": self.api_key}
        data = self._get_json(url, params=params)
        if not data:
            raise ValueError(f"City not found: {city}")
        return data[0]

    def get_current_weather(self, city: str) -> dict[str, Any]:
        # For demo purposes, always use mock data
        return self._fallback_weather(city)

    def get_forecast(self, city: str) -> dict[str, Any]:
        # For demo purposes, return mock forecast data
        forecast_data = []
        base_temp = 28.0
        conditions = ["Clear", "Clouds", "Rain", "Sunny"]
        
        for i in range(7):
            forecast_data.append({
                "date": f"2024-03-{5+i:02d}",
                "temperature_c": base_temp + (i % 3 - 1) * 2,  # Vary temperature
                "condition": conditions[i % len(conditions)],
                "humidity": 50 + (i * 5) % 30,
                "wind_kph": 10 + (i * 2) % 15
            })
        
        return {"city": city, "forecast": forecast_data}

    def get_air_quality(self, city: str) -> dict[str, Any]:
        # For demo purposes, return mock air quality data
        return {"city": city, "air_quality_index": 2, "label": "Fair"}

    @staticmethod
    def _aqi_label(aqi: int) -> str:
        mapping = {1: "Good", 2: "Fair", 3: "Moderate", 4: "Poor", 5: "Very Poor"}
        return mapping.get(aqi, "Unknown")

    @staticmethod
    def _fallback_weather(city: str) -> dict[str, Any]:
        return {
            "city": city,
            "temperature_c": 28.0,
            "feels_like_c": 30.1,
            "humidity_percent": 58,
            "pressure_hpa": 1008,
            "weather_main": "Clear",
            "weather_description": "clear sky",
            "wind_speed_mps": 3.7,
            "air_quality_index": 3,
            "timestamp_utc": datetime.utcnow().isoformat() + "Z",
            "source": "mock_no_api_key",
        }

    @staticmethod
    def _get_json(url: str, params: dict[str, Any]) -> Any:
        response = requests.get(url, params=params, timeout=15)
        if response.status_code >= 400:
            raise ValueError(f"Weather provider error: {response.status_code}")
        return response.json()

