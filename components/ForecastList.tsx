type ForecastPoint = { time: string; temperature: number };

function formatHour(iso: string, tz?: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export default function ForecastList({ points, timezone }: { points: ForecastPoint[]; timezone?: string }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-base font-medium">Next 12 hours</h3>
      <div className="flex gap-3 overflow-x-auto">
        {points.map((p) => (
          <div key={p.time} className="min-w-[80px] rounded border border-gray-100 bg-gray-50 p-2 text-center">
            <div className="text-xs text-gray-600">{formatHour(p.time, timezone)}</div>
            <div className="mt-1 text-lg font-semibold">{Math.round(p.temperature)}°</div>
          </div>
        ))}
      </div>
    </section>
  );
}


