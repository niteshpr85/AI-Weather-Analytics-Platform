from pydantic import BaseModel


class CurrentWeather(BaseModel):
    city: str
    temperature_c: float
    feels_like_c: float
    humidity_percent: int
    pressure_hpa: int
    weather_main: str
    weather_description: str
    wind_speed_mps: float
    timestamp_utc: str

