import axios from 'axios'
import React, { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [city, setCity] = useState('London')
  const [currentWeather, setCurrentWeather] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [aiSummary, setAiSummary] = useState(null)
  const [clothing, setClothing] = useState(null)
  const [activity, setActivity] = useState(null)
  const [airQuality, setAirQuality] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // New states for chatbot and location suggestions
  const [showChatbot, setShowChatbot] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { type: 'bot', text: 'Hello! I\'m your weather assistant. Ask me about weather, clothing recommendations, or activities!' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [locationSuggestions, setLocationSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionIndex, setSuggestionIndex] = useState(-1) // for keyboard navigation

  const [recentSearches, setRecentSearches] = useState([])
  const [favorites, setFavorites] = useState([])

  const API_BASE = 'http://localhost:8000'

  const inputDebounce = React.useRef(null)

  // Popular locations with more detailed information
  const popularCities = [
    { name: 'London', state: '', country: 'UK', district: 'Greater London' },
    { name: 'New York', state: 'NY', country: 'USA', district: 'New York County' },
    { name: 'Tokyo', state: '', country: 'Japan', district: 'Tokyo Metropolis' },
    { name: 'Paris', state: '', country: 'France', district: 'Île-de-France' },
    { name: 'Sydney', state: 'NSW', country: 'Australia', district: 'Sydney' },
    { name: 'Berlin', state: '', country: 'Germany', district: 'Berlin' },
    { name: 'Mumbai', state: 'Maharashtra', country: 'India', district: 'Mumbai' },
    { name: 'Singapore', state: '', country: 'Singapore', district: 'Central Region' },
    { name: 'Dubai', state: '', country: 'UAE', district: 'Dubai' },
    { name: 'Toronto', state: 'Ontario', country: 'Canada', district: 'Toronto' },
    { name: 'Amsterdam', state: '', country: 'Netherlands', district: 'North Holland' },
    { name: 'Barcelona', state: '', country: 'Spain', district: 'Catalonia' },
    { name: 'Rome', state: '', country: 'Italy', district: 'Lazio' },
    { name: 'Bangkok', state: '', country: 'Thailand', district: 'Bangkok' },
    { name: 'Istanbul', state: '', country: 'Turkey', district: 'Marmara' }
  ]

  const fetchWeatherData = async (searchCity) => {
    setLoading(true)
    setError(null)
    try {
      const [
        currentRes,
        forecastRes,
        summaryRes,
        clothingRes,
        activityRes,
        airQualityRes
      ] = await Promise.all([
        axios.get(`${API_BASE}/weather/current?city=${searchCity}`),
        axios.get(`${API_BASE}/weather/forecast?city=${searchCity}`),
        axios.get(`${API_BASE}/ai/weather-summary?city=${searchCity}`),
        axios.get(`${API_BASE}/ai/clothing?city=${searchCity}`),
        axios.get(`${API_BASE}/ai/activity-plan?city=${searchCity}`),
        axios.get(`${API_BASE}/weather/air-quality?city=${searchCity}`)
      ])
      
      setCurrentWeather(currentRes.data)
      setForecast(forecastRes.data)
      setAiSummary(summaryRes.data)
      setClothing(clothingRes.data)
      setActivity(activityRes.data)
      setAirQuality(airQualityRes.data)

      // update recent searches list and persist
      setRecentSearches(prev => {
        const updated = [searchCity, ...prev.filter(c => c.toLowerCase() !== searchCity.toLowerCase())].slice(0, 5)
        localStorage.setItem('recentSearches', JSON.stringify(updated))
        return updated
      })
    } catch (err) {
      setError('Failed to fetch weather data. Please check the city name.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeatherData(city)

    // load recent searches and favorites from localStorage
    const savedRecent = JSON.parse(localStorage.getItem('recentSearches') || '[]')
    const savedFav = JSON.parse(localStorage.getItem('favorites') || '[]')
    setRecentSearches(savedRecent)
    setFavorites(savedFav)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (city.trim()) {
      fetchWeatherData(city.trim())
    }
  }

  const getWeatherIcon = (condition) => {
    const icons = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Sunny': '☀️',
      'Snow': '❄️',
      'Thunderstorm': '⛈️',
      'Drizzle': '🌦️',
      'Mist': '🌫️'
    }
    return icons[condition] || '🌤️'
  }

  const getAirQualityColor = (aqi) => {
    if (aqi <= 1) return '#00e400' // Good
    if (aqi <= 2) return '#ffff00' // Fair
    if (aqi <= 3) return '#ff7e00' // Moderate
    if (aqi <= 4) return '#ff0000' // Poor
    return '#99004c' // Very Poor
  }

  // Handle location input changes and fetch real suggestions from API
  const handleCityInputChange = (e) => {
    const value = e.target.value
    setCity(value)
    setSuggestionIndex(-1)

    // always show dropdown when typing
    setShowSuggestions(true)

    clearTimeout(inputDebounce.current)
    inputDebounce.current = setTimeout(async () => {
      if (value.length > 2) {
        try {
          // Use Nominatim (OpenStreetMap) API for real location data
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=5&addressdetails=1`,
            { timeout: 5000 }
          )
          
          const locations = response.data.map(item => ({
            name: item.address?.city || item.address?.town || item.address?.village || item.name,
            state: item.address?.state || '',
            country: item.address?.country || '',
            district: item.address?.county || item.address?.district || '',
            displayName: item.display_name
          }))
          
          // Remove duplicates and limit to 5
          const unique = []
          const seen = new Set()
          locations.forEach(loc => {
            const key = `${loc.name}-${loc.country}`.toLowerCase()
            if (!seen.has(key) && unique.length < 5) {
              seen.add(key)
              unique.push(loc)
            }
          })
          
          setLocationSuggestions(unique)
        } catch (error) {
          console.error('Geocoding error:', error)
          // Fallback to popular cities if API fails
          const filtered = popularCities.filter(loc => {
            const term = value.toLowerCase()
            return (
              loc.name.toLowerCase().includes(term) ||
              loc.country.toLowerCase().includes(term)
            )
          }).slice(0, 5)
          setLocationSuggestions(filtered)
        }
      } else {
        setLocationSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)
  }

  // Handle suggestion selection
  const selectSuggestion = (selectedCity) => {
    const name = typeof selectedCity === 'string' ? selectedCity : selectedCity.name
    setCity(name)
    setShowSuggestions(false)
    fetchWeatherData(name)
  }

  // handle keyboard navigation in suggestions
  const handleKeyDown = (e) => {
    if (!showSuggestions || locationSuggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSuggestionIndex(i => Math.min(i + 1, locationSuggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSuggestionIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      if (suggestionIndex >= 0 && suggestionIndex < locationSuggestions.length) {
        selectSuggestion(locationSuggestions[suggestionIndex])
        e.preventDefault()
      }
    }
  }

  // Favorite management
  const toggleFavorite = (cityName) => {
    setFavorites(prev => {
      let updated
      if (prev.map(c=>c.toLowerCase()).includes(cityName.toLowerCase())) {
        updated = prev.filter(c=>c.toLowerCase()!==cityName.toLowerCase())
      } else {
        updated = [cityName, ...prev]
      }
      localStorage.setItem('favorites', JSON.stringify(updated))
      return updated
    })
  }

  const isFavoriteCity = (cityName) => {
    return favorites.map(c=>c.toLowerCase()).includes(cityName.toLowerCase())
  }

  // Chatbot functions
  const handleChatSubmit = async (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMessage = chatInput.trim()
    setChatMessages(prev => [...prev, { type: 'user', text: userMessage }])
    setChatInput('')
    setChatLoading(true)

    try {
      // Simple keyword-based responses
      let response = await generateChatResponse(userMessage)
      setChatMessages(prev => [...prev, { type: 'bot', text: response }])
    } catch (error) {
      setChatMessages(prev => [...prev, { type: 'bot', text: 'Sorry, I couldn\'t process your request. Please try again.' }])
    } finally {
      setChatLoading(false)
    }
  }

  const generateChatResponse = async (message) => {
    const lowerMessage = message.toLowerCase()
    
    // Weather-related questions
    if (lowerMessage.includes('temperature') || lowerMessage.includes('hot') || lowerMessage.includes('cold')) {
      if (currentWeather) {
        return `The current temperature in ${currentWeather.city} is ${Math.round(currentWeather.temperature_c)}°C and it feels like ${Math.round(currentWeather.feels_like_c)}°C.`
      }
    }
    
    if (lowerMessage.includes('weather') || lowerMessage.includes('condition')) {
      if (aiSummary) {
        return aiSummary.summary
      }
    }
    
    if (lowerMessage.includes('clothing') || lowerMessage.includes('wear') || lowerMessage.includes('outfit')) {
      if (clothing) {
        return `For today's weather, I recommend: ${clothing.recommendation}`
      }
    }
    
    if (lowerMessage.includes('activity') || lowerMessage.includes('do') || lowerMessage.includes('plan')) {
      if (activity) {
        return activity.activity_plan
      }
    }
    
    if (lowerMessage.includes('air quality') || lowerMessage.includes('air')) {
      if (airQuality) {
        return `The air quality in ${airQuality.city} is ${airQuality.label} (AQI: ${airQuality.air_quality_index}).`
      }
    }
    
    if (lowerMessage.includes('forecast') || lowerMessage.includes('tomorrow')) {
      if (forecast && forecast.forecast && forecast.forecast.length > 1) {
        const tomorrow = forecast.forecast[1]
        return `Tomorrow in ${forecast.city}, expect ${tomorrow.condition} weather with a high of ${Math.round(tomorrow.temperature_c)}°C.`
      }
    }
    
    // Greeting responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return 'Hello! How can I help you with weather information today?'
    }
    
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return 'You\'re welcome! Is there anything else I can help you with?'
    }
    
    // Default response
    return 'I can help you with weather information, clothing recommendations, activity suggestions, and air quality. What would you like to know?'
  }

  return (
    <div className="weather-app">
      <header className="header">
        <h1>🌤️ AI Weather Analytics Platform</h1>
        <div className="header-controls">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-container">
              <input
                type="text"
                value={city}
                onChange={handleCityInputChange}
                onKeyDown={handleKeyDown}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onFocus={() => city.length && locationSuggestions.length && setShowSuggestions(true)}
                placeholder="Enter city name..."
                className="search-input"
              />
              {showSuggestions && (
                <div className="suggestions-dropdown">
                  {locationSuggestions.length > 0 && (
                    locationSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className={`suggestion-item ${index === suggestionIndex ? 'highlighted' : ''}`}
                        onClick={() => selectSuggestion(suggestion)}
                      >
                        {`${suggestion.name}${suggestion.state ? ', ' + suggestion.state : ''}, ${suggestion.country}${suggestion.district ? ' ('+suggestion.district+')' : ''}`}
                      </div>
                    ))
                  )}

                  {favorites.length > 0 && (
                    <div className="favorites-list">
                      <div className="recent-header">Favorites</div>
                      {favorites.map((item, idx) => (
                        <div
                          key={idx}
                          className="suggestion-item"
                          onClick={() => selectSuggestion(item)}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  )}

                  {locationSuggestions.length === 0 && recentSearches.length > 0 && (
                    <div className="recent-list">
                      <div className="recent-header">Recent Searches</div>
                      {recentSearches.map((item, idx) => (
                        <div
                          key={idx}
                          className="suggestion-item"
                          onClick={() => selectSuggestion(item)}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <button type="submit" className="search-btn">Search</button>
          </form>
          <button 
            className="chatbot-toggle"
            onClick={() => setShowChatbot(!showChatbot)}
          >
            💬 Chat
          </button>
          <button
            className="favorite-toggle"
            onClick={() => toggleFavorite(city)}
            title={isFavoriteCity(city) ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavoriteCity(city) ? '⭐' : '☆'}
          </button>
        </div>
      </header>

      <main className="main-content">
        {loading && <div className="loading">Loading weather data...</div>}
        {error && <div className="error">{error}</div>}

        <div className="dashboard-grid">
          {currentWeather && (
            <div className="current-weather">
              <h2>{currentWeather.city}</h2>
              <div className="weather-main">
                <div className="weather-icon">{getWeatherIcon(currentWeather.weather_main)}</div>
                <div className="temp">{Math.round(currentWeather.temperature_c)}°C</div>
                <div className="condition">{currentWeather.weather_description}</div>
                <div className="details">
                  <span>Feels like: {Math.round(currentWeather.feels_like_c)}°C</span>
                  <span>Humidity: {currentWeather.humidity_percent}%</span>
                  <span>Wind: {Math.round(currentWeather.wind_speed_mps * 3.6)} km/h</span>
                </div>
              </div>
            </div>
          )}

          {airQuality && (
            <div className="air-quality">
              <h3>🌬️ Air Quality</h3>
              <div className="aqi-display">
                <div 
                  className="aqi-circle" 
                  style={{ backgroundColor: getAirQualityColor(airQuality.air_quality_index) }}
                >
                  {airQuality.air_quality_index}
                </div>
                <div className="aqi-label">{airQuality.label}</div>
              </div>
            </div>
          )}

          {aiSummary && (
            <div className="ai-insights">
              <h3>🤖 AI Weather Summary</h3>
              <p>{aiSummary.summary}</p>
            </div>
          )}

          {clothing && (
            <div className="ai-insights">
              <h3>👕 Clothing Recommendation</h3>
              <p>{clothing.recommendation}</p>
            </div>
          )}

          {activity && (
            <div className="ai-insights">
              <h3>🎯 Activity Plan</h3>
              <p>{activity.activity_plan}</p>
            </div>
          )}
        </div>

        {forecast && forecast.forecast && (
          <div className="forecast">
            <h3>📅 7-Day Forecast</h3>
            <div className="forecast-grid">
              {forecast.forecast.slice(0, 7).map((day, index) => (
                <div key={index} className="forecast-day">
                  <div className="day-name">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div className="day-icon">{getWeatherIcon(day.condition)}</div>
                  <div className="day-temp">{Math.round(day.temperature_c)}°C</div>
                  <div className="day-condition">{day.condition}</div>
                  <div className="day-details">
                    <span>💧 {day.humidity}%</span>
                    <span>💨 {day.wind_kph} km/h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Chatbot */}
      {showChatbot && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <h3>🤖 Weather Assistant</h3>
            <button 
              className="chatbot-close"
              onClick={() => setShowChatbot(false)}
            >
              ✕
            </button>
          </div>
          <div className="chatbot-messages">
            {chatMessages.map((message, index) => (
              <div key={index} className={`chat-message ${message.type}`}>
                <div className="message-content">{message.text}</div>
              </div>
            ))}
            {chatLoading && (
              <div className="chat-message bot">
                <div className="message-content typing">Typing...</div>
              </div>
            )}
          </div>
          <form onSubmit={handleChatSubmit} className="chatbot-input-form">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask me about weather..."
              className="chatbot-input"
              disabled={chatLoading}
            />
            <button 
              type="submit" 
              className="chatbot-send-btn"
              disabled={chatLoading || !chatInput.trim()}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default App
