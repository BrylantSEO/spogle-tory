export default function SetLightbox({ set, onClose, onSelect, isActive }) {
  if (!set) return null;

  const SEGMENT_IMAGES = {
    "Tor 12m": "https://www.spogle.pl/wp-content/uploads/2025/02/tor-przeszkod-20m-warszawa.jpg",
    "Tor 20m": "https://www.spogle.pl/wp-content/uploads/2025/02/tor-przeszkod-20m-warszawa.jpg",
    "Tor 27m": "https://www.spogle.pl/wp-content/uploads/2025/06/2.png",
    "Tor 28m": "https://www.spogle.pl/wp-content/uploads/2025/06/tor-przeszkod-97m-1.jpg",
    "Atomic Drop": "https://www.spogle.pl/wp-content/uploads/2025/02/IMG_1031-scaled.jpg",
    "Zjeżdżalnia DUO": "https://www.spogle.pl/wp-content/uploads/2025/02/zjezdzalnia-dmuchana-duo.jpg",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 500,
        background: "rgba(0,0,0,0.93)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
        overflowY: "auto",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#1a1a1a",
          border: "1.5px solid rgba(255,255,255,0.1)",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "560px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%", width: "32px", height: "32px", color: "#fff", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}
        >×</button>

        {/* Image */}
        <div style={{ position: "relative", height: "220px", overflow: "hidden" }}>
          <img src={set.image} alt={set.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.7) 100%)" }} />
          {set.badge && (
            <div style={{ position: "absolute", top: "14px", left: "14px", background: set.badgeColor || "#FF5C00", color: "#fff", fontSize: "11px", fontWeight: 800, letterSpacing: "1.2px", padding: "4px 10px", borderRadius: "5px" }}>
              {set.badge}
            </div>
          )}
          <div style={{ position: "absolute", bottom: "14px", left: "16px" }}>
            <div style={{ color: "#fff", fontSize: "22px", fontWeight: 900, fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif", letterSpacing: "-0.3px" }}>
              {set.name}
            </div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", fontFamily: "sans-serif" }}>
              {set.meters}m · ⚡ {set.power}
            </div>
          </div>
        </div>

        {/* Components list */}
        <div style={{ padding: "20px 20px 0" }}>
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", fontWeight: 700, letterSpacing: "2px", fontFamily: "sans-serif", marginBottom: "12px" }}>
            SKŁAD SETU
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {set.components.map((comp, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "12px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "10px",
                padding: "10px 12px",
              }}>
                {SEGMENT_IMAGES[comp] && (
                  <div style={{ width: "48px", height: "36px", borderRadius: "6px", overflow: "hidden", flexShrink: 0 }}>
                    <img src={SEGMENT_IMAGES[comp]} alt={comp} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
                <span style={{ color: "#fff", fontSize: "14px", fontWeight: 600, fontFamily: "sans-serif" }}>{comp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price + CTA */}
        <div style={{ padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <div style={{ color: "#FF5C00", fontSize: "20px", fontWeight: 900, fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif" }}>
            {set.priceLabel}
          </div>
          <button
            onClick={() => { onSelect(); onClose(); }}
            style={{
              background: isActive ? "rgba(255,92,0,0.2)" : "#FF5C00",
              color: "#fff",
              border: isActive ? "1.5px solid #FF5C00" : "none",
              borderRadius: "8px",
              padding: "11px 22px",
              fontSize: "13px",
              fontWeight: 700,
              fontFamily: "sans-serif",
              cursor: "pointer",
              letterSpacing: "0.3px",
              transition: "opacity 0.15s",
            }}
          >
            {isActive ? "✓ Zaznaczony" : "Wybierz ten set"}
          </button>
        </div>
      </div>
    </div>
  );
}