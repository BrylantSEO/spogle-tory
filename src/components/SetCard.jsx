export default function SetCard({ set, isActive, onSelect }) {
  return (
    <div
      onClick={onSelect}
      style={{
        position: "relative",
        background: isActive ? "rgba(255,92,0,0.12)" : "rgba(255,255,255,0.03)",
        border: isActive ? "1.5px solid #FF5C00" : "1.5px solid rgba(255,255,255,0.1)",
        borderRadius: "14px",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.18s ease",
        boxShadow: isActive ? "0 0 0 1px #FF5C00, 0 4px 24px rgba(255,92,0,0.15)" : "none",
        userSelect: "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: "130px", overflow: "hidden" }}>
        <img
          src={set.image}
          alt={set.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: isActive ? "brightness(1)" : "brightness(0.6)", transition: "filter 0.2s" }}
        />
        {isActive && <div style={{ position: "absolute", inset: 0, background: "rgba(255,92,0,0.1)", pointerEvents: "none" }} />}

        {/* Badge */}
        {set.badge && (
          <div style={{ position: "absolute", top: "10px", left: "10px", background: set.badgeColor || "#FF5C00", color: "#fff", fontSize: "10px", fontWeight: 800, letterSpacing: "1.2px", padding: "3px 8px", borderRadius: "4px", fontFamily: "sans-serif" }}>
            {set.badge}
          </div>
        )}

        {/* Checkbox */}
        <div style={{ position: "absolute", top: "10px", right: "10px", width: "22px", height: "22px", borderRadius: "5px", border: isActive ? "none" : "2px solid rgba(255,255,255,0.4)", background: isActive ? "#FF5C00" : "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s ease" }}>
          {isActive && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4L4.2 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "12px 14px 14px", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
          <span style={{ color: "#fff", fontSize: "15px", fontWeight: 800, fontFamily: "'Arial Black', Arial, sans-serif", letterSpacing: "-0.3px" }}>
            {set.name}
          </span>
          <span style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: "11px", fontWeight: 600, padding: "2px 7px", borderRadius: "4px", fontFamily: "sans-serif" }}>
            {set.meters}m
          </span>
        </div>

        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontFamily: "sans-serif", lineHeight: 1.4, marginBottom: "10px" }}>
          {set.components.join(" + ")}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", fontFamily: "sans-serif" }}>
            ⚡ {set.power}
          </span>
          <span style={{ color: "#FF5C00", fontSize: "14px", fontWeight: 700, fontFamily: "'Arial Black', sans-serif" }}>
            {set.priceLabel}
          </span>
        </div>
      </div>
    </div>
  );
}