const STEPS = [
  { key: "pageview", label: "Sesja (PageView)", color: "#60a5fa" },
  { key: "scroll50", label: "Scroll 50%", color: "#a78bfa" },
  { key: "segment", label: "Segment wybrany", color: "#f97316" },
  { key: "formOpened", label: "Formularz otwarty", color: "#facc15" },
  { key: "formSubmitted", label: "Zapytanie wysłane", color: "#4ade80" },
];

export default function FunnelChart({ sessions, clicks }) {
  const total = sessions.length;

  // Count scroll50 from click events
  const sessionIdsScroll50 = new Set(
    clicks.filter(c => c.event_name === "ScrollDepth50").map(c => c.session_id)
  );
  const sessionIdsWithSegment = new Set(
    clicks.filter(c => c.event_name === "SegmentSelected").map(c => c.session_id)
  );

  const counts = {
    pageview: total,
    scroll50: sessions.filter(s => sessionIdsScroll50.has(s.session_id)).length,
    segment: sessions.filter(s => sessionIdsWithSegment.has(s.session_id) || (s.segments_selected && s.segments_selected > 0)).length,
    formOpened: sessions.filter(s => s.form_opened).length,
    formSubmitted: sessions.filter(s => s.form_submitted).length,
  };

  return (
    <div>
      <div className="section-label">KONWERSJA</div>
      <div className="section-title">Lejek</div>
      <div className="analytics-card" style={{ display: "flex", flexDirection: "column", gap: "8px", minHeight: "320px" }}>
        {STEPS.map((step, i) => {
          const count = counts[step.key] || 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const prevCount = i > 0 ? (counts[STEPS[i - 1].key] || 0) : null;
          const dropoff = prevCount && prevCount > 0 ? Math.round(((prevCount - count) / prevCount) * 100) : null;

          return (
            <div key={step.key}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "12px", fontFamily: "sans-serif", color: "rgba(255,255,255,0.7)" }}>{step.label}</span>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  {dropoff !== null && (
                    <span style={{ fontSize: "10px", color: "#f87171", fontFamily: "sans-serif" }}>
                      -{dropoff}%
                    </span>
                  )}
                  <span style={{ fontSize: "12px", fontWeight: 700, color: step.color, fontFamily: "sans-serif", minWidth: "60px", textAlign: "right" }}>
                    {count} ({pct}%)
                  </span>
                </div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "4px", height: "28px", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: step.color,
                    borderRadius: "4px",
                    transition: "width 0.5s ease",
                    opacity: 0.8,
                    minWidth: count > 0 ? "4px" : "0",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}