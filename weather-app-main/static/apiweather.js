//-----------------Converting city name to latitude and longitudes------------------

let latitude = "";
let longitude = "";

let current_col = "";
//-----------------Daily Forecast--------------------

//----* ---- function to convert weather codes to icons
const codetoIcon = (code) => {
    if (code === 0) return 'icon-sunny.webp';
    if (code === 1) return 'icon-sunny.webp';
    if (code === 2) return 'icon-partly-cloudy.webp';
    if (code === 3) return 'icon-overcast.webp';
    if (code >= 45 && code <= 48) return 'icon-fog.webp';
    if (code >= 51 && code <= 57) return 'icon-drizzle.webp';
    if (code >= 61 && code <= 67) return 'icon-rain.webp';
    if (code >= 71 && code <= 77) return 'icon-snow.webp';
    if (code >= 80 && code <= 82) return 'icon-rain.webp';
    if (code >= 85 && code <= 86) return 'icon-snow.webp';
    if (code >= 95 && code <= 99) return 'icon-storm.webp';
    return 'icon-overcast.webp';                       // fallback
};

const daysoftheweek = []
//----------getting user's date time 
// ----fetchCurrentDailyWeather()--- 1. , 
// 1. await navigator.geolocation.getCurrentPosition ----- get the user's current latitude and longitude
// 2. getUserCurrentTempandWeather() ----- get the user's current (1.)temperature and (2.)weather using await navigator.geolocation.getCurrentPosition and display
// 3. getgetUserCurrentTimeandDate() ----- get the user's current time and date from the Date() JS object and display
//

// const loading = async () =>{
//     //----------Loading Screen
//     document.querySelector('.main-content').classList.add('loading');
//     document.querySelector('.loading').textContent = 'Loading...';
// }

// const removeLoading = async () =>{
//     document.querySelector('.main-content').classList.remove('loading');
// }

const fetchCurrentDailyWeather = async () => {

    //-----1.--- get the user's current lat and lang
    const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
}

const fetchUserCurrentLocation = async () => {
    const locationfindingAPI = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${OPENWEATHER_API_KEY}`;
    const response_location = await fetch(locationfindingAPI);
    const response_location_json = await response_location.json();
    current_loc = response_location_json[0].name;
}

const getUserCurrentTimeandDate = async () => {
    const now = new Date();
    const nowHour = now.getHours();
    const nowDay = now.getDay();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const nowDayName = dayNames[nowDay];

    document.getElementById('day').textContent = nowDayName; // Display current date 

    if (nowHour <= 12) {
        document.getElementById('time').textContent = `${nowHour}am`;
    }// Display current time
    else { document.getElementById('time').textContent = `${nowHour - 12}pm`; }

    // find the current day of the week 
    const next7Days = [];
    for (let i = 0; i < 7; i++) {
        next7Days.push(dayNames[(nowDay + i) % 7]); // % 7 to wrap around
    }

    // fetch weather information for the next 7 days 
    const API_weather_daily_URL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability,apparent_temperature,weather_code`;
    const response_daily = await fetch(API_weather_daily_URL);
    const response_daily_json = await response_daily.json();
    console.log("full API response for the next 7 days:", response_daily_json);

    // display weather information for the next 7 days 
    for (let i = 0; i < 7; i++) {
        // daily weather
        document.getElementById(`Day-${i}-name`).textContent = next7Days[i];
        document.getElementById(`icon-day-${i}-forecast`).src = `./assets/images/${codetoIcon(response_daily_json.hourly.weather_code[i * 24])}`;
        // hourly weather day selector
        document.getElementById(`hourly-day-${i}-name`).textContent = next7Days[i];

    }

    const container = document.getElementById('hourly-forecast-container');
    container.innerHTML = '';

    let min_temp = 0;
    let max_temp = 0;
    for (let i = 0; i < 24; i++) {
        // hourly weather and div setting
        container.innerHTML += `
            <div class="hourly-set">
            <span>
                <img class="hourly-icon" id="hourly-${i}-weather-icon" 
                    src="./assets/images/${codetoIcon(response_daily_json.hourly.weather_code[i])}">
                <span id="hourly-${i}-hour">${response_daily_json.hourly.time[i].split('T')[1].slice(0, 5)}</span>
            </span>
            <span class="hourly-temperature" id="hourly-${i}-temperature">
                ${response_daily_json.hourly.temperature_2m[i]}°C
            </span>
        </div>
        `;


        document.getElementById('')
    }



    // }
}

const findMinMaxTemp = async () => {


    const API_weather_daily_URL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability,apparent_temperature,weather_code`;
    const response_daily = await fetch(API_weather_daily_URL);
    const response_daily_json = await response_daily.json();

    for (j = 0; j < 7; j++) {
        let min_temp = 10000;
        let max_temp = -10000;
        for (i = 0; i < 24; i++) {
            if (response_daily_json.hourly.temperature_2m[j * 24 + i] < min_temp) {
                min_temp = response_daily_json.hourly.temperature_2m[j * 24 + i];
            }
            if (response_daily_json.hourly.temperature_2m[j * 24 + i] > max_temp) {
                max_temp = response_daily_json.hourly.temperature_2m[j * 24 + i];
            }
        }

        document.getElementById(`min-temp-${j}`).textContent = `${Math.round(min_temp)}° `;
        document.getElementById(`max-temp-${j}`).textContent = `${Math.round(max_temp)}°`;
    }
}

//--------Find the latitufe and longitude of a user input city.
const fetchCityLatLong = async () => {
    try {
        //reading the input city name
        const city_name = document.getElementById('location-name-input').value;
        const API_latlong_URL = `https://geocoding-api.open-meteo.com/v1/search?name=${city_name}&count=1&language=en&format=json`;

        //call and fetch responses
        const reponse = await fetch(API_latlong_URL);
        const response_json = await reponse.json();
        console.log("full API response:", response_json);
        latitude = response_json.results[0].latitude;
        longitude = response_json.results[0].longitude;

        // fetch weather information for the next 7 days 
        const API_weather_daily_URL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability,apparent_temperature,weather_code`;
        const response_daily = await fetch(API_weather_daily_URL);
        const response_daily_json = await response_daily.json();

        // display weather information for the next 7 days 
        for (let i = 0; i < 7; i++) {
            document.getElementById(`icon-day-${i}-forecast`).src = `./assets/images/${codetoIcon(response_daily_json.hourly.weather_code[i * 24])}`;
        }
    }
    catch (error) {
        console.error('Fetching city coordinates error:', error);
    }
}

const fetchCurrentTime = async () => {
    const response = await fetch(`https://timeapi.io/api/Time/current/coordinate?latitude=${latitude}&longitude=${longitude}`);
    const data = await response.json();
    let currentHour = data.hour;
    let currentMinute = data.minute;
    const currentDay = data.dayOfWeek;

    if (currentHour <= 12) {
        currentHour = `${currentHour}`;
        document.getElementById('time').textContent = `${currentHour}.${currentMinute} am`;
    } else {
        currentHour = currentHour - 12;
        document.getElementById('time').textContent = `${currentHour}.${currentMinute} pm`;
    }
    document.getElementById('day').textContent = currentDay;
    console.log("Current day is:", currentDay);
    let nextDays = [];
    //find currentDay
    //nextDays.push
}
//-----------------Fetching weather data using found latitude and longitudes of the input---------------
const location_var = document.getElementById('location-name');
const temperature_var = document.getElementById('temperature');
const feels_like_var = document.getElementById('feels-like');
const humidity_var = document.getElementById('humidity');
const wind_speed_var = document.getElementById('wind-speed');
const precipitation_var = document.getElementById('precipitation');

const fetchWeatherData = async () => {
    try {
        const API_weather_URL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability,apparent_temperature&current=weather_code`;
        const response = await fetch(API_weather_URL);
        const response_json = await response.json();
        //----4. function to call api, set the lat and long
        const weather_code = response_json.current.weather_code;
        const weather_icon = codetoIcon(weather_code);
        document.getElementById('weather').src = `./assets/images/${weather_icon}`;
        location_var.textContent = document.getElementById('location-name-input').value == "" ? current_loc : document.getElementById('location-name-input').value;
        temperature_var.textContent = `${response_json.hourly.temperature_2m[0]}°C`;
        feels_like_var.textContent = `${response_json.hourly.apparent_temperature[0]}°C`;
        humidity_var.textContent = `${response_json.hourly.relative_humidity_2m[0]}%`;
        wind_speed_var.textContent = `${response_json.hourly.wind_speed_10m[0]} km/h`;
        precipitation_var.textContent = `${response_json.hourly.precipitation_probability[0]}%`;
    }
    catch (error) {
        console.error('Fetching weather data error:', error);
    }
}

const form = document.getElementById("location-form");
const hourlySelect = document.getElementById("hourly-select");
const init = async () => {
    await fetchCurrentDailyWeather();
    await fetchUserCurrentLocation();
    await getUserCurrentTimeandDate();
    await fetchCurrentTime();
    await fetchWeatherData();
    await findMinMaxTemp();

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        await fetchCityLatLong();
        await fetchWeatherData();
        await fetchCurrentTime();
    });

    hourlySelect.addEventListener('change', async (event) => {
        const selectedDay = event.target.value;

    });

}
init();
