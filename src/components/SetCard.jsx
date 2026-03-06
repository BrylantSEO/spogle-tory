export default function SetCard({ set, isActive, onSelect, onDetail }) {
  return (
    <div
      style={{
        position: "relative",
        background: isActive ? "rgba(255,92,0,0.08)" : "rgba(255,255,255,0.03)",
        border: isActive ? "1.5px solid #FF5C00" : "1.5px solid rgba(255,255,255,0.1)",
        borderRadius: "14px",
        overflow: "hidden",
        transition: "all 0.18s ease",
        boxShadow: isActive ? "0 0 0 1px #FF5C00, 0 4px 24px rgba(255,92,0,0.15)" : "none",
        userSelect: "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Image — full width, no overlay buttons */}
      <div style={{ position: "relative", height: "160px", overflow: "hidden" }}>
        <img
          src={set.image}
          alt={set.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
            filter: isActive ? "brightness(1)" : "brightness(0.75)",
            transition: "filter 0.2s",
          }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.45) 100%)", pointerEvents: "none" }} />

        {/* Badge only */}
        {set.badge && (
          <div style={{ position: "absolute", top: "10px", left: "10px", background: set.badgeColor || "#FF5C00", color: "#fff", fontSize: "10px", fontWeight: 800, letterSpacing: "1.2px", padding: "3px 8px", borderRadius: "4px", fontFamily: "sans-serif" }}>
            {set.badge}
          </div>
        )}

        {isActive && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(255,92,0,0.08)", pointerEvents: "none" }} />
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "12px 14px 14px", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Name + meters */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
          <span style={{ color: "#fff", fontSize: "15px", fontWeight: 800, fontFamily: "'Arial Black', Arial, sans-serif", letterSpacing: "-0.3px" }}>
            {set.name}
          </span>
          <span style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: "11px", fontWeight: 600, padding: "2px 7px", borderRadius: "4px", fontFamily: "sans-serif" }}>
            {set.meters}m
          </span>
        </div>

        {/* Components */}
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontFamily: "sans-serif", lineHeight: 1.4, marginBottom: "10px" }}>
          {set.components.join(" + ")}
        </div>

        {/* Power + price */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", fontFamily: "sans-serif" }}>
            ⚡ {set.power}
          </span>
          <span style={{ color: "#FF5C00", fontSize: "14px", fontWeight: 700, fontFamily: "'Arial Black', sans-serif" }}>
            {set.priceLabel}
          </span>
        </div>

        {/* Action buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "auto" }}>
          {onDetail && (
            <button
              onClick={e => { e.stopPropagation(); onDetail(); }}
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "8px",
                color: "rgba(255,255,255,0.8)",
                fontSize: "13px",
                fontWeight: 700,
                fontFamily: "sans-serif",
                padding: "10px 0",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              Szczegóły
            </button>
          )}
          <button
            onClick={e => { e.stopPropagation(); onSelect(); }}
            style={{
              background: isActive ? "rgba(255,92,0,0.15)" : "#FF5C00",
              border: isActive ? "1.5px solid #FF5C00" : "none",
              borderRadius: "8px",
              color: isActive ? "#FF5C00" : "#fff",
              fontSize: "13px",
              fontWeight: 800,
              fontFamily: "sans-serif",
              padding: "10px 0",
              cursor: "pointer",
              transition: "all 0.15s",
              gridColumn: onDetail ? "auto" : "1 / -1",
            }}
          >
            {isActive ? "✓ Wybrano" : "Dodaj"}
          </button>
        </div>
      </div>
    </div>
  );
}
