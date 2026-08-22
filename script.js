const latitude = 14.5995;
const longitude = 120.9842;

const apiURL =
    `https://api.open-meteo.com/v1/forecast?` +
    `latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&hourly=temperature_2m,precipitation,rain,weather_code,wind_speed_10m` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,weather_code` +
    `&wind_speed_unit=kmh` +
    `&timezone=Asia%2FManila` +
    `&forecast_days=7`;

async function getWeather() {

    try {

        const response = await fetch(apiURL);

        if (!response.ok) {
            throw new Error("Weather request failed");
        }

        const data = await response.json();

        displayCurrentWeather(data);
        displayForecast(data);

        document.getElementById("loading").style.display = "none";
        document.getElementById("weather").style.display = "block";

    } catch (error) {

        console.error(error);

        document.getElementById("loading").textContent =
            "Unable to retrieve weather data.";

    }
}


// ===============================
// CURRENT WEATHER
// ===============================

function displayCurrentWeather(data) {

    const current = data.current;

    document.getElementById("temperature").textContent =
        `${current.temperature_2m}°C`;

    document.getElementById("rain").textContent =
        `${current.rain} mm`;

    document.getElementById("wind").textContent =
        `${current.wind_speed_10m} km/h`;

    document.getElementById("condition").textContent =
        getWeatherCondition(current.weather_code);

}


// ===============================
// 7-DAY FORECAST
// ===============================

function displayForecast(data) {

    const daily = data.daily;

    const forecastContainer =
        document.getElementById("forecast");

    forecastContainer.innerHTML = "";

    for (let i = 0; i < daily.time.length; i++) {

        const date = daily.time[i];

        const rainfall = daily.rain_sum[i];
        const precipitation = daily.precipitation_sum[i];
        const maxTemp = daily.temperature_2m_max[i];
        const minTemp = daily.temperature_2m_min[i];
        const weatherCode = daily.weather_code[i];

        const score = calculateDailyScore(
            rainfall,
            precipitation,
            weatherCode
        );

        const prediction = getPrediction(score);

        const card = document.createElement("div");

        card.className = "forecast-card";

        card.innerHTML = `
            <h3>${formatDate(date)}</h3>

            <div class="forecast-icon">
                ${getWeatherIcon(weatherCode)}
            </div>

            <p>${getWeatherCondition(weatherCode)}</p>

            <p>
                🌡️ ${minTemp}°C – ${maxTemp}°C
            </p>

            <p>
                🌧️ ${rainfall.toFixed(1)} mm
            </p>

            <div class="forecast-score">
                ${score}%
            </div>

            <strong>${prediction}</strong>
        `;

        forecastContainer.appendChild(card);
    }
}


// ===============================
// SUSPENSION SCORING
// ===============================

function calculateDailyScore(
    rainfall,
    precipitation,
    weatherCode
) {

    let score = 0;

    // Rainfall
    if (rainfall >= 30) {

        score += 45;

    } else if (rainfall >= 20) {

        score += 35;

    } else if (rainfall >= 10) {

        score += 25;

    } else if (rainfall >= 5) {

        score += 15;

    } else if (rainfall > 0) {

        score += 5;

    }


    // Additional precipitation
    if (precipitation >= 30) {

        score += 15;

    } else if (precipitation >= 15) {

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


// ===============================
// PREDICTION LABEL
// ===============================

function getPrediction(score) {

    if (score >= 80) {

        return "🔴 VERY HIGH";

    } else if (score >= 60) {

        return "🟠 HIGH";

    } else if (score >= 30) {

        return "🟡 MODERATE";

    } else {

        return "🟢 LOW";

    }
}


// ===============================
// WEATHER CONDITIONS
// ===============================

function getWeatherCondition(code) {

    if (code === 0)
        return "Clear";

    if ([1, 2, 3].includes(code))
        return "Cloudy";

    if ([51, 53, 55, 56, 57].includes(code))
        return "Drizzle";

    if ([61, 63, 65, 66, 67].includes(code))
        return "Rain";

    if ([80, 81, 82].includes(code))
        return "Rain Showers";

    if ([95, 96, 99].includes(code))
        return "Thunderstorm";

    return "Unknown";
}


function getWeatherIcon(code) {

    if (code === 0)
        return "☀️";

    if ([1, 2, 3].includes(code))
        return "☁️";

    if ([51, 53, 55, 56, 57].includes(code))
        return "🌦️";

    if ([61, 63, 65, 66, 67].includes(code))
        return "🌧️";

    if ([80, 81, 82].includes(code))
        return "🌦️";

    if ([95, 96, 99].includes(code))
        return "⛈️";

    return "🌤️";
}


// ===============================
// DATE FORMAT
// ===============================

function formatDate(dateString) {

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString(
        "en-PH",
        {
            weekday: "short",
            month: "short",
            day: "numeric"
        }
    );
}


getWeather();
