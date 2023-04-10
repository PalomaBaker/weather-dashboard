const apiKey = "1b16586f7ab6cdf1410b61cfd6a55e1f";
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const searchButton = document.querySelector("#search-button");
const historyList = document.querySelector("#history");
const todaySection = document.querySelector("#today");
const forecastSection = document.querySelector("#forecast");

// Search for a city
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchTerm = searchInput.value;
  if (searchTerm) {
    searchCity(searchTerm);
    searchInput.value = "";
  }
});

// Search for city weather
async function searchCity(searchTerm) {
  const weatherData = await getWeatherData(searchTerm);
  if (weatherData) {
    addCityToHistory(searchTerm);
    showTodayWeather(weatherData);
    showForecast(weatherData);
  }
}

// Get weather data from API
async function getWeatherData(searchTerm) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${searchTerm}&units=metric&appid=${apiKey}`
    );
    const data = await response.json();
    if (response.ok) {
      const lat = data.coord.lat;
      const lon = data.coord.lon;
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&units=metric&appid=${apiKey}`
      );
      const forecastData = await forecastResponse.json();
      return { ...data, ...forecastData };
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error(error);
    alert(`Error: ${error.message}`);
    return null;
  }
}

// Add city to search history
function addCityToHistory(city) {
  const li = document.createElement("li");
  const button = document.createElement("button");
  button.classList.add("btn", "btn-secondary", "history-item");
  button.textContent = city;
  li.appendChild(button);
  historyList.prepend(li);
  button.addEventListener("click", () => {
    searchCity(city);
  });
}



// Show today's weather
function showTodayWeather(weatherData) {
  todaySection.innerHTML = `
    <h2>${weatherData.name} (${dayjs().format("M/D/YYYY")})<img src="https://openweathermap.org/img/w/${weatherData.weather[0].icon}.png" alt="${
    weatherData.weather[0].description
  }" /></h2>
    <p>Temperature: ${weatherData.main.temp} &#8451;</p>
    <p>Humidity: ${weatherData.main.humidity}%</p>
    <p>Wind Speed: ${weatherData.wind.speed} m/s</p>
    <p>UV Index: <span id="uv-index">${weatherData.current.uvi}</span></p>
  `;
  const uvIndex = document.querySelector("#uv-index");
  if (uvIndex) {
    if (weatherData.current.uvi <= 2) {
      uvIndex.classList.add("bg-success", "text-white", "rounded", "p-1");
    } else if (weatherData.current.uvi <= 5) {
      uvIndex.classList.add("bg-warning", "text-white", "rounded", "p-1");
    } else {
      uvIndex.classList.add("bg-danger", "text-white", "rounded", "p-1");
    }
  }};    

  function showForecast(weatherData) {
    const forecastData = weatherData.daily.slice(1, 6); // Get the forecast data for the next 5 days
    forecastSection.innerHTML = `
      <h2>5-Day Forecast:</h2>
    `;
    const forecastList = document.createElement("div");
    forecastList.classList.add("row");
    forecastData.forEach((day) => {
      const forecastItem = document.createElement("div");
      forecastItem.classList.add("col-md-2", "col-6");
      forecastItem.innerHTML = `
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">${dayjs.unix(day.dt).format("dddd")}</h5>
            <img src="https://openweathermap.org/img/w/${day.weather[0].icon}.png" alt="${day.weather[0].description}" />
            <p class="card-text">Temperature: ${day.temp.day} &#8451;</p>
            <p class="card-text">Humidity: ${day.humidity}%</p>
            <p class="card-text">Wind Speed: ${day.wind_speed} m/s</p>
          </div>
        </div>
      `;
      forecastList.appendChild(forecastItem);
    });
    forecastSection.appendChild(forecastList);
  };
  