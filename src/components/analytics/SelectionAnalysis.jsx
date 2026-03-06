const SEGMENT_NAMES = {
  tor12: "Tor 12m",
  tor20: "Tor 20m",
  tor27: "Tor 27m",
  tor28: "Tor 28m",
  "atomic-drop": "Atomic Drop",
  duo: "Zjeżdżalnia DUO",
};

const PRESET_NAMES = {
  legia: "Set LEGIA",
  tor4u: "Set Tor4U",
  gigant: "Tor Gigant",
};

const SEGMENT_ORDER = ["tor12", "tor20", "tor27", "tor28", "atomic-drop", "duo"];

function parseSafe(json) {
  try { return JSON.parse(json || "{}"); } catch { return {}; }
}

function BarList({ items, color = "#FF5C00" }) {
  if (!items.length) return (
    <div style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "40px 0", fontSize: "13px" }}>
      Brak danych
    </div>
  );
  const max = items[0][1];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {items.map(([name, count]) => (
        <div key={name} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ minWidth: "160px", color: "rgba(255,255,255,0.75)", fontSize: "13px", fontFamily: "sans-serif", textAlign: "right" }}>
            {name}
          </div>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: "4px", height: "22px", position: "relative", overflow: "hidden" }}>
            <div style={{
              width: `${(count / max) * 100}%`,
              height: "100%",
              background: color,
              borderRadius: "4px",
              opacity: 0.85,
              transition: "width 0.5s ease",
            }} />
          </div>
          <div style={{ minWidth: "32px", color: "rgba(255,255,255,0.45)", fontSize: "12px", fontFamily: "sans-serif", textAlign: "right" }}>
            {count}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SelectionAnalysis({ clicks }) {
  // Count SegmentSelected per segment_id
  const segCounts = {};
  const slideCounts = {};
  const presetCounts = {};

  // Track which segments were selected per session
  const sessionSegments = {}; // session_id → Set of segment ids

  clicks.forEach(c => {
    const data = parseSafe(c.event_data);
    if (c.event_name === "SegmentSelected") {
      const id = data.segment_id;
      if (!id) return;
      if (["atomic-drop", "duo"].includes(id)) {
        slideCounts[id] = (slideCounts[id] || 0) + 1;
      } else {
        segCounts[id] = (segCounts[id] || 0) + 1;
      }
      // For combinations
      if (c.session_id) {
        if (!sessionSegments[c.session_id]) sessionSegments[c.session_id] = new Set();
        sessionSegments[c.session_id].add(id);
      }
    } else if (c.event_name === "SlideSelected") {
      const id = data.slide_id;
      if (!id) return;
      slideCounts[id] = (slideCounts[id] || 0) + 1;
      if (c.session_id) {
        if (!sessionSegments[c.session_id]) sessionSegments[c.session_id] = new Set();
        sessionSegments[c.session_id].add(id);
      }
    } else if (c.event_name === "PresetSelected") {
      const id = data.preset_id;
      if (id) presetCounts[id] = (presetCounts[id] || 0) + 1;
    }
  });

  const sortedSegs = Object.entries(segCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([id, n]) => [SEGMENT_NAMES[id] || id, n]);

  const sortedSlides = Object.entries(slideCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([id, n]) => [SEGMENT_NAMES[id] || id, n]);

  const sortedPresets = Object.entries(presetCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([id, n]) => [PRESET_NAMES[id] || id, n]);

  // Combinations: sessions with 2+ segments
  const comboCounts = {};
  Object.values(sessionSegments).forEach(segs => {
    if (segs.size < 2) return;
    // Sort by canonical order
    const sorted = SEGMENT_ORDER.filter(id => segs.has(id));
    if (sorted.length < 2) return;
    const key = sorted.map(id => SEGMENT_NAMES[id] || id).join(" + ");
    comboCounts[key] = (comboCounts[key] || 0) + 1;
  });

  const sortedCombos = Object.entries(comboCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div>
      <div className="section-label">CO KLIKAJĄ</div>
      <div className="section-title">Popularne wybory</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Tory */}
        <div className="analytics-card">
          <div style={{ color: "#FF5C00", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", marginBottom: "4px" }}>TORY</div>
          <div style={{ color: "#fff", fontWeight: 900, fontSize: "16px", fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif", textTransform: "uppercase", marginBottom: "16px" }}>
            Najczęściej wybierane segmenty
          </div>
          <BarList items={sortedSegs} color="#FF5C00" />
        </div>

        {/* Zjeżdżalnie */}
        <div className="analytics-card">
          <div style={{ color: "#f97316", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", marginBottom: "4px" }}>ZJEŻDŻALNIE</div>
          <div style={{ color: "#fff", fontWeight: 900, fontSize: "16px", fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif", textTransform: "uppercase", marginBottom: "16px" }}>
            Dodatki do toru
          </div>
          <BarList items={sortedSlides} color="#f97316" />
        </div>

        {/* Presety */}
        <div className="analytics-card">
          <div style={{ color: "#a78bfa", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", marginBottom: "4px" }}>GOTOWE SETY</div>
          <div style={{ color: "#fff", fontWeight: 900, fontSize: "16px", fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif", textTransform: "uppercase", marginBottom: "16px" }}>
            Najczęściej wybierane sety
          </div>
          <BarList items={sortedPresets} color="#a78bfa" />
        </div>

        {/* Kombinacje */}
        <div className="analytics-card">
          <div style={{ color: "#4ade80", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", marginBottom: "4px" }}>KOMBINACJE</div>
          <div style={{ color: "#fff", fontWeight: 900, fontSize: "16px", fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif", textTransform: "uppercase", marginBottom: "16px" }}>
            Popularne zestawienia
          </div>
          <BarList items={sortedCombos} color="#4ade80" />
        </div>
      </div>
    </div>
  );
}
