const latitude = 14.5995;
const longitude = 120.9842;

const apiURL =
    `https://api.open-meteo.com/v1/forecast?` +
    `latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,precipitation,rain,weather_code,wind_speed_10m` +
    `&wind_speed_unit=kmh` +
    `&timezone=Asia%2FManila`;

async function getWeather() {

    try {

        const response = await fetch(apiURL);

        if (!response.ok) {
            throw new Error("Weather request failed");
        }

        const data = await response.json();

        const weather = data.current;

        document.getElementById("temperature").textContent =
            `${weather.temperature_2m}°C`;

        document.getElementById("rain").textContent =
            `${weather.rain} mm`;

        document.getElementById("wind").textContent =
            `${weather.wind_speed_10m} km/h`;

        document.getElementById("condition").textContent =
            getWeatherCondition(weather.weather_code);

        calculateSuspension(weather);

        document.getElementById("loading").style.display = "none";
        document.getElementById("weather").style.display = "block";

    } catch (error) {

        document.getElementById("loading").textContent =
            "Unable to retrieve weather data.";

        console.error(error);
    }
}


function getWeatherCondition(code) {

    if (code === 0) return "Clear";

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


function calculateSuspension(weather) {

    let score = 0;

    // Rain
    if (weather.rain >= 10) {
        score += 40;
    } else if (weather.rain >= 5) {
        score += 25;
    } else if (weather.rain > 0) {
        score += 10;
    }

    // Wind
    if (weather.wind_speed_10m >= 60) {
        score += 30;
    } else if (weather.wind_speed_10m >= 40) {
        score += 20;
    } else if (weather.wind_speed_10m >= 25) {
        score += 10;
    }

    // Thunderstorms
    if ([95, 96, 99].includes(weather.weather_code)) {
        score += 25;
    }

    // Maximum probability
    score = Math.min(score, 100);

    let prediction;

    if (score >= 70) {
        prediction = "🔴 HIGH POSSIBILITY";
    } else if (score >= 40) {
        prediction = "🟡 MODERATE POSSIBILITY";
    } else {
        prediction = "🟢 LOW POSSIBILITY";
    }

    document.getElementById("probability").textContent =
        `${score}%`;

    document.getElementById("prediction").textContent =
        prediction;

    document.getElementById("explanation").textContent =
        `Weather-based suspension score: ${score}/100`;
}


getWeather();
