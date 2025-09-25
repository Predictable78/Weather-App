// Enhanced Weather App with ES6 Features and Random Header Image

// get dom elements we will use throughout the app
const formEl = document.getElementById("form-search"); // the search form
const cityField = document.getElementById("city-input"); // input field for city
const msgEl = document.getElementById("msg"); // status messages
const errBox = document.getElementById("problem"); // error messages
const outBox = document.getElementById("output"); // weather output container
const locEl = document.getElementById("location"); // place name element
const tempBox = document.getElementById("temperature"); // temperature element
const windBox = document.getElementById("wind-speed"); // wind speed element
const condBox = document.getElementById("weather"); // condition element
const headerImage = document.getElementById("header-image"); // header image element

// mapping of numeric weather codes from api to human readable text
// Using object spread for better maintainability
const baseCodeMap = {
  0: "clear",
  1: "mainly clear",
  2: "partly cloudy",
  3: "overcast",
  45: "fog",
  48: "depositing rime fog",
  51: "light drizzle",
  53: "moderate drizzle",
  55: "dense drizzle",
  61: "slight rain",
  63: "moderate rain",
  65: "heavy rain",
  71: "slight snow",
  73: "moderate snow",
  75: "heavy snow",
  95: "thunderstorm"
};

// Add additional weather codes using spread operator
const codeMap = {
  ...baseCodeMap,
  80: "rain showers",
  81: "moderate rain showers",
  82: "violent rain showers",
  85: "slight snow showers",
  86: "heavy snow showers"
};

// Function to set static header image
const setHeaderImage = () => {
  if (headerImage) {
    headerImage.src = "images/banner.jpg";
    headerImage.alt = "Weather background";
  }
};

// Function to get weather emoji (bonus feature using spread operator)
const getWeatherEmoji = (weatherCode) => {
  const emojiMap = {
    0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
    45: "🌫️", 48: "🌫️", 51: "🌦️", 53: "🌦️", 55: "🌧️",
    61: "🌦️", 63: "🌧️", 65: "🌧️", 71: "🌨️", 73: "🌨️", 75: "🌨️",
    95: "⛈️"
  };
  
  return emojiMap[weatherCode] ?? "🌤️";
};

// Function to process weather data using destructuring and spread
const processWeatherData = (geoData, weatherData) => {
  // Destructure geo data
  const { latitude, longitude, name, country } = geoData;
  
  // Destructure weather data
  const { temperature_2m, wind_speed_10m, weather_code } = weatherData;
  
  // Use nullish coalescing operator for fallback
  const condition = codeMap[weather_code] ?? `code ${weather_code}`;
  const emoji = getWeatherEmoji(weather_code);
  
  // Return processed data using object spread
  return {
    location: `${name}, ${country}`,
    temperature: temperature_2m,
    windSpeed: wind_speed_10m,
    condition: `${emoji} ${condition}`,
    coordinates: { latitude, longitude }
  };
};

// generic helper function to fetch json data from an endpoint
async function loadJSON(endpoint) {
  // perform fetch request
  const res = await fetch(endpoint);
  // if response not ok, throw error with status
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  // return parsed json
  return res.json();
}

// Set static header image on page load
setHeaderImage();

// attach event listener to the form submission
formEl.addEventListener("submit", async (e) => {
  // prevent form from refreshing the page
  e.preventDefault();

  // clear error text before new request
  errBox.textContent = "";
  // hide old result if any
  outBox.hidden = true;

  // get trimmed city name from user input
  const query = cityField.value.trim();
  if (!query) return; // do nothing if empty

  try {
    // show status message while looking up city coordinates
    msgEl.textContent = "looking up city…";

    // call geocoding api to get latitude and longitude
    const geoData = await loadJSON(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1`);

    // if no results, throw an error
    if (!geoData.results || !geoData.results.length) throw new Error("city not found");

    // destructure latitude, longitude, name, country from the first result
    const { latitude, longitude, name, country } = geoData.results[0];

    // update status to show we are fetching weather now
    msgEl.textContent = "fetching weather…";

    // call weather api with coordinates to get current weather data
    const weatherData = await loadJSON(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,weather_code`);

    // grab the current weather object from the response
    const curWeather = weatherData.current;

    // Process weather data using our new function
    const processedData = processWeatherData(geoData.results[0], curWeather);

    // update dom elements with data using destructuring
    const { location, temperature, windSpeed, condition } = processedData;
    
    locEl.textContent = location; // show location name
    tempBox.textContent = temperature; // show temperature
    windBox.textContent = windSpeed; // show wind speed
    condBox.textContent = condition; // show condition text with emoji

    // make the result box visible again
    outBox.hidden = false;

    // clear the status message
    msgEl.textContent = "";

    // Header image remains static - no need to change it
  } catch (err) {
    // if an error occurred, clear status and show error message
    msgEl.textContent = "";
    errBox.textContent = err.message || "something went wrong";
  }
});
