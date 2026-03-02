import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AnalyticsOverview from "../components/analytics/AnalyticsOverview";
import SessionsTable from "../components/analytics/SessionsTable";
import EventBarChart from "../components/analytics/EventBarChart";
import FunnelChart from "../components/analytics/FunnelChart";
import BotAnalysis from "../components/analytics/BotAnalysis";

const RANGES = [
  { label: "Dziś", value: "today" },
  { label: "7 dni", value: "7d" },
  { label: "30 dni", value: "30d" },
];

function getRangeStart(range) {
  const now = new Date();
  if (range === "today") {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (range === "7d") return new Date(now - 7 * 86400000);
  return new Date(now - 30 * 86400000);
}

export default function Analityka() {
  const [range, setRange] = useState("today");
  const [sessions, setSessions] = useState([]);
  const [clicks, setClicks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      base44.entities.PageSession.list("-started_at", 500),
      base44.entities.ClickEvent.list("-clicked_at", 2000),
    ]).then(([s, c]) => {
      setSessions(s || []);
      setClicks(c || []);
      setLoading(false);
    });
  }, []);

  const rangeStart = getRangeStart(range);

  const filteredSessions = sessions.filter(s =>
    s.started_at && new Date(s.started_at) >= rangeStart
  );
  const filteredClicks = clicks.filter(c =>
    c.clicked_at && new Date(c.clicked_at) >= rangeStart
  );

  const last24hStart = new Date(Date.now() - 86400000);
  const last24h = sessions.filter(s => s.started_at && new Date(s.started_at) >= last24hStart);

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", color: "#fff", fontFamily: "sans-serif", padding: "32px 24px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&display=swap');
        * { box-sizing: border-box; }
        .analytics-card { background: #1a1a1a; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 24px; }
        .section-title { font-family: 'Barlow Condensed', 'Arial Black', sans-serif; font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; color: #fff; margin-bottom: 16px; }
        .section-label { color: #FF5C00; font-size: 11px; font-weight: 700; letter-spacing: 2px; margin-bottom: 6px; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div className="section-label">PANEL ADMINISTRACYJNY</div>
          <h1 style={{ fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif", fontSize: "40px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.5px", margin: 0 }}>
            Analityka
          </h1>
        </div>
        <div style={{ display: "flex", gap: "6px", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "4px" }}>
          {RANGES.map(r => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              style={{
                background: range === r.value ? "#FF5C00" : "transparent",
                color: range === r.value ? "#fff" : "rgba(255,255,255,0.5)",
                border: "none",
                borderRadius: "7px",
                padding: "8px 18px",
                fontSize: "13px",
                fontWeight: 700,
                fontFamily: "sans-serif",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", padding: "80px", fontSize: "16px" }}>
          Ładowanie danych...
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          <AnalyticsOverview sessions={last24h} />
          <SessionsTable sessions={filteredSessions} clicks={clicks} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <EventBarChart clicks={filteredClicks} range={range} />
            <FunnelChart sessions={filteredSessions} clicks={filteredClicks} />
          </div>
          <BotAnalysis sessions={filteredSessions} />
        </div>
      )}
    </div>
  );
}