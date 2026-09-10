/* ============================================================
   Weather Dashboard
   - Fetch API + async/await
   - Error handling for failed network requests
   - Parsing & rendering nested JSON
   - City search via geocoding endpoint
   ============================================================ */

// Public, key-free endpoints
const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

// Maps Open-Meteo's numeric "weather codes" to human text + emoji.
// (Nested JSON from the API only gives us codes, not descriptions.)
const WEATHER_CODES = {
  0: ['Clear sky', '☀️'],
  1: ['Mainly clear', '🌤️'],
  2: ['Partly cloudy', '⛅'],
  3: ['Overcast', '☁️'],
  45: ['Fog', '🌫️'],
  48: ['Depositing rime fog', '🌫️'],
  51: ['Light drizzle', '🌦️'],
  53: ['Moderate drizzle', '🌦️'],
  55: ['Dense drizzle', '🌧️'],
  56: ['Light freezing drizzle', '🌧️'],
  57: ['Dense freezing drizzle', '🌧️'],
  61: ['Slight rain', '🌦️'],
  63: ['Moderate rain', '🌧️'],
  65: ['Heavy rain', '🌧️'],
  66: ['Light freezing rain', '🌧️'],
  67: ['Heavy freezing rain', '🌧️'],
  71: ['Slight snow fall', '🌨️'],
  73: ['Moderate snow fall', '🌨️'],
  75: ['Heavy snow fall', '❄️'],
  77: ['Snow grains', '❄️'],
  80: ['Slight rain showers', '🌦️'],
  81: ['Moderate rain showers', '🌧️'],
  82: ['Violent rain showers', '⛈️'],
  85: ['Slight snow showers', '🌨️'],
  86: ['Heavy snow showers', '❄️'],
  95: ['Thunderstorm', '⛈️'],
  96: ['Thunderstorm with light hail', '⛈️'],
  99: ['Thunderstorm with heavy hail', '⛈️'],
};

// --- DOM references -----------------------------------------
const searchForm = document.getElementById('searchForm');
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locateBtn = document.getElementById('locateBtn');

const statusBox = document.getElementById('statusBox');
const loader = document.getElementById('loader');
const weatherCard = document.getElementById('weatherCard');
const emptyState = document.getElementById('emptyState');

// --- UI helpers ------------------------------------------------
function showStatus(message, type = 'error') {
  statusBox.textContent = message;
  statusBox.className = `status-box ${type}`;
  statusBox.classList.remove('hidden');
}

function clearStatus() {
  statusBox.classList.add('hidden');
  statusBox.textContent = '';
}

function setLoading(isLoading) {
  loader.classList.toggle('hidden', !isLoading);
  searchBtn.disabled = isLoading;
  if (isLoading) {
    weatherCard.classList.add('hidden');
    emptyState.classList.add('hidden');
  }
}

function weatherCodeInfo(code) {
  return WEATHER_CODES[code] || ['Unknown', '🌡️'];
}

function windDirectionLabel(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

// --- Networking layer -------------------------------------------
/**
 * Generic fetch wrapper with robust error handling for:
 * - network failures (offline, DNS, CORS)
 * - non-2xx HTTP responses
 * - malformed JSON
 */
async function fetchJSON(url) {
  let response;
  try {
    response = await fetch(url);
  } catch (networkErr) {
    throw new Error('Network request failed. Check your internet connection and try again.');
  }

  if (!response.ok) {
    throw new Error(`Request failed (HTTP ${response.status}). Please try again.`);
  }

  try {
    return await response.json();
  } catch (parseErr) {
    throw new Error('Received an invalid response from the weather service.');
  }
}

/**
 * Looks up a city by name using the geocoding API.
 * Returns { name, country, latitude, longitude, timezone } or throws.
 */
async function geocodeCity(cityName) {
  const url = `${GEOCODE_URL}?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
  const data = await fetchJSON(url);

  // Nested JSON parsing: results is an array of location objects
  if (!data.results || data.results.length === 0) {
    throw new Error(`No city found matching "${cityName}". Try a different spelling.`);
  }

  const place = data.results[0];
  return {
    name: place.name,
    country: place.country || '',
    admin1: place.admin1 || '',
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: place.timezone,
  };
}

/**
 * Fetches current + daily forecast weather for given coordinates.
 */
async function fetchWeather(lat, lon, timezone) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,cloud_cover,precipitation',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    timezone: timezone || 'auto',
    forecast_days: '6',
  });
  const url = `${WEATHER_URL}?${params.toString()}`;
  return fetchJSON(url); // deeply nested JSON: { current: {...}, daily: {...} }
}

// --- Rendering ---------------------------------------------------
function renderWeather(location, weatherData) {
  const current = weatherData.current; // nested object
  const daily = weatherData.daily;     // nested object with parallel arrays

  const [conditionText, icon] = weatherCodeInfo(current.weather_code);

  document.getElementById('cityName').textContent = location.name;
  document.getElementById('cityMeta').textContent =
    [location.admin1, location.country].filter(Boolean).join(', ') || '—';

  const localDate = new Date();
  document.getElementById('localTime').textContent =
    `Updated ${localDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  document.getElementById('weatherIcon').textContent = icon;
  document.getElementById('temperature').textContent = `${Math.round(current.temperature_2m)}°C`;
  document.getElementById('condition').textContent = conditionText;
  document.getElementById('feelsLike').textContent =
    `Feels like ${Math.round(current.apparent_temperature)}°C`;

  document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`;
  document.getElementById('windSpeed').textContent = `${current.wind_speed_10m} km/h`;
  document.getElementById('windDir').textContent =
    `${windDirectionLabel(current.wind_direction_10m)} (${current.wind_direction_10m}°)`;
  document.getElementById('pressure').textContent = `${Math.round(current.surface_pressure)} hPa`;
  document.getElementById('cloudCover').textContent = `${current.cloud_cover}%`;
  document.getElementById('precip').textContent = `${current.precipitation} mm`;

  // Render 5-day forecast from parallel arrays in the nested "daily" object
  const forecastRow = document.getElementById('forecastRow');
  forecastRow.innerHTML = '';

  // Skip index 0 (today) and show the next 5 days
  const days = daily.time.slice(1, 6);
  days.forEach((dateStr, idx) => {
    const i = idx + 1;
    const [, dayIcon] = weatherCodeInfo(daily.weather_code[i]);
    const dayName = new Date(dateStr).toLocaleDateString([], { weekday: 'short' });
    const max = Math.round(daily.temperature_2m_max[i]);
    const min = Math.round(daily.temperature_2m_min[i]);

    const el = document.createElement('div');
    el.className = 'forecast-day';
    el.innerHTML = `
      <span class="day-name">${dayName}</span>
      <span class="day-icon">${dayIcon}</span>
      <span class="day-temp">${max}° / ${min}°</span>
    `;
    forecastRow.appendChild(el);
  });

  weatherCard.classList.remove('hidden');
  emptyState.classList.add('hidden');
}

// --- Orchestration -------------------------------------------------
async function loadWeatherForCity(cityName) {
  clearStatus();
  setLoading(true);
  try {
    const location = await geocodeCity(cityName);
    const weatherData = await fetchWeather(location.latitude, location.longitude, location.timezone);
    renderWeather(location, weatherData);
  } catch (err) {
    weatherCard.classList.add('hidden');
    emptyState.classList.remove('hidden');
    showStatus(err.message || 'Something went wrong fetching weather data.', 'error');
  } finally {
    setLoading(false);
  }
}

async function loadWeatherForCoords(lat, lon) {
  clearStatus();
  setLoading(true);
  try {
    const weatherData = await fetchWeather(lat, lon, 'auto');
    renderWeather({ name: 'Your Location', country: '', admin1: '' }, weatherData);
  } catch (err) {
    weatherCard.classList.add('hidden');
    emptyState.classList.remove('hidden');
    showStatus(err.message || 'Could not load weather for your location.', 'error');
  } finally {
    setLoading(false);
  }
}

// --- Event listeners --------------------------------------------------
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) return;
  loadWeatherForCity(city);
});

locateBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    showStatus('Geolocation is not supported by your browser.', 'error');
    return;
  }
  clearStatus();
  showStatus('Locating you…', 'info');
  navigator.geolocation.getCurrentPosition(
    (pos) => loadWeatherForCoords(pos.coords.latitude, pos.coords.longitude),
    () => showStatus('Location permission denied or unavailable.', 'error')
  );
});

// Load a default city on first visit so the dashboard isn't empty
window.addEventListener('DOMContentLoaded', () => {
  loadWeatherForCity('London');
});
