//-----------------Converting city name to latitude and longitudes------------------

let latitude = "";
let longitude = "";

let user_latitude = "";
let user_longitude = "";

//-----------------Daily Forecast--------------------



//----------getting user's date time 
// 1. await navigator.geolocation.getCurrentPosition ----- get the user's current latitude and longitude
// 2. getUserCurrentTempandWeather() ----- get the user's current (1.)temperature and (2.)weather using await navigator.geolocation.getCurrentPosition and display
// 3. getgetUserCurrentTimeandDate() ----- get the user's current time and date from the Date() JS object and display
//

const fetchCurrentDailyWeather = async () => {

    //-----1.--- get the user's current lat and lang
    const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    user_latitude = position.coords.latitude;
    user_longitude = position.coords.longitude;

    //------2.--- getting temp and weather. display user's current temp
    const response_user_temp = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${user_latitude}&longitude=${user_longitude}&current=temperature_2m,weather_code`);

    const response_user_temp_json = await response_user_temp.json();
    const user_temperature = response_user_temp_json.current.temperature_2m;

    document.getElementById('temperature').textContent = user_temperature;


    //----3. ---- function to convert weather codes to icons
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

    //----4. function to call api, set the lat and long
    const user_weather_code = response_user_temp_json.current.weather_code;
    const weather_icon = codetoIcon(user_weather_code);
   document.getElementById('weather').src = `./assets/images/${weather_icon}`;
}

const fetchUserCurrentLocation = async () => {
    const locationfindingAPI = `http://api.openweathermap.org/geo/1.0/reverse?lat=${user_latitude}&lon=${user_longitude}&limit=1&appid=${OPENWEATHER_API_KEY}`;
    const response_location = await fetch(locationfindingAPI);
    const response_location_json = await response_location.json();
    document.getElementById('location-name').textContent = response_location_json[0].name;
}

const getUserCurrentTimeandDate = async () => {
    const now = new Date();

    const nowHour = now.getHours();
    const nowDay = now.getDay();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const nowDayName = dayNames[nowDay];
    document.getElementById('day').textContent = nowDayName; // Display current date 

    if (nowHour <= 12) {
        document.getElementById('time').textContent = `${nowHour}am`;
    }// Display current time
    else { document.getElementById('time').textContent = `${nowHour - 12}pm`; }


    const next7Days = [];
    for (let i = 0; i < 7; i++) {
        next7Days.push(dayNames[(nowDay + i) % 7]); // % 7 wraps around (Sat → Sun)
    }

    console.log(next7Days);

    const API_weather_daily_URL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability,apparent_temperature`;
    const response_daily = await fetch(API_weather_daily_URL);
    const response_daily_json = await response_daily.json();

    for (let i = 0; i < 7; i++) {
        document.getElementById(`Day-${i}-name`).textContent = next7Days[i];
        document.getElementById(`Day-${i}-daily-forecast`).textContent = response_daily_json.current.weather_code[i * 24];
    }
}

const init = async () => {
await fetchCurrentDailyWeather();
await fetchUserCurrentLocation();
getUserCurrentTimeandDate();
}

init();

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
        console.log('latitude: ', latitude);
        console.log('longitude: ', longitude);
    }
    catch (error) {
        console.error('Fetching city coordinates error:', error);
    }
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
        console.log(response_json);
        location_var.textContent = `Lat: ${response_json.latitude}, Lon: ${response_json.longitude}`;
        temperature_var.textContent = response_json.hourly.temperature_2m[0];
        feels_like_var.textContent = response_json.hourly.apparent_temperature[0];
        humidity_var.textContent = response_json.hourly.relative_humidity_2m[0];
        wind_speed_var.textContent = response_json.hourly.wind_speed_10m[0];
        precipitation_var.textContent = response_json.hourly.precipitation_probability[0];
    }
    catch (error) {
        console.error('Fetching weather data error:', error);
    }
}




const form = document.getElementById("location-form");
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await fetchCityLatLong();
    await fetchWeatherData();
});

