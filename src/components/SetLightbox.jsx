import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export default function SetLightbox({ set, onClose, onSelect, isActive }) {
  const [segmentImages, setSegmentImages] = useState({});

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
          onClick={onClose}
          style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%", width: "32px", height: "32px", color: "#fff", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}
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
              {set.meters}m · ⚡ {set.power}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — Components + Price */}
        <div style={{ flex: 1, padding: "24px", display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", fontWeight: 700, letterSpacing: "2px", fontFamily: "sans-serif", marginBottom: "12px" }}>
              SKŁAD SETU
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {components.map((comp, i) => {
                const imgUrl = segmentImages[comp];
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "10px",
                    padding: "10px 12px",
                  }}>
                    <div style={{ width: "48px", height: "36px", borderRadius: "6px", overflow: "hidden", flexShrink: 0, background: "#222" }}>
                      {imgUrl && <img src={imgUrl} alt={comp} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                    </div>
                    <span style={{ color: "#fff", fontSize: "14px", fontWeight: 600, fontFamily: "sans-serif" }}>{comp}</span>
                  </div>
                );
              })}
              {components.length === 0 && (
                <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "13px", fontFamily: "sans-serif" }}>Brak elementów</div>
              )}
            </div>
          </div>

          {/* Price + CTA */}
          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
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