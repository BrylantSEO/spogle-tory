const ALL_HOURS = [3, 4, 5, 6, 8];

export default function SummaryBar({ totalMeters, totalPower, estimatedPrice, hasSelection, onSubmit, isMobile, selectedHours, onSelectHours, isPreset, isHighSeason, discountPercent, discountAmount, needsCustomQuote }) {
  const HOURS = (isPreset || isHighSeason) ? ALL_HOURS.filter(h => h >= 5) : ALL_HOURS;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 90,
        background: hasSelection ? "rgba(14,14,14,0.98)" : "rgba(0,0,0,0.9)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(14px)",
        padding: isMobile ? "12px 16px" : "0 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: hasSelection ? (isMobile ? "space-between" : "flex-start") : "center",
        height: isMobile ? "auto" : "64px",
        transition: "background 0.3s",
        gap: "0",
      }}
    >
      {!hasSelection ? (
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", fontFamily: "sans-serif", textAlign: "center", padding: isMobile ? "14px 0" : "0" }}>
          Skonfiguruj swój tor → wybierz segmenty lub gotowy set
        </div>
      ) : isMobile ? (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "10px 0" }}>
          {/* Hours picker */}
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px", fontFamily: "sans-serif", marginRight: "4px" }}>Liczba godzin:</span>
            {HOURS.map(h => (
              <button
                key={h}
                onClick={() => onSelectHours(selectedHours === h ? null : h)}
                style={{
                  background: selectedHours === h ? "#FF5C00" : "rgba(255,255,255,0.07)",
                  color: selectedHours === h ? "#fff" : "rgba(255,255,255,0.6)",
                  border: selectedHours === h ? "none" : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "6px",
                  padding: "4px 10px",
                  fontWeight: 700,
                  fontSize: "12px",
                  fontFamily: "sans-serif",
                  cursor: "pointer",
                }}
              >{h}h</button>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <div>
              <div style={{ color: "rgba(255,255,255,0.78)", fontSize: "11px", fontFamily: "sans-serif" }}>Szacowana cena</div>
              <div style={{ color: "#FF5C00", fontWeight: 800, fontSize: "18px", fontFamily: "'Arial Black', sans-serif", letterSpacing: "-0.5px" }}>
                {estimatedPrice}
              </div>
              {discountPercent > 0 && discountAmount > 0 && (
                <div style={{ color: "#4ade80", fontSize: "11px", fontFamily: "sans-serif", fontWeight: 700, marginTop: "2px" }}>
                  -{discountPercent}% · oszczędzasz {discountAmount} zł
                </div>
              )}
              {needsCustomQuote && (
                <div style={{ color: "rgba(255,255,255,0.72)", fontSize: "10px", fontFamily: "sans-serif", marginTop: "2px" }}>
                  Podaj maila — wycenimy indywidualnie
                </div>
              )}
            </div>
            <button
              onClick={onSubmit}
              style={{ background: "#FF5C00", color: "#fff", border: "none", borderRadius: "10px", padding: "13px 22px", fontWeight: 800, fontSize: "14px", fontFamily: "sans-serif", cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap", letterSpacing: "0.2px" }}
            >
              {needsCustomQuote ? "Uzyskaj wycenę →" : "Wyślij zapytanie →"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <StatPill icon="📏" label="Łączna długość" value={`${totalMeters} m`} active />
          <Divider />
          <StatPill icon="⚡" label="Wymagany prąd" value={totalPower || "0 kW"} active={totalMeters > 0} />
          <Divider />
          {/* Hours picker */}
          <div style={{ display: "flex", gap: "6px", alignItems: "center", padding: "0 16px" }}>
            <span style={{ color: "rgba(255,255,255,0.65)", fontSize: "11px", fontFamily: "sans-serif", marginRight: "4px", whiteSpace: "nowrap" }}>⏱ Godziny:</span>
            {HOURS.map(h => (
              <button
                key={h}
                onClick={() => onSelectHours(selectedHours === h ? null : h)}
                style={{
                  background: selectedHours === h ? "#FF5C00" : "rgba(255,255,255,0.07)",
                  color: selectedHours === h ? "#fff" : "rgba(255,255,255,0.55)",
                  border: selectedHours === h ? "none" : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "6px",
                  padding: "5px 12px",
                  fontWeight: 700,
                  fontSize: "12px",
                  fontFamily: "sans-serif",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >{h}h</button>
            ))}
          </div>
          <Divider />
          <div style={{ padding: "0 16px", minWidth: "140px" }}>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "11px", fontFamily: "sans-serif", marginBottom: "3px", letterSpacing: "0.3px" }}>
              💰 Szacowana cena
            </div>
            <div style={{ color: "#FF5C00", fontWeight: 800, fontSize: "16px", fontFamily: "'Arial Black', sans-serif", letterSpacing: "-0.4px" }}>
              {estimatedPrice}
            </div>
            {discountPercent > 0 && discountAmount > 0 && (
              <div style={{ color: "#4ade80", fontSize: "11px", fontFamily: "sans-serif", fontWeight: 700, marginTop: "2px", whiteSpace: "nowrap" }}>
                -{discountPercent}% · oszczędzasz {discountAmount} zł
              </div>
            )}
            {needsCustomQuote && (
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "10px", fontFamily: "sans-serif", marginTop: "2px", whiteSpace: "nowrap" }}>
                Podaj maila — wycenimy indywidualnie
              </div>
            )}
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button
              onClick={onSubmit}
              style={{ background: "#FF5C00", color: "#fff", border: "none", borderRadius: "10px", padding: "12px 28px", fontWeight: 800, fontSize: "15px", fontFamily: "sans-serif", cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap", letterSpacing: "0.3px", boxShadow: "0 4px 20px rgba(255,92,0,0.35)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#e05200"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#FF5C00"; }}
            >
              {needsCustomQuote ? "Uzyskaj wycenę →" : "Wyślij zapytanie →"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function StatPill({ icon, label, value, active, orange }) {
  return (
    <div style={{ padding: "0 16px", minWidth: "120px" }}>
      <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "11px", fontFamily: "sans-serif", marginBottom: "3px", letterSpacing: "0.3px" }}>
        {icon} {label}
      </div>
      <div
        style={{
          color: orange ? "#FF5C00" : active ? "#fff" : "rgba(255,255,255,0.3)",
          fontWeight: 800,
          fontSize: "16px",
          fontFamily: "'Arial Black', sans-serif",
          letterSpacing: "-0.4px",
          transition: "color 0.2s",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div style={{ width: "1px", height: "36px", background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />
  );
}