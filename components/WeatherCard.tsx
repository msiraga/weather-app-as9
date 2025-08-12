type Props = {
  city: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
};

export default function WeatherCard({ city, temperature, apparentTemperature, humidity }: Props) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-lg font-medium">{city}</h2>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-semibold">{Math.round(temperature)}°C</div>
          <div className="text-xs text-gray-500">Temperature</div>
        </div>
        <div>
          <div className="text-2xl font-semibold">{Math.round(apparentTemperature)}°C</div>
          <div className="text-xs text-gray-500">Feels like</div>
        </div>
        <div>
          <div className="text-2xl font-semibold">{Math.round(humidity)}%</div>
          <div className="text-xs text-gray-500">Humidity</div>
        </div>
      </div>
    </section>
  );
}


