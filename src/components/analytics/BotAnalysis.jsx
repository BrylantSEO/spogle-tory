function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pl-PL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function BotAnalysis({ sessions }) {
  const bots = sessions.filter(s => s.is_bot_suspected);

  // Count by reason
  const reasonCounts = {};
  bots.forEach(s => {
    const reasons = (s.bot_reason || "unknown").split(", ");
    reasons.forEach(r => {
      reasonCounts[r] = (reasonCounts[r] || 0) + 1;
    });
  });
  const sortedReasons = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <div className="section-label">OCHRONA</div>
      <div className="section-title">Analiza botów ({bots.length})</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px" }}>
        {/* Reason summary */}
        <div className="analytics-card">
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 700, letterSpacing: "1px", marginBottom: "14px", fontFamily: "sans-serif" }}>
            POWODY PODEJRZEŃ
          </div>
          {sortedReasons.length === 0 ? (
            <div style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px" }}>Brak botów 🎉</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {sortedReasons.map(([reason, count]) => (
                <div key={reason} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#f87171", fontSize: "13px", fontFamily: "sans-serif", fontWeight: 600 }}>{reason}</span>
                  <span style={{ background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", fontSize: "12px", fontWeight: 700, padding: "2px 10px", borderRadius: "20px", fontFamily: "sans-serif" }}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bot session list */}
        <div className="analytics-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto", maxHeight: "300px", overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {["Czas", "Urządzenie", "Powód", "Czas na stronie", "Kliknięcia"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "rgba(255,255,255,0.35)", fontSize: "10px", fontWeight: 700, letterSpacing: "1px", fontFamily: "sans-serif", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bots.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "rgba(255,255,255,0.2)", fontFamily: "sans-serif" }}>
                      Brak podejrzanych sesji ✓
                    </td>
                  </tr>
                )}
                {bots.map(s => (
                  <tr key={s.session_id} style={{ borderBottom: "1px solid rgba(248,113,113,0.08)", background: "rgba(248,113,113,0.04)" }}>
                    <td style={{ padding: "9px 14px", fontSize: "12px", color: "rgba(255,255,255,0.6)", fontFamily: "sans-serif", whiteSpace: "nowrap" }}>{fmtDate(s.started_at)}</td>
                    <td style={{ padding: "9px 14px", fontSize: "12px", color: "rgba(255,255,255,0.6)", fontFamily: "sans-serif" }}>{s.device_type || "—"}</td>
                    <td style={{ padding: "9px 14px", fontSize: "11px", color: "#f87171", fontFamily: "sans-serif", fontWeight: 600 }}>{s.bot_reason || "—"}</td>
                    <td style={{ padding: "9px 14px", fontSize: "12px", color: "rgba(255,255,255,0.6)", fontFamily: "sans-serif" }}>
                      {s.time_on_page_seconds ? `${s.time_on_page_seconds}s` : "—"}
                    </td>
                    <td style={{ padding: "9px 14px", fontSize: "12px", color: "rgba(255,255,255,0.6)", fontFamily: "sans-serif" }}>{s.total_clicks ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}