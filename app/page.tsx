'use client';

import { useEffect, useState } from "react";
import SearchBar from "@/components/SearchBar";
import WeatherCard from "@/components/WeatherCard";
import ForecastList from "@/components/ForecastList";

type ForecastPoint = { time: string; temperature: number };
type WeatherResponse = {
  city: string;
  latitude: number;
  longitude: number;
  current: {
    temperature: number;
    apparent_temperature: number;
    relative_humidity: number;
  };
  hourly: ForecastPoint[];
  timezone?: string;
};

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(city: string) {
    if (!city.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/weather?q=${encodeURIComponent(city)}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? `Request failed: ${res.status}`);
      }
      const data = (await res.json()) as WeatherResponse;
      setWeather(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch weather");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }

  // On first load, if URL contains ?q=city, auto fetch
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('q');
    if (initial && !weather && !loading) {
      setQuery(initial);
      handleSearch(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Weather</h1>
      <SearchBar
        value={query}
        onChange={setQuery}
        onSubmit={() => handleSearch(query)}
        loading={loading}
      />
      {error && <p className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {weather && (
        <div className="mt-6 space-y-6">
          <WeatherCard
            city={weather.city}
            temperature={weather.current.temperature}
            apparentTemperature={weather.current.apparent_temperature}
            humidity={weather.current.relative_humidity}
          />
          <ForecastList points={weather.hourly} timezone={weather.timezone} />
        </div>
      )}
    </main>
  );
}


