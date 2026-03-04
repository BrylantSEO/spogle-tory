export default function SummaryBar({ totalMeters, totalPower, estimatedPrice, hasSelection, onSubmit, isMobile }) {
  const canSubmit = hasSelection;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 90,
        background: "rgba(14,14,14,0.98)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(14px)",
        padding: isMobile ? "12px 16px" : "0 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: isMobile ? "space-between" : "flex-start",
        gap: "0",
        height: isMobile ? "auto" : "64px",
      }}
    >
      {isMobile ? (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "10px 0" }}>
            {!canSubmit && (
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", fontFamily: "sans-serif", textAlign: "center" }}>
                ← Wybierz segment lub gotowy set powyżej
              </div>
            )}
            {canSubmit && (
              <div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", fontFamily: "sans-serif" }}>
                  Szacowana cena
                </div>
                <div style={{ color: "#FF5C00", fontWeight: 800, fontSize: "18px", fontFamily: "'Arial Black', sans-serif", letterSpacing: "-0.5px" }}>
                  {estimatedPrice}
                </div>
              </div>
            )}
            <button
              onClick={canSubmit ? onSubmit : undefined}
              disabled={!canSubmit}
              style={{ background: canSubmit ? "#FF5C00" : "rgba(255,255,255,0.1)", color: canSubmit ? "#fff" : "rgba(255,255,255,0.3)", border: "none", borderRadius: "10px", padding: "13px 22px", fontWeight: 800, fontSize: "14px", fontFamily: "sans-serif", cursor: canSubmit ? "pointer" : "not-allowed", transition: "all 0.2s", whiteSpace: "nowrap", letterSpacing: "0.2px" }}
            >
              Wyślij zapytanie →
            </button>
          </div>
      ) : (
        <>
          <StatPill icon="📏" label="Łączna długość" value={`${totalMeters} m`} active={totalMeters > 0} />
          <Divider />
          <StatPill icon="⚡" label="Wymagany prąd" value={totalPower || "0A"} active={totalMeters > 0} />
          <Divider />
          <StatPill icon="💰" label="Szacowana cena" value={hasSelection ? estimatedPrice : "od 0 zł"} active={hasSelection} orange={hasSelection} />
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "16px" }}>
            {!canSubmit && (
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", fontFamily: "sans-serif" }}>
                ← Wybierz segment lub gotowy set powyżej
              </div>
            )}
            <button
              onClick={canSubmit ? onSubmit : undefined}
              disabled={!canSubmit}
              style={{ background: canSubmit ? "#FF5C00" : "rgba(255,255,255,0.08)", color: canSubmit ? "#fff" : "rgba(255,255,255,0.25)", border: "none", borderRadius: "10px", padding: "12px 28px", fontWeight: 800, fontSize: "15px", fontFamily: "sans-serif", cursor: canSubmit ? "pointer" : "not-allowed", transition: "all 0.2s", whiteSpace: "nowrap", letterSpacing: "0.3px", boxShadow: canSubmit ? "0 4px 20px rgba(255,92,0,0.35)" : "none" }}
              onMouseEnter={e => { if (canSubmit) e.currentTarget.style.background = "#e05200"; }}
              onMouseLeave={e => { if (canSubmit) e.currentTarget.style.background = "#FF5C00"; }}
            >
              Wyślij zapytanie →
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
      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", fontFamily: "sans-serif", marginBottom: "3px", letterSpacing: "0.3px" }}>
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