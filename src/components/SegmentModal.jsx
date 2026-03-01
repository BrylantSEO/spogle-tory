const SEGMENT_IMAGES = {
  tor12: "https://www.spogle.pl/wp-content/uploads/2025/02/tor-przeszkod-12m-warszawa.jpg",
  tor20: "https://www.spogle.pl/wp-content/uploads/2025/02/tor-przeszkod-20m-warszawa.jpg",
  tor27: "https://www.spogle.pl/wp-content/uploads/2025/02/tor-przeszkod-27m-warszawa.jpg",
  tor28: "https://www.spogle.pl/wp-content/uploads/2025/02/tor-przeszkod-28m-warszawa.jpg",
  giga: "https://www.spogle.pl/wp-content/uploads/2025/06/tor-przeszkod-97m-1.jpg",
};

export default function SegmentModal({ segment, onClose, onToggle, selected }) {
  const imgSrc = segment.image || SEGMENT_IMAGES[segment.id] || "https://www.spogle.pl/wp-content/uploads/2025/06/tor-przeszkod-97m-1.jpg";
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#141414",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "18px",
          maxWidth: "620px",
          width: "100%",
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
        }}
      >
        {/* Image */}
        <div style={{ position: "relative" }}>
          <img
            src={imgSrc}
            alt={segment.name}
            style={{
              width: "100%",
              height: "280px",
              objectFit: "cover",
              display: "block",
            }}
          />
          {/* close btn */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "14px",
              right: "14px",
              background: "rgba(0,0,0,0.6)",
              border: "none",
              borderRadius: "50%",
              width: "34px",
              height: "34px",
              color: "#fff",
              fontSize: "18px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
          >
            ×
          </button>
          {segment.id === "giga" && (
            <div
              style={{
                position: "absolute",
                top: "14px",
                left: "14px",
                background: "#FF5C00",
                color: "#fff",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "1.2px",
                padding: "4px 10px",
                borderRadius: "5px",
                fontFamily: "sans-serif",
              }}
            >
              NAJWIĘKSZY W POLSCE
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "14px" }}>
            <div>
              <h2
                style={{
                  color: "#fff",
                  fontSize: "24px",
                  fontWeight: 900,
                  fontFamily: "'Arial Black', sans-serif",
                  letterSpacing: "-0.5px",
                  margin: 0,
                }}
              >
                {segment.name}
              </h2>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", fontFamily: "sans-serif", marginTop: "4px" }}>
                {segment.description}
              </p>
            </div>
            <span
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.6)",
                fontSize: "13px",
                fontWeight: 700,
                padding: "5px 12px",
                borderRadius: "6px",
                fontFamily: "sans-serif",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {segment.meters}m
            </span>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <StatBox label="Długość" value={`${segment.meters}m`} />
            <StatBox label="Wymagany prąd" value={`⚡ ${segment.power}`} />
            <StatBox
              label="Cena"
              value={segment.priceLabel || `od ${segment.price} zł`}
              orange={!!segment.priceLabel || false}
            />
          </div>

          {/* CTA */}
          <button
            onClick={() => { onToggle(); onClose(); }}
            style={{
              width: "100%",
              background: selected ? "rgba(255,92,0,0.15)" : "#FF5C00",
              color: selected ? "#FF5C00" : "#fff",
              border: selected ? "1.5px solid #FF5C00" : "none",
              borderRadius: "10px",
              padding: "15px",
              fontWeight: 800,
              fontSize: "15px",
              fontFamily: "sans-serif",
              cursor: "pointer",
              transition: "all 0.2s",
              letterSpacing: "0.3px",
            }}
          >
            {selected ? "✓ Dodano do konfiguracji — usuń" : "Dodaj do konfiguracji →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, orange }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "10px",
        padding: "12px 14px",
      }}
    >
      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.8px", fontFamily: "sans-serif", marginBottom: "4px" }}>
        {label.toUpperCase()}
      </div>
      <div
        style={{
          color: orange ? "#FF5C00" : "#fff",
          fontSize: "14px",
          fontWeight: 800,
          fontFamily: "'Arial Black', sans-serif",
        }}
      >
        {value}
      </div>
    </div>
  );
}