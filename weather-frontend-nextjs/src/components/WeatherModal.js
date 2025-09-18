"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import "./WeatherModal.css"

export default function WeatherModal({ isOpen, onClose }) {
  const [city, setCity] = useState("")
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    if (isOpen && !mapLoaded) {
      loadTomTomSDK()
    }
  }, [isOpen, mapLoaded])

  useEffect(() => {
    if (mapLoaded && weatherData && isOpen) {
      initializeMap(weatherData.coord.lat, weatherData.coord.lon)
    } else if (mapLoaded && isOpen && !weatherData) {
      // Initialize with default coordinates (Bhopal, India)
      initializeMap(23.2599, 77.4126)
    }
  }, [mapLoaded, weatherData, isOpen])

  const loadTomTomSDK = () => {
    if (window.tt) {
      setMapLoaded(true)
      return
    }

    // Load TomTom CSS
    const cssLink = document.createElement("link")
    cssLink.rel = "stylesheet"
    cssLink.href = "https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps.css"
    document.head.appendChild(cssLink)

    // Load TomTom Maps SDK
    const mapsScript = document.createElement("script")
    mapsScript.src = "https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps-web.min.js"
    mapsScript.onload = () => {
      // Load TomTom Services SDK
      const servicesScript = document.createElement("script")
      servicesScript.src = "https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/services/services-web.min.js"
      servicesScript.onload = () => {
        setMapLoaded(true)
      }
      document.head.appendChild(servicesScript)
    }
    document.head.appendChild(mapsScript)
  }

  const initializeMap = (lat, lon) => {
    if (!window.tt || !mapRef.current) return

    // Destroy existing map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
    }

    const apiKey = process.env.NEXT_PUBLIC_TOMTOM_API_KEY

    try {
      const map = window.tt.map({
        key: apiKey,
        container: mapRef.current,
        center: [lon, lat],
        zoom: 12,
        style: "main",
      })

      // Add navigation controls
      map.addControl(new window.tt.NavigationControl())
      map.addControl(new window.tt.FullscreenControl())

      // Add traffic incidents layer
      map.on("load", () => {
        // Add traffic flow layer
        map.addSource("traffic-flow", {
          type: "vector",
          url: `https://api.tomtom.com/traffic/map/4/tile/flow/absolute/{z}/{x}/{y}.pbf?key=${apiKey}`,
        })

        map.addLayer({
          id: "traffic-flow-layer",
          type: "line",
          source: "traffic-flow",
          "source-layer": "Traffic flow",
          paint: {
            "line-color": [
              "case",
              ["==", ["get", "traffic_level"], 0],
              "#00ff00", // Free flow - green
              ["==", ["get", "traffic_level"], 1],
              "#ffff00", // Light traffic - yellow
              ["==", ["get", "traffic_level"], 2],
              "#ff8000", // Moderate traffic - orange
              ["==", ["get", "traffic_level"], 3],
              "#ff0000", // Heavy traffic - red
              "#800080", // Severe traffic - purple
            ],
            "line-width": 3,
            "line-opacity": 0.8,
          },
        })

        // Add traffic incidents
        fetchTrafficIncidents(lat, lon, map, apiKey)
      })

      mapInstanceRef.current = map
    } catch (error) {
      console.error("Error initializing TomTom map:", error)
    }
  }

  const fetchTrafficIncidents = async (lat, lon, map, apiKey) => {
    try {
      const bbox = `${lon - 0.1},${lat - 0.1},${lon + 0.1},${lat + 0.1}`
      const incidentsUrl = `https://api.tomtom.com/traffic/services/5/incidentDetails?key=${apiKey}&bbox=${bbox}&fields=incidents{type,geometry{type,coordinates},properties{iconCategory,magnitudeOfDelay,events{description,code,iconCategory}}}`

      const response = await fetch(incidentsUrl)
      const data = await response.json()

      if (data.incidents) {
        data.incidents.forEach((incident, index) => {
          if (incident.geometry && incident.geometry.coordinates) {
            const coords = incident.geometry.coordinates
            let markerCoords

            if (incident.geometry.type === "Point") {
              markerCoords = coords
            } else if (incident.geometry.type === "LineString" && coords.length > 0) {
              markerCoords = coords[0]
            }

            if (markerCoords) {
              const popup = new window.tt.Popup({ offset: 35 }).setHTML(
                `<div style="padding: 10px;">
                  <strong>Traffic Incident</strong><br/>
                  ${incident.properties.events?.[0]?.description || "Traffic incident reported"}
                </div>`,
              )

              new window.tt.Marker({
                color: "#ff0000",
              })
                .setLngLat(markerCoords)
                .setPopup(popup)
                .addTo(map)
            }
          }
        })
      }
    } catch (error) {
      console.error("Error fetching traffic incidents:", error)
    }
  }

  const fetchWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city name")
      return
    }

    setLoading(true)
    setError("")
    setWeatherData(null)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
      const response = await axios.get(`${backendUrl}/api/weather`, {
        params: { city: city.trim() },
      })

      setWeatherData(response.data)
    } catch (err) {
      console.error("Weather fetch error:", err)
      setError(err.response?.data?.error || "Failed to fetch weather data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      fetchWeather()
    }
  }

  const formatTemperature = (temp) => {
    return Math.round(temp)
  }

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (l) => l.toUpperCase())
  }

  useEffect(() => {
    if (!isOpen && mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Weather & Traffic Information</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Weather Section */}
          <div className="weather-section">
            <h3>Weather Information</h3>

            <div className="weather-input-group">
              <input
                type="text"
                placeholder="Enter city name..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={handleKeyPress}
                className="city-input"
                disabled={loading}
              />
              <button onClick={fetchWeather} disabled={loading || !city.trim()} className="get-weather-button">
                {loading ? "Loading..." : "Get Weather"}
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {weatherData && (
              <div className="weather-display">
                <div className="weather-header">
                  <h4>
                    {weatherData.name}, {weatherData.sys.country}
                  </h4>
                  <div className="weather-icon">
                    <img
                      src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                      alt={weatherData.weather[0].description}
                    />
                  </div>
                </div>

                <div className="weather-details">
                  <div className="weather-item">
                    <span className="weather-label">Condition:</span>
                    <span className="weather-value">{capitalizeWords(weatherData.weather[0].description)}</span>
                  </div>

                  <div className="weather-item">
                    <span className="weather-label">Temperature:</span>
                    <span className="weather-value">{formatTemperature(weatherData.main.temp)}°C</span>
                  </div>

                  <div className="weather-item">
                    <span className="weather-label">Feels like:</span>
                    <span className="weather-value">{formatTemperature(weatherData.main.feels_like)}°C</span>
                  </div>

                  <div className="weather-item">
                    <span className="weather-label">Humidity:</span>
                    <span className="weather-value">{weatherData.main.humidity}%</span>
                  </div>

                  <div className="weather-item">
                    <span className="weather-label">Wind Speed:</span>
                    <span className="weather-value">{weatherData.wind.speed} m/s</span>
                  </div>

                  <div className="weather-item">
                    <span className="weather-label">Pressure:</span>
                    <span className="weather-value">{weatherData.main.pressure} hPa</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Traffic Map Section */}
          <div className="traffic-section">
            <h3>Traffic Map</h3>
            <div className="traffic-map-container">
              <div ref={mapRef} id="traffic-map" className="traffic-map" style={{ width: "100%", height: "100%" }} />
              {!mapLoaded && <div className="map-loading">Loading traffic map...</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
