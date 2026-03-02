import { useState } from "react";

function fmtTime(secs) {
  if (!secs) return "—";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("pl-PL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function rowBg(s) {
  if (s.form_submitted) return "rgba(74,222,128,0.07)";
  if (s.form_opened) return "rgba(250,204,21,0.07)";
  if (s.is_bot_suspected) return "rgba(248,113,113,0.07)";
  return "transparent";
}

function rowBorder(s) {
  if (s.form_submitted) return "rgba(74,222,128,0.3)";
  if (s.form_opened) return "rgba(250,204,21,0.3)";
  if (s.is_bot_suspected) return "rgba(248,113,113,0.3)";
  return "rgba(255,255,255,0.05)";
}

const TH = ({ children }) => (
  <th style={{ padding: "10px 12px", textAlign: "left", color: "rgba(255,255,255,0.4)", fontSize: "10px", fontWeight: 700, letterSpacing: "1px", fontFamily: "sans-serif", whiteSpace: "nowrap", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
    {children}
  </th>
);

const TD = ({ children, style }) => (
  <td style={{ padding: "10px 12px", fontSize: "12px", fontFamily: "sans-serif", color: "rgba(255,255,255,0.75)", whiteSpace: "nowrap", ...style }}>
    {children}
  </td>
);

function Pill({ yes, yesLabel = "✓", noLabel = "—" }) {
  return (
    <span style={{ fontSize: "11px", fontWeight: 700, color: yes ? "#4ade80" : "rgba(255,255,255,0.2)" }}>
      {yes ? yesLabel : noLabel}
    </span>
  );
}

export default function SessionsTable({ sessions, clicks }) {
  const [expanded, setExpanded] = useState(null);

  const clicksBySession = {};
  clicks.forEach(c => {
    if (!clicksBySession[c.session_id]) clicksBySession[c.session_id] = [];
    clicksBySession[c.session_id].push(c);
  });

  return (
    <div>
      <div className="section-label">SESJE</div>
      <div className="section-title">Timeline sesji</div>
      <div className="analytics-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <TH>Czas</TH>
                <TH>Urządzenie</TH>
                <TH>Źródło</TH>
                <TH>Czas na stronie</TH>
                <TH>Max scroll</TH>
                <TH>Kliknięcia</TH>
                <TH>Segmenty</TH>
                <TH>Formularz</TH>
                <TH>Zapytanie</TH>
                <TH>Bot?</TH>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 && (
                <tr><td colSpan={10} style={{ padding: "32px", textAlign: "center", color: "rgba(255,255,255,0.2)", fontFamily: "sans-serif" }}>Brak danych</td></tr>
              )}
              {sessions.map(s => {
                const isOpen = expanded === s.session_id;
                const sessionClicks = (clicksBySession[s.session_id] || []).sort((a, b) => new Date(a.clicked_at) - new Date(b.clicked_at));
                return [
                  <tr
                    key={s.session_id}
                    onClick={() => setExpanded(isOpen ? null : s.session_id)}
                    style={{ background: rowBg(s), borderBottom: `1px solid ${rowBorder(s)}`, cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.3)"}
                    onMouseLeave={e => e.currentTarget.style.filter = "brightness(1)"}
                  >
                    <TD>{fmtDate(s.started_at)}</TD>
                    <TD>{s.device_type || "—"}</TD>
                    <TD style={{ maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {s.utm_source || (s.referrer ? s.referrer.replace(/^https?:\/\//, "").split("/")[0] : "direct")}
                    </TD>
                    <TD>{fmtTime(s.time_on_page_seconds)}</TD>
                    <TD>{s.max_scroll_depth != null ? `${s.max_scroll_depth}%` : "—"}</TD>
                    <TD>{s.total_clicks ?? "—"}</TD>
                    <TD>{s.segments_selected ?? "—"}</TD>
                    <TD><Pill yes={s.form_opened} yesLabel="✓ tak" /></TD>
                    <TD><Pill yes={s.form_submitted} yesLabel="✓ tak" /></TD>
                    <TD>
                      {s.is_bot_suspected ? (
                        <span style={{ color: "#f87171", fontSize: "11px", fontWeight: 700 }}>⚠ {s.bot_reason || "tak"}</span>
                      ) : (
                        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px" }}>—</span>
                      )}
                    </TD>
                  </tr>,
                  isOpen && (
                    <tr key={s.session_id + "_exp"}>
                      <td colSpan={10} style={{ background: "#111", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ color: "#FF5C00", fontSize: "11px", fontWeight: 700, letterSpacing: "1px", marginBottom: "10px" }}>
                          CLICK EVENTS ({sessionClicks.length})
                        </div>
                        {sessionClicks.length === 0 ? (
                          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>Brak eventów</div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            {sessionClicks.map((c, i) => {
                              let parsed = {};
                              try { parsed = JSON.parse(c.event_data || "{}"); } catch (_) {}
                              return (
                                <div key={c.id || i} style={{ display: "flex", gap: "16px", alignItems: "baseline", background: "rgba(255,255,255,0.03)", borderRadius: "6px", padding: "7px 12px" }}>
                                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", minWidth: "80px" }}>+{c.time_since_load_seconds}s</span>
                                  <span style={{ color: "#FF5C00", fontSize: "12px", fontWeight: 700, minWidth: "200px" }}>{c.event_name}</span>
                                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>{Object.entries(parsed).map(([k, v]) => `${k}: ${v}`).join(" · ")}</span>
                                  <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "10px", marginLeft: "auto" }}>{fmtDate(c.clicked_at)}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                ];
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Legend */}
      <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
        {[
          { color: "rgba(74,222,128,0.4)", label: "Zapytanie wysłane" },
          { color: "rgba(250,204,21,0.4)", label: "Formularz otwarty" },
          { color: "rgba(248,113,113,0.4)", label: "Podejrzany bot" },
        ].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "10px", height: "10px", background: l.color, borderRadius: "2px" }} />
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif" }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}