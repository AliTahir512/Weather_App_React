import React, { useState, useEffect } from 'react';
import axios from 'axios';
import sunnyImage from '../assets/images/sunny_day.jpeg';
import rainyImage from '../assets/images/rainy_image.jpeg';
import cloudyImage from '../assets/images/cloudy_image.webp';

// Replace this with your actual API key
const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

console.log(apiKey);


function WeatherCard() {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [city, setCity] = useState('');
  const [background, setBackground] = useState('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        console.log('User location:', latitude, longitude);
        fetchWeatherByCoords(latitude, longitude);
      }, error => {
        console.error('Error getting location:', error);
      });
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  const fetchWeather = async () => {
    if (!city) return;
    try {
      console.log('Fetching weather for:', city);

      const currentWeatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
      );
      console.log('Current Weather Response:', currentWeatherResponse.data);

      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`
      );
      console.log('Forecast Response:', forecastResponse.data);

      setCurrentWeather(currentWeatherResponse.data);
      setForecast(processForecastData(forecastResponse.data));
      updateBackground(currentWeatherResponse.data.weather[0].main);
    } catch (error) {
      console.error("Error fetching weather data", error);
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      console.log('Fetching weather for coordinates:', lat, lon);
  
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`
      );
      console.log('Current Weather Response:', response.data);
  
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`
      );
      console.log('Forecast Response:', forecastResponse.data);
  
      setCurrentWeather(response.data);
      setForecast(processForecastData(forecastResponse.data));
      updateBackground(response.data.weather[0].main);
    } catch (error) {
      console.error("Error fetching weather data", error);
    }
  };
  

  const processForecastData = (data) => {
    const dailyData = [];
    const days = {};

    data.list.forEach((entry) => {
      const date = new Date(entry.dt * 1000);
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });

      if (!days[day]) {
        days[day] = {
          day,
          temp: 0,
          count: 0,
          weather: entry.weather[0].main,
          description: entry.weather[0].description
        };
      }

      days[day].temp += entry.main.temp;
      days[day].count += 1;
    });

    for (let day in days) {
      dailyData.push({
        day: days[day].day,
        temp: (days[day].temp / days[day].count - 273.15).toFixed(2),
        weather: days[day].weather,
        description: days[day].description,
      });
    }

    console.log('Processed Forecast Data:', dailyData);
    return dailyData;
  };

  const updateBackground = (weatherCondition) => {
    let image;
    switch (weatherCondition) {
      case 'Clear':
        image = sunnyImage;
        break;
      case 'Rain':
        image = rainyImage;
        break;
      case 'Clouds':
        image = cloudyImage;
        break;
      default:
        image = ''; // Fallback image or an empty string
        break;
    }
    console.log('Updated background image:', image);
    setBackground(image);
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-100 font-mono">
      <div
        className="relative w-full max-w-3xl h-96 bg-cover bg-center rounded-lg shadow-lg overflow-hidden"
        style={{
          backgroundImage: background ? `url(${background})` : `url(${cloudyImage})`, // Fallback to a static image
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-start items-center text-2xl mt-2 p-2">
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city"
              className="p-4 rounded border border-gray-300 bg-transparent text-white placeholder-gray-200 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={fetchWeather}
              className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-700 transition"
            >
              Get Weather
            </button>
          </div>
          {currentWeather && (
            <div className="mt-4 text-white text-center space-y-2">
              <h2 className="text-3xl font-semibold">{currentWeather.name}</h2>
              <p className="text-2xl capitalize">{currentWeather.weather[0].description}</p>
              <p className="text-xl">{(currentWeather.main.temp - 273.15).toFixed(2)}°C</p>
            </div>
          )}
          {forecast.length > 0 && (
            <div className="mt-5 text-white text-center flex space-x-3 overflow-x-auto mb-1">
              {forecast.slice(0,5).map((day, index) => (
                <div key={index} className=" max-w-lg">
                  <h3 className="text-md font-semibold">{day.day}</h3>
                  <p className="text-sm capitalize">{day.description}</p>
                  <p className="text-sm">{day.temp}°C</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WeatherCard;
