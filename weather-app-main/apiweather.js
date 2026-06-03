//-----------------Converting city name to latitude and longitudes------------------

let latitude = "";
let longitude = "";

const fetchCityLatLong = async () => {
    try {
        //reading the input city name
        const city_name = document.getElementById('location-name-input').value;

        //changing URL accordingly
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

//-----------------Fetching weather data using found latitude and longitudes---------------
const location_var = document.getElementById('location-name');
const temperature_var = document.getElementById('temperature');
const feels_like_var = document.getElementById('feels-like');
const humidity_var = document.getElementById('humidity');
const wind_speed_var = document.getElementById('wind-speed');
const precipitation_var = document.getElementById('precipitation');

const fetchWeatherData = async () => {
    try{
        const API_weather_URL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability,apparent_temperature`;
        const response = await fetch(API_weather_URL);
        const response_json = await response.json();
        console.log(response_json);
        location_var.textContent =`Lat: ${response_json.latitude}, Lon: ${response_json.longitude}`;
        temperature_var.textContent = response_json.hourly.temperature_2m[0];
        feels_like_var.textContent = response_json.hourly.apparent_temperature[0];
        humidity_var.textContent = response_json.hourly.relative_humidity_2m[0];
        wind_speed_var.textContent = response_json.hourly.wind_speed_10m[0];
        precipitation_var.textContent = response_json.hourly.precipitation_probability[0];
    }
    catch(error){
        console.error('Fetching weather data error:', error);
    }
}

const form = document.getElementById("location-form");
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await fetchCityLatLong();
    await fetchWeatherData();
});
