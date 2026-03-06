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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    base44.entities.TrackSegment.list().then(data => {
      const map = {};
      data.forEach(s => { map[s.name] = s.cover_image; });
      setSegmentImages(map);
    });
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  if (!set) return null;

  const components = set.components && set.components.length > 0 ? set.components : [];

  const includedItems = [
    "Okablowanie (kable + siła)",
    "Rozdzielnica 32A (63A - wcześniejsza info)",
    "Sztuczna trawa",
    "Kotwy montażowe",
  ];

  const ComponentList = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {components.map((comp, i) => {
        const imgUrl = segmentImages[comp] || FALLBACK_IMAGES[comp];
        const isHovered = hoveredComp === i;
        return (
          <div
            key={i}
            onMouseEnter={() => { setHoveredComp(i); if (!isMobile) setHoveredImg(imgUrl); }}
            onMouseLeave={() => { setHoveredComp(null); setHoveredImg(null); }}
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              background: isHovered ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${isHovered ? "rgba(255,92,0,0.4)" : "rgba(255,255,255,0.07)"}`,
              borderRadius: "10px",
              padding: "10px 12px",
              cursor: "default",
              transition: "all 0.15s",
            }}
          >
            <div style={{ width: "48px", height: "36px", borderRadius: "6px", overflow: "hidden", flexShrink: 0, background: "#222" }}>
              {imgUrl && <img src={imgUrl} alt={comp} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
            </div>
            <span style={{ color: "#fff", fontSize: "14px", fontWeight: 600, fontFamily: "sans-serif" }}>{comp}</span>
          </div>
        );
      })}
      {components.length === 0 && (
        <div style={{ color: "rgba(255,255,255,0.82)", fontSize: "13px", fontFamily: "sans-serif" }}>Brak elementów</div>
      )}
    </div>
  );

  const MetaInfo = () => (
    <>
      {(set.setup_time_minutes || (set.animators_included > 0)) && (
        <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
          {set.setup_time_minutes && (
            <div style={{ flex: 1, padding: "12px", background: "rgba(255,92,0,0.15)", borderRadius: "8px", borderLeft: "3px solid #FF5C00" }}>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "10px", fontWeight: 700, letterSpacing: "1px", fontFamily: "sans-serif", marginBottom: "4px" }}>MONTAŻ</div>
              <div style={{ color: "#FF5C00", fontSize: "15px", fontWeight: 800, fontFamily: "sans-serif" }}>🔧 {set.setup_time_minutes} min</div>
            </div>
          )}
          {set.animators_included > 0 && (
            <div style={{ flex: 1, padding: "12px", background: "rgba(255,92,0,0.15)", borderRadius: "8px", borderLeft: "3px solid #FF5C00" }}>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "10px", fontWeight: 700, letterSpacing: "1px", fontFamily: "sans-serif", marginBottom: "4px" }}>ANIMATORZY</div>
              <div style={{ color: "#FF5C00", fontSize: "15px", fontWeight: 800, fontFamily: "sans-serif" }}>👤 {set.animators_included}</div>
            </div>
          )}
        </div>
      )}
      <div style={{ marginBottom: "16px", padding: "14px", background: "rgba(255,92,0,0.08)", borderRadius: "10px", border: "1px solid rgba(255,92,0,0.3)" }}>
        <div style={{ color: "rgba(255,255,255,0.78)", fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", fontFamily: "sans-serif", marginBottom: "10px", textTransform: "uppercase" }}>W PAKIECIE</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {includedItems.map((item, i) => (
            <div key={i} style={{ color: "rgba(255,255,255,0.75)", fontSize: "12px", fontFamily: "sans-serif", display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <span style={{ color: "#FF5C00", fontWeight: 900, fontSize: "16px", marginTop: "-2px", flexShrink: 0 }}>✓</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const CTA = () => (
    <div style={{ paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
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
          padding: "14px 20px",
          fontSize: "15px",
          fontWeight: 700,
          fontFamily: "sans-serif",
          cursor: "pointer",
          letterSpacing: "0.3px",
        }}
      >
        {isActive ? "✓ Zaznaczony" : "Wybierz ten set"}
      </button>
    </div>
  );

  if (isMobile) {
    return (
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 500,
          background: "rgba(0,0,0,0.96)",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: "#1a1a1a",
            minHeight: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Close */}
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            style={{ position: "fixed", top: "12px", right: "12px", background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "50%", width: "36px", height: "36px", color: "#fff", fontSize: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 600 }}
          >×</button>

          {/* Hero image — full width, 56vw tall */}
          <div style={{ width: "100%", height: "56vw", minHeight: "220px", maxHeight: "320px", position: "relative", flexShrink: 0, background: "#111" }}>
            {set.image && (
              <img src={set.image} alt={set.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            )}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.75) 100%)" }} />
            {set.badge && (
              <div style={{ position: "absolute", top: "14px", left: "14px", background: set.badgeColor || "#FF5C00", color: "#fff", fontSize: "11px", fontWeight: 800, letterSpacing: "1.2px", padding: "4px 10px", borderRadius: "5px" }}>
                {set.badge}
              </div>
            )}
            <div style={{ position: "absolute", bottom: "14px", left: "16px" }}>
              <div style={{ color: "#fff", fontSize: "32px", fontWeight: 900, fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif", letterSpacing: "-0.3px", lineHeight: 1 }}>
                {set.name}
              </div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", fontFamily: "sans-serif", marginTop: "5px" }}>
                {set.meters}m · ⚡ {set.power_kw || set.power}
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: "20px 16px 32px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Skład */}
            <div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px", fontWeight: 700, letterSpacing: "2px", fontFamily: "sans-serif", marginBottom: "10px" }}>SKŁAD SETU</div>
              <ComponentList />
            </div>

            <MetaInfo />
            <CTA />
          </div>
        </div>
      </div>
    );
  }

  // Desktop — new two-row layout
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
          maxWidth: "1100px",
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Close */}
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "50%", width: "32px", height: "32px", color: "#fff", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 600 }}
        >×</button>

        {/* TOP ROW — 80% image + 20% components */}
        <div style={{ display: "flex", height: "420px" }}>

          {/* Image — 80% */}
          <div style={{ flex: "0 0 80%", position: "relative", overflow: "hidden" }}>
            {hoveredImg ? (
              <img src={hoveredImg} alt="podgląd" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "opacity 0.2s" }} />
            ) : set.image ? (
              <img src={set.image} alt={set.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", background: "#111" }} />
            )}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.75) 100%)" }} />
            {hoveredImg && (
              <div style={{ position: "absolute", top: "12px", left: "14px", background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: "11px", fontFamily: "sans-serif", fontWeight: 600, padding: "4px 10px", borderRadius: "6px", backdropFilter: "blur(4px)" }}>podgląd</div>
            )}
            {set.badge && !hoveredImg && (
              <div style={{ position: "absolute", top: "14px", left: "14px", background: set.badgeColor || "#FF5C00", color: "#fff", fontSize: "11px", fontWeight: 800, letterSpacing: "1.2px", padding: "4px 10px", borderRadius: "5px" }}>
                {set.badge}
              </div>
            )}
            <div style={{ position: "absolute", bottom: "18px", left: "20px" }}>
              <div style={{ color: "#fff", fontSize: "36px", fontWeight: 900, fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif", letterSpacing: "-0.5px", lineHeight: 1 }}>{set.name}</div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "15px", fontFamily: "sans-serif", marginTop: "6px" }}>{set.meters}m · ⚡ {set.power_kw || set.power}</div>
            </div>
          </div>

          {/* Components — 20% */}
          <div style={{ flex: "0 0 20%", borderLeft: "1px solid rgba(255,255,255,0.08)", padding: "20px 16px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "9px", fontWeight: 700, letterSpacing: "2px", fontFamily: "sans-serif", marginBottom: "12px", textTransform: "uppercase" }}>Skład setu</div>
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
                      display: "flex", alignItems: "center", gap: "8px",
                      background: isHovered ? "rgba(255,92,0,0.12)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isHovered ? "rgba(255,92,0,0.4)" : "rgba(255,255,255,0.07)"}`,
                      borderRadius: "8px",
                      padding: "8px 10px",
                      cursor: "default",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ width: "36px", height: "28px", borderRadius: "4px", overflow: "hidden", flexShrink: 0, background: "#222" }}>
                      {imgUrl && <img src={imgUrl} alt={comp} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                    </div>
                    <span style={{ color: isHovered ? "#FF5C00" : "#fff", fontSize: "12px", fontWeight: 600, fontFamily: "sans-serif", lineHeight: 1.3 }}>{comp}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW — technical details + CTA */}
        <div style={{ padding: "20px 24px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: "16px", alignItems: "flex-start" }}>

          {/* Montaż + Animatorzy */}
          {(set.setup_time_minutes || set.animators_included > 0) && (
            <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
              {set.setup_time_minutes && (
                <div style={{ padding: "12px 16px", background: "rgba(255,92,0,0.12)", borderRadius: "8px", borderLeft: "3px solid #FF5C00" }}>
                  <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "9px", fontWeight: 700, letterSpacing: "1px", fontFamily: "sans-serif", marginBottom: "4px" }}>MONTAŻ</div>
                  <div style={{ color: "#FF5C00", fontSize: "14px", fontWeight: 800, fontFamily: "sans-serif" }}>🔧 {set.setup_time_minutes} min</div>
                </div>
              )}
              {set.animators_included > 0 && (
                <div style={{ padding: "12px 16px", background: "rgba(255,92,0,0.12)", borderRadius: "8px", borderLeft: "3px solid #FF5C00" }}>
                  <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "9px", fontWeight: 700, letterSpacing: "1px", fontFamily: "sans-serif", marginBottom: "4px" }}>ANIMATORZY</div>
                  <div style={{ color: "#FF5C00", fontSize: "14px", fontWeight: 800, fontFamily: "sans-serif" }}>👤 {set.animators_included}</div>
                </div>
              )}
            </div>
          )}

          {/* W pakiecie */}
          <div style={{ flex: 1, padding: "12px 16px", background: "rgba(255,92,0,0.06)", borderRadius: "8px", border: "1px solid rgba(255,92,0,0.2)" }}>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "9px", fontWeight: 700, letterSpacing: "1.5px", fontFamily: "sans-serif", marginBottom: "8px" }}>W PAKIECIE</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px" }}>
              {includedItems.map((item, i) => (
                <div key={i} style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", fontFamily: "sans-serif", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ color: "#FF5C00", fontWeight: 900 }}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price + CTA */}
          <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
            <div style={{ color: "#FF5C00", fontSize: "28px", fontWeight: 900, fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif", lineHeight: 1 }}>
              {set.priceLabel}
            </div>
            <button
              onClick={() => { onSelect(); onClose(); }}
              style={{
                background: isActive ? "rgba(255,92,0,0.2)" : "#FF5C00",
                color: isActive ? "#FF5C00" : "#fff",
                border: isActive ? "1.5px solid #FF5C00" : "none",
                borderRadius: "8px",
                padding: "13px 28px",
                fontSize: "15px",
                fontWeight: 700,
                fontFamily: "sans-serif",
                cursor: "pointer",
                whiteSpace: "nowrap",
                letterSpacing: "0.3px",
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