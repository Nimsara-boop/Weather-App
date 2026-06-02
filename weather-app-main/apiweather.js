const API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m';

const location_var = document.getElementById('location-name');
const temperature_var = document.getElementById('temperature');

const fetchWeatherData = async () => {
    try{
        const response = await fetch(API_URL);
        const response_json = await response.json();
        console.log(response_json);
        location_var.textContent =`Lat: ${response_json.latitude}, Lon: ${response_json.longitude}`;
        temperature_var.textContent = response_json.hourly.temperature_2m[0];
    }
    catch(error){
        console.error('Error fetching weather data:', error);
    }
}

fetchWeatherData();