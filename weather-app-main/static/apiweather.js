//-----------------Converting city name to latitude and longitudes------------------


let latitude = "";
let longitude = "";

let current_loc = "";
let current_loc_city = "";
let current_loc_country = "";
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

const longDayNames= ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

let selectedShrtDay = null;
let selectectedOptionId = "";

let windSpeed = "";
let precipitation = "";

//----------getting user's date time 
// ----fetchCurrentDailyWeather()--- 1. , 
// 1. await navigator.geolocation.getCurrentPosition ----- get the user's current latitude and longitude
// 2. getUserCurrentTempandWeather() ----- get the user's current (1.)temperature and (2.)weather using await navigator.geolocation.getCurrentPosition and display
// 3. getgetUserCurrentTimeandDate() ----- get the user's current time and date from the Date() JS object and display
//

//  Browser gives -------(Raw Text)------> We use .json() on it -----(JSON  object)-----> To store in local Storage (JSON.stringify())------(String)------> 
const saveToCache = (key, data) => {
    const cachedElement = {
        timestamp: Date.now(),
        data: data
    };
    localStorage.setItem(key, JSON.stringify(cachedElement));
    console.log("Saved to cache with key:", key);
}

//  We use JSON.parse() to convert the String back to JSON. if the cacheElement is not expred, get the .data and return it.
const getFromCache = (key, expiryDate) => {
    const cachedElement = JSON.parse(localStorage.getItem(key));
    if (cachedElement) {
        console.log("Cache found for key:", key, " and Data:", cachedElement.data);
        if (Date.now() - cachedElement.timestamp < expiryDate) {
            return cachedElement.data
        }
        else {
            localStorage.removeItem(key);
            console.log("Cache expired for: ", key, " ", cachedElement.data);
        }
    }
    console.log("No cache found for key:", key);
    return null;
}


// const loading = async () =>{
//     //----------Loading Screen
//     document.querySelector('.main-content').classList.add('loading');
//     document.querySelector('.loading').textContent = 'Loading...';
// }

// const removeLoading = async () =>{
//     document.querySelector('.main-content').classList.remove('loading');
// }


//////   Unit changing Functions  /////////////
const celciusToFahrentheit = (tempC) => {
    return (tempC * 9 / 5) + 32;
}
const fahrentheitToCelcius = (tempF) => {
    return (tempF - 32) * 5 / 9;
}
const kmhToMph = (windSpeed) => {
    document.getElementById('wind-speed').textContent = `${speedKmh * 0.621371} mph`;
}
const mphToKmh = (windSpeed) => {
    document.getElementById('wind-speed').textContent = `${speedMph / 0.621371} km/h`;
}
const mmToInches = (precipMm) => {
    return precipMm * 0.0393701;
}
const inchesToMm = (precipInches) => {
    return precipInches / 0.0393701;
}
/////////////////////////////////////////////


// const fetchCurrentDailyWeather = async () => {

//     //-----1.--- get the user's current lat and lang
//     const position = await new Promise((resolve, reject) => {
//         navigator.geolocation.getCurrentPosition(resolve, reject);
//     });

//     latitude = position.coords.latitude;
//     longitude = position.coords.longitude;
// }

const fetchUserCurrentLocation = async () => {
    //-----1.--- get the user's current lat and lang
    const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    latitude = position.coords.latitude;
    longitude = position.coords.longitude;

    const locationDataKey = `location_${latitude}_${longitude}`;
    let locationData = getFromCache(locationDataKey, 60 * 60 * 1000); // 1 hour expiry

    if (!locationData) {
        const locationfindingAPI = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${OPENWEATHER_API_KEY}`;
        const response_location = await fetch(locationfindingAPI);
        const response_location_json = await response_location.json();
        console.log("This is the location API reponse:", response_location_json);
        current_loc_city = response_location_json[0].name;
        current_loc_country = response_location_json[0].country;
        current_loc = `${current_loc_city}, ${current_loc_country}`;
        saveToCache(locationDataKey, current_loc);
    }
    else {
        console.log("From CACHE: the location Data is :", locationData);

    }
}


const getUserCurrentTimeandDateandHourlyData = async () => {
    // cannot cache date and time data. 
    const response = await fetch(`https://timeapi.io/api/Time/current/coordinate?latitude=${latitude}&longitude=${longitude}`);
    const data = await response.json();
    let currentHour = data.hour;
    let currentMinute = data.minute;
    const currentDay = data.dayOfWeek; //current day returns Monday, Tuesday etc.
    const nowDayName = dayNames[longDayNames.indexOf(currentDay)];
    selectedShrtDay = nowDayName;
    console.log("1 selectedShrtDay is:", selectedShrtDay);
    console.log("timeapi response is:", data);

    const exactDate = data.date;

    document.getElementById('exact-date').textContent = exactDate;

    if (currentHour <= 12) {
        currentHour = `${currentHour}`;
        document.getElementById('time').textContent = `${currentHour}.${currentMinute} am`;
    } else {
        currentHour = currentHour - 12;
        document.getElementById('time').textContent = `${currentHour}.${currentMinute} pm`;
    }
    document.getElementById('day').textContent = currentDay;
    console.log("Current day is:", currentDay);
    // find the current day of the week 
    const next7Days = [];
    for (let i = 0; i < 7; i++) {
        next7Days.push(dayNames[(currentDay + i) % 7]); // % 7 to wrap around
    }

    // fetch weather information for the next 7 days 
    // create a unique cache label with the latitude and longitude
    const cacheKey = `daily_and_hourly_weather_for_${latitude}_${longitude}`;

    // assign the relevant data to "response_daily_json" if the data exists and is less that 1 hour old. Otherwise assign as null'
    let response_daily_json = getFromCache(cacheKey, 60 * 60 * 1000);

    // if the data NOT exist 
    if (!response_daily_json) {
        const API_weather_daily_URL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability,apparent_temperature,weather_code&current=weather_code`;
        const response_daily = await fetch(API_weather_daily_URL);
        response_daily_json = await response_daily.json();
        console.log("Fetched ANEW: full API response for the next 7 days:", response_daily_json);
        saveToCache(cacheKey, response_daily_json);
    }

    // if the data exists
    else {
        console.log("From CACHE: full API response for the next 7 days:", response_daily_json);
    }

    // display weather information for the next 7 days 
    for (let i = 0; i < 7; i++) {
        // daily 'hourly' weather code
        document.getElementById(`Day-${i}-name`).textContent = next7Days[i];
        document.getElementById(`icon-day-${i}-forecast`).src = `./assets/images/${codetoIcon(response_daily_json.hourly.weather_code[i * 24])}`;
    }

    const container = document.getElementById('hourly-forecast-container');
    container.innerHTML = '';

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
    }
}

const findMinMaxTemp = async () => {

    const cacheKey = `daily_and_hourly_weather_for_${latitude}_${longitude}`;
    let response_daily_json = getFromCache(cacheKey, 60 * 60 * 1000);

    if (!response_daily_json) {
        const API_weather_daily_URL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability,apparent_temperature,weather_code`;
        const response_daily = await fetch(API_weather_daily_URL);
        response_daily_json = await response_daily.json();
    }

    else {
        console.log("From CACHE: weather details (for the min-max function) for the next 7 days:", response_daily_json);
    }

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

//---------------Fetch Hourly Data
const fetchHourlyData = async (selectedShrtDay) => {
    selectedDayIndex = "";
    if (selectedShrtDay) {
        selectedDayIndex = dayNames.indexOf(selectedShrtDay);
        // values for the drop down with the shrt day names
        for (let i = 0; i < 8; i++) {
            document.getElementById(`hourly-day-${i}-name`).textContent = dayNames[(selectedDayIndex + i) % 7];
        }
    }

    const cacheKey = `daily_and_hourly_weather_for_${latitude}_${longitude}`;
    let response_location_and_hourly_json = getFromCache(cacheKey, 60 * 60 * 1000);

    if (!response_location_and_hourly_json) {
        const API_weather_daily_URL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weather_code`;
        const response_location_and_hourly = await fetch(API_weather_daily_URL);
        response_location_and_hourly_json = await response_location_and_hourly.json();
        console.log("Fetched ANEW: hourly temperature and weather code (fetchHourlyData function):", response_location_and_hourly_json);
        saveToCache(cacheKey, response_location_and_hourly_json);
    }
    else {
        console.log("From CACHE: hourly temperature and weather code (fetchHourlyData function):", response_location_and_hourly_json);
    }

    for (let i = 0; i < 24; i++) {
        document.getElementById(`hourly-${i}-weather-icon`).src = `./assets/images/${codetoIcon(response_location_and_hourly_json.hourly.weather_code[selectedDayIndex * 24 + i])}`;
        document.getElementById(`hourly-${i}-temperature`).textContent = `${response_location_and_hourly_json.hourly.temperature_2m[selectedDayIndex * 24 + i]}°C`;
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
        console.log("full API response from the geocoding API: ", response_json);
        latitude = response_json.results[0].latitude;
        longitude = response_json.results[0].longitude;

        // fetch weather information for the next 7 days 
        const cacheKey = `daily_and_hourly_weather_for_${latitude}_${longitude}`;
        let response_daily_json = getFromCache(cacheKey, 60 * 60 * 1000);
        if (!response_daily_json) {
            const API_weather_daily_URL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability,apparent_temperature,weather_code`;
            const response_daily = await fetch(API_weather_daily_URL);
            const response_daily_json = await response_daily.json();
            saveToCache(cacheKey, response_daily_json);
            console.log("Fetched ANEW: weather information (after fetching new lat and long):", response_daily_json);
        }
        else {
            console.log("From CACHE: weather information (after fetching new lat and long):", response_daily_json);
        }
        // display weather information for the next 7 days 
        for (let i = 0; i < 7; i++) {
            document.getElementById(`icon-day-${i}-forecast`).src = `./assets/images/${codetoIcon(response_daily_json.hourly.weather_code[i * 24])}`;
        }
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
        const cacheKey = `daily_and_hourly_weather_for_${latitude}_${longitude}`;
        let response_json = getFromCache(cacheKey, 60 * 60 * 1000);

        if (!response_json) {
            const API_weather_URL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability,apparent_temperature&current=weather_code`;
            const response = await fetch(API_weather_URL);
            response_json = await response.json();
            saveToCache(cacheKey, response_json);
            console.log("Fetched ANEW: current minor weather information (fetchWeatherData function):", response_json);
        }

        else {
            console.log("From CACHE: current minor weather information (fetchWeatherData function):", response_json);
        }

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
    // await fetchCurrentDailyWeather();
    await fetchUserCurrentLocation();
    await getUserCurrentTimeandDateandHourlyData();
    await fetchWeatherData();
    await findMinMaxTemp();
    await fetchHourlyData(selectedShrtDay);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        await fetchCityLatLong();
        await fetchWeatherData();
        await fetchHourlyData(selectedShrtDay);
    });

    hourlySelect.addEventListener('change', async (event) => {

        // find the ID of the selected option
        let selectedOption = event.target.options[event.target.selectedIndex];
        selectedOptionId = selectedOption.id;

        // find the text content of the selected option USING the ID
        selectedShrtDay = document.getElementById(selectedOptionId).textContent;

        // verify the text content of selection before calling the fucntion
        console.log("Selected option id (hourly-day-x-name) is:", selectedShrtDay);

        event.preventDefault();

        await fetchHourlyData(selectedShrtDay);
    });

}
init();
