import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const FALLBACK_IMAGES = {
  "Tor 12m": "https://www.spogle.pl/wp-content/uploads/2025/02/tor-przeszkod-12m.jpg",
  "Tor 20m": "https://www.spogle.pl/wp-content/uploads/2025/02/tor-przeszkod-20m.jpg",
  "Tor 27m": "https://www.spogle.pl/wp-content/uploads/2025/02/tor-przeszkod-27m.jpg",
  "Tor 28m": "https://www.spogle.pl/wp-content/uploads/2025/02/tor-przeszkod-28m.jpg",
  "Atomic Drop": "https://www.spogle.pl/wp-content/uploads/2025/02/IMG_1031-scaled.jpg",
  "Zjeżdżalnia DUO": "https://www.spogle.pl/wp-content/uploads/2025/02/zjezdzalnia-dmuchana-duo.jpg",
};

export default function SetLightbox({ set, onClose, onSelect, isActive }) {
  const [segmentImages, setSegmentImages] = useState({});
  const [hoveredComp, setHoveredComp] = useState(null);
  const [hoveredImg, setHoveredImg] = useState(null);

  useEffect(() => {
    base44.entities.TrackSegment.list().then(data => {
      const map = {};
      data.forEach(s => { map[s.name] = s.cover_image; });
      setSegmentImages(map);
    });
  }, []);

  if (!set) return null;

  const components = set.components && set.components.length > 0 ? set.components : [];

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
          maxWidth: "900px",
          overflow: "hidden",
          position: "relative",
          display: "flex",
          minHeight: "500px",
        }}
      >
        {/* Close */}
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "50%", width: "32px", height: "32px", color: "#fff", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 600 }}
        >×</button>

        {/* LEFT COLUMN — Image + Header */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {set.image ? (
            <img src={set.image} alt={set.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "#111" }} />
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.8) 100%)" }} />
          {set.badge && (
            <div style={{ position: "absolute", top: "14px", left: "14px", background: set.badgeColor || "#FF5C00", color: "#fff", fontSize: "11px", fontWeight: 800, letterSpacing: "1.2px", padding: "4px 10px", borderRadius: "5px" }}>
              {set.badge}
            </div>
          )}
          <div style={{ position: "absolute", bottom: "14px", left: "16px" }}>
            <div style={{ color: "#fff", fontSize: "28px", fontWeight: 900, fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif", letterSpacing: "-0.3px" }}>
              {set.name}
            </div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", fontFamily: "sans-serif", marginTop: "4px" }}>
              {set.meters}m · ⚡ {set.power_kw || set.power}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — Components + Price */}
         <div style={{ flex: 1, padding: "24px", display: "flex", flexDirection: "column", overflowY: "auto", maxHeight: "100%", position: "relative", zIndex: 10 }}>
           <div style={{ flex: 1, overflowY: "auto" }}>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", fontWeight: 700, letterSpacing: "2px", fontFamily: "sans-serif", marginBottom: "12px" }}>
              SKŁAD SETU
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {components.map((comp, i) => {
                const imgUrl = segmentImages[comp] || FALLBACK_IMAGES[comp];
                const isHovered = hoveredComp === i;
                return (
                  <div
                    key={i}
                    onMouseEnter={() => { setHoveredComp(i); setHoveredImg(imgUrl); }}
                    onMouseLeave={() => { setHoveredComp(null); setHoveredImg(null); }}
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      background: isHovered ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isHovered ? "rgba(255,92,0,0.4)" : "rgba(255,255,255,0.07)"}`,
                      borderRadius: "10px",
                      padding: "10px 12px",
                      cursor: "default",
                      transition: "all 0.15s",
                      position: "relative",
                    }}
                  >
                    <div style={{ width: "48px", height: "36px", borderRadius: "6px", overflow: "hidden", flexShrink: 0, background: "#222", transition: "transform 0.2s", transform: isHovered ? "scale(1.1)" : "scale(1)" }}>
                      {imgUrl && <img src={imgUrl} alt={comp} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                    </div>
                    <span style={{ color: "#fff", fontSize: "14px", fontWeight: 600, fontFamily: "sans-serif" }}>{comp}</span>
                    {/* hover preview rendered via portal-like state */}
                  </div>
                );
              })}
              {components.length === 0 && (
                <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "13px", fontFamily: "sans-serif" }}>Brak elementów</div>
              )}
            </div>
          </div>

          {/* Setup time and animators info */}
          <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
            {set.setup_time_minutes && (
              <div style={{ flex: 1, padding: "12px", background: "rgba(255,92,0,0.15)", borderRadius: "8px", borderLeft: "3px solid #FF5C00" }}>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", fontWeight: 700, letterSpacing: "1px", fontFamily: "sans-serif", marginBottom: "4px" }}>MONTAŻ</div>
                <div style={{ color: "#FF5C00", fontSize: "15px", fontWeight: 800, fontFamily: "sans-serif" }}>🔧 {set.setup_time_minutes} min</div>
              </div>
            )}
            {set.animators_included && set.animators_included > 0 && (
              <div style={{ flex: 1, padding: "12px", background: "rgba(255,92,0,0.15)", borderRadius: "8px", borderLeft: "3px solid #FF5C00" }}>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", fontWeight: 700, letterSpacing: "1px", fontFamily: "sans-serif", marginBottom: "4px" }}>ANIMATORZY</div>
                <div style={{ color: "#FF5C00", fontSize: "15px", fontWeight: 800, fontFamily: "sans-serif" }}>👤 {set.animators_included}</div>
              </div>
            )}
          </div>

          {/* Included items */}
          <div style={{ marginBottom: "20px", padding: "14px", background: "rgba(255,92,0,0.08)", borderRadius: "10px", border: "1px solid rgba(255,92,0,0.3)" }}>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", fontFamily: "sans-serif", marginBottom: "10px", textTransform: "uppercase" }}>W PAKIECIE</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                "Okablowanie (kable + siła)",
                "Rozdzielnica 32A (63A - wcześniejsza info)",
                "Sztuczna trawa",
                "Kotwy montażowe"
              ].map((item, i) => (
                <div key={i} style={{ color: "rgba(255,255,255,0.75)", fontSize: "12px", fontFamily: "sans-serif", display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <span style={{ color: "#FF5C00", fontWeight: 900, fontSize: "16px", marginTop: "-2px", flexShrink: 0 }}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price + CTA */}
          <div style={{ marginTop: "auto", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ color: "#FF5C00", fontSize: "24px", fontWeight: 900, fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif", marginBottom: "12px" }}>
              {set.priceLabel}
            </div>
            <button
              onClick={() => { onSelect(); onClose(); }}
              style={{
                width: "100%",
                background: isActive ? "rgba(255,92,0,0.2)" : "#FF5C00",
                color: isActive ? "#FF5C00" : "#fff",
                border: isActive ? "1.5px solid #FF5C00" : "none",
                borderRadius: "8px",
                padding: "12px 20px",
                fontSize: "14px",
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
    </div>
  );
}