class AIService:
    def generate_weather_summary(self, weather: dict) -> str:
        temp = weather["temperature_c"]
        humidity = weather["humidity_percent"]
        wind = weather["wind_speed_mps"]
        condition = weather["weather_main"]

        temp_feel = "cool" if temp < 18 else "warm" if temp < 30 else "hot"
        humidity_note = "humid" if humidity > 70 else "comfortable humidity"
        wind_note = "calm winds" if wind < 3 else "moderate winds" if wind < 8 else "strong winds"

        return (
            f"Conditions are {condition.lower()} with {temp_feel} weather around {temp:.1f}°C, "
            f"{humidity_note}, and {wind_note}."
        )

    def recommend_clothing(self, temp_c: float) -> str:
        if temp_c < 10:
            return "Wear winter clothing with thermal layers."
        if temp_c < 20:
            return "Wear a light jacket over regular clothing."
        if temp_c < 30:
            return "Comfortable casual clothing is suitable."
        return "Wear light cotton clothing and stay hydrated."

    def suggest_activity_plan(self, weather: dict) -> str:
        condition = weather["weather_main"].lower()
        temp = weather["temperature_c"]

        if "rain" in condition or "storm" in condition:
            return "Best for indoor activities today."
        if temp > 35:
            return "Avoid intense outdoor activities during peak heat."
        return "Suitable for outdoor activities."

    def compute_comfort_index(
        self,
        *,
        temp_c: float,
        humidity: int,
        wind_speed: float,
        air_quality_index: int,
    ) -> int:
        score = 100

        score -= min(abs(temp_c - 24) * 2, 30)
        score -= min(abs(humidity - 50) * 0.4, 20)
        score -= min(max(wind_speed - 10, 0) * 2, 10)
        score -= (air_quality_index - 1) * 8

        return max(0, min(100, int(round(score))))

