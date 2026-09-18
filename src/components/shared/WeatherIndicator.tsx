"use client";

import { useEffect, useState } from "react";

interface CurrentWeatherResponse {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
    is_day?: number;
  };
}

interface WeatherDisplay {
  emoji: string;
  label: string;
  temperature?: number;
}

const ICHEON_WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=37.2799&longitude=127.4428&current=temperature_2m,weather_code,is_day&timezone=Asia%2FSeoul";

function getWeatherDisplay(weatherCode?: number, isDay?: number): Pick<WeatherDisplay, "emoji" | "label"> {
  if (weatherCode === 0) return { emoji: isDay === 0 ? "🌙" : "☀️", label: isDay === 0 ? "맑은 밤" : "맑음" };
  if (weatherCode === 1 || weatherCode === 2) return { emoji: "🌤️", label: "구름 조금" };
  if (weatherCode === 3) return { emoji: "☁️", label: "흐림" };
  if (weatherCode === 45 || weatherCode === 48) return { emoji: "🌫️", label: "안개" };
  if ([51, 53, 55, 56, 57].includes(weatherCode ?? -1)) return { emoji: "🌦️", label: "이슬비" };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode ?? -1)) return { emoji: "🌧️", label: "비" };
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode ?? -1)) return { emoji: "❄️", label: "눈" };
  if ([95, 96, 99].includes(weatherCode ?? -1)) return { emoji: "⛈️", label: "뇌우" };
  return { emoji: "🌤️", label: "이천 날씨" };
}

export function WeatherIndicator() {
  const [weather, setWeather] = useState<WeatherDisplay>({ emoji: "🌤️", label: "날씨 불러오는 중" });

  useEffect(() => {
    const controller = new AbortController();

    const loadWeather = async () => {
      try {
        const response = await fetch(ICHEON_WEATHER_URL, { signal: controller.signal });
        if (!response.ok) throw new Error("Weather request failed");

        const data = (await response.json()) as CurrentWeatherResponse;
        const current = data.current;
        const display = getWeatherDisplay(current?.weather_code, current?.is_day);

        setWeather({
          ...display,
          temperature: typeof current?.temperature_2m === "number" ? Math.round(current.temperature_2m) : undefined,
        });
      } catch (error) {
        if ((error as DOMException).name !== "AbortError") {
          setWeather({ emoji: "🌤️", label: "이천 날씨" });
        }
      }
    };

    loadWeather();
    const refreshTimer = window.setInterval(loadWeather, 15 * 60 * 1000);

    return () => {
      controller.abort();
      window.clearInterval(refreshTimer);
    };
  }, []);

  return (
    <div
      className="flex h-11 items-center gap-2 rounded-full bg-primary/10 px-3 text-primary transition-colors hover:bg-primary/15"
      role="status"
      aria-label={`이천 현재 날씨 ${weather.label}${weather.temperature !== undefined ? ` ${weather.temperature}도` : ""}`}
      title={`이천 현재 날씨: ${weather.label}${weather.temperature !== undefined ? ` ${weather.temperature}℃` : ""}`}
    >
      <span className="text-xl leading-none" aria-hidden="true">{weather.emoji}</span>
      <span className="hidden text-xs font-bold sm:inline">
        {weather.temperature !== undefined ? `${weather.temperature}°` : weather.label}
      </span>
    </div>
  );
}
