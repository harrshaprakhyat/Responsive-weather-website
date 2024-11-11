const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');
const gpsBtn = document.querySelector('.gps-btn');
const notFoundSection = document.querySelector('.not-found');
const searchCitySection = document.querySelector('.search-city');
const weatherInfoSection = document.querySelector('.weather-info');
const countryTxt = document.querySelector('.country-txt');
const tempTxt = document.querySelector('.temp-txt');
const conditionTxt = document.querySelector('.condition-txt');
const humidityValueTxt = document.querySelector('.humidity-value-txt');
const windValueTxt = document.querySelector('.wind-value-txt');
const weatherSummaryImg = document.querySelector('.weather-summary-img');
const currentDateTxt = document.querySelector('.current-date-txt');
const forecastItemsContainer = document.querySelector('.forecast-items-container');
const body = document.body;

const apiKey = '0afeb50365adc57efc53c185a501c342';
const unsplashApiKey = '3gE-1jsRpEwK8YCmU14PKgnDMWf-gHZ-V-bUYxwBaCk'; 

searchBtn.addEventListener('click', () => {
  if (cityInput.value.trim() !== '') {
    updateWeatherInfo(cityInput.value);
    cityInput.value = '';
    cityInput.blur();
  }
});

cityInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && cityInput.value.trim() !== '') {
    updateWeatherInfo(cityInput.value);
    cityInput.value = '';
    cityInput.blur();
  }
});

gpsBtn.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const weatherData = await getFetchData('weather', `lat=${latitude}&lon=${longitude}`);
      updateWeatherInfo(weatherData.name);
    }, () => {
      alert('Unable to retrieve your location.');
    });
  } else {
    alert('Geolocation is not supported by your browser.');
  }
});

async function getFetchData(endPoint, query) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?${query}&appid=${apiKey}&units=metric`;
  const response = await fetch(apiUrl);
  return response.json();
}

async function getUnsplashImage(query) {
  const apiUrl = `https://api.unsplash.com/photos/random?query=${query}&client_id=${unsplashApiKey}`;
  const response = await fetch(apiUrl);
  const data = await response.json();
  return data.urls.regular;
}

async function updateBackgroundImage(city) {
  try {
    const imageUrl = await getUnsplashImage(city);
    body.style.backgroundImage = `url('${imageUrl}')`;
    body.style.backgroundSize = 'cover';
    body.style.backgroundPosition = 'center';
  } catch (error) {
    console.error("Error fetching background image:", error);
  }
}

async function updateForecastsInfo(city) {
  const forecastsData = await getFetchData('forecast', `q=${city}`);
  
  const uniqueDates = new Set();
  forecastItemsContainer.innerHTML = '';

  forecastsData.list.forEach(forecastWeather => {
    const date = forecastWeather.dt_txt.split(' ')[0]; 

    if (!uniqueDates.has(date) && forecastWeather.dt_txt.includes('12:00:00')) {
      uniqueDates.add(date);
      updateForecastsItems(forecastWeather);
    }

    
    if (uniqueDates.size === 8) {
      return;
    }
  });
}


async function updateWeatherInfo(city) {
  const weatherData = await getFetchData('weather', `q=${city}`);

  if (weatherData.cod !== 200) {
    showDisplaySection(notFoundSection);
    return;
  }

  const {
    name: country,
    main: { temp, humidity },
    weather: [{ id, main }],
    wind: { speed }
  } = weatherData;

  countryTxt.textContent = country;
  tempTxt.textContent = Math.round(temp) + ' °C';
  conditionTxt.textContent = main;
  humidityValueTxt.textContent = humidity + ' %';
  windValueTxt.textContent = speed + ' M/s';

  currentDateTxt.textContent = getCurrentDate();
  weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;

  await updateForecastsInfo(city);
  await updateBackgroundImage(country);  

  showDisplaySection(weatherInfoSection);
}

async function updateWeatherInfo(city) {
  const weatherData = await getFetchData('weather', `q=${city}`);

  if (weatherData.cod !== 200) {
    showDisplaySection(notFoundSection);
    return;
  }

  const {
    name: country,
    main: { temp, humidity },
    weather: [{ id, main }],
    wind: { speed }
  } = weatherData;

  countryTxt.textContent = country;
  tempTxt.textContent = Math.round(temp) + ' °C';
  conditionTxt.textContent = main;
  humidityValueTxt.textContent = humidity + ' %';
  windValueTxt.textContent = speed + ' M/s';

  currentDateTxt.textContent = getCurrentDate();
  weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;

  await updateForecastsInfo(city);
  await updateBackgroundImage(country);

  showDisplaySection(weatherInfoSection);
}



function updateForecastsItems(weatherData) {
  const {
    dt_txt: date,
    weather: [{ id }],
    main: { temp }
  } = weatherData;

  const dateTaken = new Date(date);
  const dateOption = {
    day: '2-digit',
    month: 'short'
  };
  const dateResult = dateTaken.toLocaleDateString('en-US', dateOption);

  const forecastItem = `
    <div class="forecast-item">
        <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
        <img src="./assets/weather/${getWeatherIcon(id)}" alt="weather-forecast" class="forecast-item-img">
        <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
    </div>
  `;

  forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem);
}

function getWeatherIcon(id) {
  if (id <= 232) return 'thunderstorm.svg';
  if (id <= 321) return 'drizzle.svg';
  if (id <= 531) return 'rain.svg';
  if (id <= 622) return 'snow.svg';
  if (id <= 781) return 'atmosphere.svg';
  if (id <= 800) return 'clear.svg';
  else return 'clouds.svg';
}

function getCurrentDate() {
  const currentDate = new Date();
  const options = {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
  };
  return currentDate.toLocaleDateString('en-GB', options);
}

function showDisplaySection(section) {
  [weatherInfoSection, searchCitySection, notFoundSection]
    .forEach(sec => sec.style.display = 'none');
  section.style.display = 'flex';
}
