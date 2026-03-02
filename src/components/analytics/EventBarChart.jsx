const EVENT_COLORS = {
  SegmentSelected: "#FF5C00",
  SegmentDeselected: "#7c3030",
  SlideSelected: "#f97316",
  SlideDeselected: "#7c4a1a",
  PresetSelected: "#a78bfa",
  PresetDeselected: "#5b4a8a",
  FormOpened: "#facc15",
  FormSubmitted: "#4ade80",
  SegmentDetailOpened: "#60a5fa",
  SetDetailOpened: "#818cf8",
  PhoneClick: "#f472b6",
  FormAbandoned: "#f87171",
};

export default function EventBarChart({ clicks }) {
  const counts = {};
  clicks.forEach(c => {
    counts[c.event_name] = (counts[c.event_name] || 0) + 1;
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = sorted.length > 0 ? sorted[0][1] : 1;

  return (
    <div>
      <div className="section-label">EVENTY</div>
      <div className="section-title">Heatmapa kliknięć</div>
      <div className="analytics-card" style={{ minHeight: "320px" }}>
        {sorted.length === 0 ? (
          <div style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "60px 0", fontSize: "14px" }}>Brak danych</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {sorted.map(([name, count]) => (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ minWidth: "180px", color: "rgba(255,255,255,0.7)", fontSize: "12px", fontFamily: "sans-serif", textAlign: "right" }}>
                  {name}
                </div>
                <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: "4px", height: "24px", position: "relative", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${(count / max) * 100}%`,
                      height: "100%",
                      background: EVENT_COLORS[name] || "#FF5C00",
                      borderRadius: "4px",
                      transition: "width 0.5s ease",
                      opacity: 0.85,
                    }}
                  />
                </div>
                <div style={{ minWidth: "36px", color: "rgba(255,255,255,0.5)", fontSize: "12px", fontFamily: "sans-serif", textAlign: "right" }}>
                  {count}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}