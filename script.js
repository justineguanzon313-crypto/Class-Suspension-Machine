const latitude = 14.5995;
const longitude = 120.9842;

const apiURL =
    "https://api.open-meteo.com/v1/forecast" +
    "?latitude=" + latitude +
    "&longitude=" + longitude +
    "&current=temperature_2m,precipitation,rain,weather_code,wind_speed_10m" +
    "&hourly=temperature_2m,precipitation,rain,weather_code,wind_speed_10m" +
    "&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,weather_code" +
    "&wind_speed_unit=kmh" +
    "&timezone=Asia%2FManila" +
    "&forecast_days=7";


async function getWeather() {

    const loading = document.getElementById("loading");
    const weather = document.getElementById("weather");

    try {

        loading.textContent = "Getting latest weather...";

        const response = await fetch(apiURL);

        if (!response.ok) {
            throw new Error(
                "Open-Meteo returned HTTP " + response.status
            );
        }

        const data = await response.json();

        console.log("Open-Meteo data:", data);


        // Make sure the required data exists

        if (!data.current) {
            throw new Error(
                "Current weather data was not returned."
            );
        }

        if (!data.daily) {
            throw new Error(
                "Daily forecast data was not returned."
            );
        }


        displayCurrentWeather(data);

        displayForecast(data);


        loading.style.display = "none";

        weather.style.display = "block";


    } catch (error) {

        console.error("WEATHER ERROR:", error);

        loading.style.display = "block";

        loading.textContent =
            "⚠️ Weather error: " + error.message;

    }

}


// ======================================
// CURRENT WEATHER
// ======================================

function displayCurrentWeather(data) {

    const current = data.current;


    document.getElementById("temperature").textContent =
        current.temperature_2m + "°C";


    document.getElementById("rain").textContent =
        current.rain + " mm";


    document.getElementById("wind").textContent =
        current.wind_speed_10m + " km/h";


    document.getElementById("condition").textContent =
        getWeatherCondition(current.weather_code);

}


// ======================================
// 7-DAY FORECAST
// ======================================

function displayForecast(data) {

    const daily = data.daily;

    const forecast =
        document.getElementById("forecast");


    forecast.innerHTML = "";


    for (
        let i = 0;
        i < daily.time.length;
        i++
    ) {

        const date = daily.time[i];

        const minTemp =
            daily.temperature_2m_min[i];

        const maxTemp =
            daily.temperature_2m_max[i];

        const rainfall =
            daily.rain_sum[i];

        const precipitation =
            daily.precipitation_sum[i];

        const weatherCode =
            daily.weather_code[i];


        const score =
            calculateSuspensionScore(
                rainfall,
                precipitation,
                weatherCode
            );


        const prediction =
            getPrediction(score);


        const card =
            document.createElement("div");


        card.className =
            "forecast-card";


        card.innerHTML = `

            <h3>
                ${formatDate(date)}
            </h3>

            <div class="forecast-icon">
                ${getWeatherIcon(weatherCode)}
            </div>

            <p>
                ${getWeatherCondition(weatherCode)}
            </p>

            <p>
                🌡️ ${minTemp}°C -
                ${maxTemp}°C
            </p>

            <p>
                🌧️ ${rainfall.toFixed(1)} mm
            </p>

            <div class="forecast-score">
                ${score}%
            </div>

            <strong>
                ${prediction}
            </strong>

        `;


        forecast.appendChild(card);

    }

}


// ======================================
// SUSPENSION SCORE
// ======================================

function calculateSuspensionScore(
    rainfall,
    precipitation,
    weatherCode
) {

    let score = 0;


    // Rainfall

    if (rainfall >= 30) {

        score += 45;

    }

    else if (rainfall >= 20) {

        score += 35;

    }

    else if (rainfall >= 10) {

        score += 25;

    }

    else if (rainfall >= 5) {

        score += 15;

    }

    else if (rainfall > 0) {

        score += 5;

    }


    // Total precipitation

    if (precipitation >= 30) {

        score += 15;

    }

    else if (precipitation >= 15) {

        score += 10;

    }


    // Thunderstorms

    if (
        weatherCode === 95 ||
        weatherCode === 96 ||
        weatherCode === 99
    ) {

        score += 30;

    }


    // Rain showers

    if (
        weatherCode === 80 ||
        weatherCode === 81 ||
        weatherCode === 82
    ) {

        score += 10;

    }


    return Math.min(score, 100);

}


// ======================================
// PREDICTION
// ======================================

function getPrediction(score) {

    if (score >= 80) {

        return "🔴 VERY HIGH";

    }

    if (score >= 60) {

        return "🟠 HIGH";

    }

    if (score >= 30) {

        return "🟡 MODERATE";

    }

    return "🟢 LOW";

}


// ======================================
// WEATHER DESCRIPTION
// ======================================

function getWeatherCondition(code) {

    if (code === 0) {

        return "Clear";

    }


    if (
        code === 1 ||
        code === 2 ||
        code === 3
    ) {

        return "Cloudy";

    }


    if (
        code === 51 ||
        code === 53 ||
        code === 55 ||
        code === 56 ||
        code === 57
    ) {

        return "Drizzle";

    }


    if (
        code === 61 ||
        code === 63 ||
        code === 65 ||
        code === 66 ||
        code === 67
    ) {

        return "Rain";

    }


    if (
        code === 80 ||
        code === 81 ||
        code === 82
    ) {

        return "Rain Showers";

    }


    if (
        code === 95 ||
        code === 96 ||
        code === 99
    ) {

        return "Thunderstorm";

    }


    return "Unknown";

}


// ======================================
// WEATHER ICON
// ======================================

function getWeatherIcon(code) {

    if (code === 0) {

        return "☀️";

    }


    if (
        code === 1 ||
        code === 2 ||
        code === 3
    ) {

        return "☁️";

    }


    if (
        code === 51 ||
        code === 53 ||
        code === 55 ||
        code === 56 ||
        code === 57
    ) {

        return "🌦️";

    }


    if (
        code === 61 ||
        code === 63 ||
        code === 65 ||
        code === 66 ||
        code === 67
    ) {

        return "🌧️";

    }


    if (
        code === 80 ||
        code === 81 ||
        code === 82
    ) {

        return "🌦️";

    }


    if (
        code === 95 ||
        code === 96 ||
        code === 99
    ) {

        return "⛈️";

    }


    return "🌤️";

}


// ======================================
// DATE
// ======================================

function formatDate(dateString) {

    const date =
        new Date(
            dateString + "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-PH",
        {
            weekday: "short",
            month: "short",
            day: "numeric"
        }
    );

}


// ======================================
// START PROGRAM
// ======================================

getWeather();
