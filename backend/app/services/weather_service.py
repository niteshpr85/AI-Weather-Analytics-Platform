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
        try:
            geo_data = self._geocode_city(city)
            lat, lon = geo_data["lat"], geo_data["lon"]
            
            url = f"{self.base_url}/data/2.5/weather"
            params = {"lat": lat, "lon": lon, "appid": self.api_key, "units": "metric"}
            data = self._get_json(url, params=params)
            
            return {
                "city": city,
                "temperature_c": data["main"]["temp"],
                "feels_like_c": data["main"]["feels_like"],
                "humidity_percent": data["main"]["humidity"],
                "pressure_hpa": data["main"]["pressure"],
                "weather_main": data["weather"][0]["main"],
                "weather_description": data["weather"][0]["description"],
                "wind_speed_mps": data["wind"]["speed"],
                "air_quality_index": 3,
                "timestamp_utc": datetime.utcfromtimestamp(data["dt"]).isoformat() + "Z",
                "source": "openweather_api",
            }
        except Exception as e:
            print(f"Error fetching current weather for {city}: {e}")
            return self._fallback_weather(city)

    def get_forecast(self, city: str) -> dict[str, Any]:
        try:
            geo_data = self._geocode_city(city)
            lat, lon = geo_data["lat"], geo_data["lon"]
            
            url = f"{self.base_url}/data/2.5/forecast"
            params = {"lat": lat, "lon": lon, "appid": self.api_key, "units": "metric"}
            data = self._get_json(url, params=params)
            
            forecast_data = []
            for item in data["list"][::8]:  # Every 8 items = every 24 hours
                forecast_data.append({
                    "date": datetime.utcfromtimestamp(item["dt"]).strftime("%Y-%m-%d"),
                    "temperature_c": item["main"]["temp"],
                    "condition": item["weather"][0]["main"],
                    "humidity": item["main"]["humidity"],
                    "wind_kph": item["wind"]["speed"] * 3.6,
                })
            
            return {"city": city, "forecast": forecast_data}
        except Exception as e:
            print(f"Error fetching forecast for {city}: {e}")
            return {"city": city, "forecast": []}

    def get_air_quality(self, city: str) -> dict[str, Any]:
        try:
            geo_data = self._geocode_city(city)
            lat, lon = geo_data["lat"], geo_data["lon"]
            
            url = f"{self.base_url}/data/3.0/uvi"
            params = {"lat": lat, "lon": lon, "appid": self.api_key}
            data = self._get_json(url, params=params)
            
            aqi = max(1, min(5, round(data.get("value", 3) / 2)))
            
            return {"city": city, "air_quality_index": aqi, "label": self._aqi_label(aqi)}
        except Exception as e:
            print(f"Error fetching air quality for {city}: {e}")
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

