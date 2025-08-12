import { NextRequest, NextResponse } from "next/server";

type GeoResult = {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ error: "Missing 'q' query parameter" }, { status: 400 });
  }

  try {
    const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
    geoUrl.searchParams.set("name", q);
    geoUrl.searchParams.set("count", "1");
    geoUrl.searchParams.set("language", "en");
    geoUrl.searchParams.set("format", "json");

    const geoRes = await fetch(geoUrl, { next: { revalidate: 60 } });
    if (!geoRes.ok) {
      throw new Error(`Geocoding failed: ${geoRes.status}`);
    }
    const geoData = await geoRes.json();
    const place: GeoResult | undefined = geoData?.results?.[0];
    if (!place) {
      return NextResponse.json({ error: "City not found" }, { status: 404 });
    }

    const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
    forecastUrl.searchParams.set("latitude", String(place.latitude));
    forecastUrl.searchParams.set("longitude", String(place.longitude));
    forecastUrl.searchParams.set("current", "temperature_2m,apparent_temperature,relative_humidity_2m");
    forecastUrl.searchParams.set("hourly", "temperature_2m");
    forecastUrl.searchParams.set("forecast_days", "2");
    forecastUrl.searchParams.set("timezone", "auto");

    const fcRes = await fetch(forecastUrl, { next: { revalidate: 60 } });
    if (!fcRes.ok) {
      throw new Error(`Forecast failed: ${fcRes.status}`);
    }
    const fc = await fcRes.json();

    const current = fc.current ?? {};
    const hourlyTimes: string[] = fc.hourly?.time ?? [];
    const hourlyTemps: number[] = fc.hourly?.temperature_2m ?? [];
    const timezone: string | undefined = fc.timezone;

    let startIdx = 0;
    if (current?.time) {
      startIdx = hourlyTimes.indexOf(current.time);
      if (startIdx < 0) startIdx = 0;
      if (startIdx < hourlyTimes.length - 1) startIdx += 1; // start from next hour
    }

    const next12 = hourlyTimes.slice(startIdx, startIdx + 12).map((t, i) => ({
      time: t,
      temperature: hourlyTemps[startIdx + i],
    }));

    const cityDisplay = [place.name, place.admin1, place.country].filter(Boolean).join(", ");

    return NextResponse.json({
      city: cityDisplay,
      latitude: place.latitude,
      longitude: place.longitude,
      current: {
        temperature: current.temperature_2m,
        apparent_temperature: current.apparent_temperature,
        relative_humidity: current.relative_humidity_2m,
      },
      hourly: next12,
      timezone,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unexpected error" }, { status: 500 });
  }
}


