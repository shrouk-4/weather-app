const apiKey = "63dbb87d0b96defd2a774f9546483276"; // WeatherAPI key

// Search by pressing Enter
document.getElementById("cityInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const city = e.target.value;
    if (city) {
      getWeather(city);
    }
  }
});

// On page load: last saved city
window.onload = () => {
  const savedCity = localStorage.getItem("selectedCity");
  if (savedCity) {
    getWeather(savedCity);
    localStorage.removeItem("selectedCity");
  } else {
    getWeather("Cairo"); // Default city
  }
};

async function getWeather(city) {
  try {
    const res = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=7&aqi=no&alerts=no`
    );
    const data = await res.json();

    // ==== Current Weather ====
    document.getElementById("cityName").innerText = `${data.location.name}, ${data.location.country}`;

    const date = new Date(data.location.localtime);
    document.getElementById("date").innerText = date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });

    document.getElementById("temp").innerText = `${Math.round(data.current.temp_c)}°`;
    document.getElementById("icon").src = "https:" + data.current.condition.icon;

    // ==== Air Conditions ====
    document.querySelector(".fa-temperature-half").nextElementSibling.querySelector("p:last-child").innerText =
      `${Math.round(data.current.feelslike_c)}°`;

    document.querySelector(".fa-wind").nextElementSibling.querySelector("p:last-child").innerText =
      `${data.current.wind_kph} km/h`;

    document.querySelector(".fa-droplet").nextElementSibling.querySelector("p:last-child").innerText =
      `${data.current.humidity}%`;

    document.querySelector(".fa-sun").nextElementSibling.querySelector("p:last-child").innerText =
      `${data.current.uv}`;

    // ==== 7 Days Forecast ====
    const forecastEl = document.getElementById("forecast");
    forecastEl.innerHTML = "";
    data.forecast.forecastday.forEach((day, idx) => {
      const weekday = new Date(day.date).toLocaleDateString("en-US", { weekday: "long" });
      forecastEl.innerHTML += `
        <li class="py-3 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <img src="https:${day.day.condition.icon}" class="w-8 h-8" />
            <span class="text-white text-sm">${idx === 0 ? "Today" : weekday}</span>
          </div>
          <span class="text-white font-semibold">${Math.round(day.day.avgtemp_c)}°</span>
        </li>
      `;
    });

    // ==== Sunrise / Sunset ====
    const sunrise = new Date(`${data.forecast.forecastday[0].date} ${data.forecast.forecastday[0].astro.sunrise}`);
    const sunset = new Date(`${data.forecast.forecastday[0].date} ${data.forecast.forecastday[0].astro.sunset}`);

    document.getElementById("sunrise").innerText = data.forecast.forecastday[0].astro.sunrise;
    document.getElementById("sunset").innerText = data.forecast.forecastday[0].astro.sunset;

    updateDayProgress(sunrise, sunset);

  } catch (err) {
    alert("City not found or API error!");
    console.error(err);
  }
}

// ==== Update Day Progress bar ====
function updateDayProgress(sunrise, sunset) {
  const now = new Date();
  const total = sunset - sunrise;
  const passed = now - sunrise;
  let percent = (passed / total) * 100;
  percent = Math.max(0, Math.min(100, percent));

  const progressBar = document.getElementById("progress-bar");
  const sunIcon = document.getElementById("sun-icon");

  progressBar.style.width = percent + "%";
  sunIcon.style.left = percent + "%";
}
