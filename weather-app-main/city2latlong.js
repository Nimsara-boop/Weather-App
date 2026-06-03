const city_name = document.getElementById('city-name');
const city_name = 'London';
const API_URL = `https://geocoding-api.open-meteo.com/v1/search?q=${city_name}&count=1&language=en&format=json`;

let latitude = "";
let longitude = "";
const fetchCityLatLong = async () => {
    try {
        const reponse = await fetch(API_URL);
        const response_json = await reponse.json();
        console.log(response_json);

        latitude = response_json.results[0].latitude;
        longitude = response_json.results[0].longitude;
        console.log('latitude: ', latitude);
        console.log('longitude: ', longitude);
    }
    catch (error) {
        console.error('Error fetching city coordinates:', error);
    }
}

fetchCityLatLong();