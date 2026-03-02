function fmt(secs) {
  if (!secs) return "—";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}min ${s}s` : `${s}s`;
}

export default function AnalyticsOverview({ sessions }) {
  const real = sessions.filter(s => !s.is_bot_suspected);
  const bots = sessions.filter(s => s.is_bot_suspected);
  const opened = sessions.filter(s => s.form_opened);
  const submitted = sessions.filter(s => s.form_submitted);
  const avgTime = real.length
    ? Math.round(real.filter(s => s.time_on_page_seconds).reduce((a, s) => a + (s.time_on_page_seconds || 0), 0) / real.length)
    : 0;
  const conversion = real.length ? ((submitted.length / real.length) * 100).toFixed(1) : "0.0";

  const stats = [
    { label: "Sesje", value: sessions.length, color: "#fff" },
    { label: "Prawdziwi użytkownicy", value: real.length, color: "#4ade80" },
    { label: "Boty/podejrzane", value: bots.length, color: "#f87171" },
    { label: "Śr. czas na stronie", value: fmt(avgTime), color: "#facc15" },
    { label: "Formularze otwarte", value: opened.length, color: "#FB923C" },
    { label: "Wysłane zapytania", value: submitted.length, color: "#FF5C00" },
    { label: "Konwersja", value: `${conversion}%`, color: "#a78bfa" },
  ];

  return (
    <div>
      <div className="section-label">OSTATNIE 24H</div>
      <div className="section-title">Live Overview</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
        {stats.map(s => (
          <div key={s.label} className="analytics-card" style={{ padding: "16px 20px" }}>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.5px", marginBottom: "8px", fontFamily: "sans-serif" }}>
              {s.label.toUpperCase()}
            </div>
            <div style={{ color: s.color, fontSize: "28px", fontWeight: 900, fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif" }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}