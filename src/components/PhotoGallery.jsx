import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import SegmentModal from "./SegmentModal";

// Fallback hardcoded photos if DB is empty
const FALLBACK_PHOTOS = [
  {
    src: "https://www.spogle.pl/wp-content/uploads/2025/06/tor-przeszkod-97m-1.jpg",
    alt: "Tor przeszkód 97m",
    segments: ["Tor 12m", "Tor 20m", "Tor 27m", "Tor 28m"],
    total_meters: "97m",
    hotpoints: [],
  },
  {
    src: "https://www.spogle.pl/wp-content/uploads/2025/06/2.png",
    alt: "Tor przeszkód",
    segments: ["Tor 12m", "Tor 20m", "Tor 28m"],
    total_meters: "60m",
    hotpoints: [],
  },
  {
    src: "https://www.spogle.pl/wp-content/uploads/2025/06/Tor-na-tle-legii.jpg",
    alt: "Tor na tle Legii",
    segments: ["Tor 20m", "Tor 28m"],
    total_meters: "48m",
    hotpoints: [],
  },
  {
    src: "https://www.spogle.pl/wp-content/uploads/2025/02/tor-przeszkod-20m-warszawa.jpg",
    alt: "Tor przeszkód 20m Warszawa",
    segments: ["Tor 20m"],
    total_meters: "20m",
    hotpoints: [],
  },
];

// Mapping label names to segment objects for the modal
const SEGMENT_BY_NAME = {
  "Tor 12m": { id: "tor12", name: "Tor 12m", meters: 12, power: "15A", price: 599, description: "Idealna opcja na mniejsze eventy i place zabaw" },
  "Tor 20m": { id: "tor20", name: "Tor 20m", meters: 20, power: "15A", price: 799, description: "Świetny wybór na festyny i firmowe pikniki" },
  "Tor 27m": { id: "tor27", name: "Tor 27m", meters: 27, power: "10–15A", price: 999, description: "Unikalny układ z zakrętem — idealna dla większych obszarów" },
  "Tor 28m": { id: "tor28", name: "Tor 28m", meters: 28, power: "15A", price: 1099, description: "Maksimum zabawy na dużych eventach plenerowych" },
  "Atomic Drop": { id: "atomic-drop", name: "Atomic Drop", meters: 11, power: "8A", price: 1800, description: "Gigantyczna dmuchana zjeżdżalnia, 11m dł × 7m wys. — dwa tory zjazdowe" },
  "Zjeżdżalnia DUO": { id: "duo", name: "Zjeżdżalnia DUO", meters: 9, power: "8A", price: 1800, description: "Ogromna zjeżdżalnia z dwoma torami jazdy i linami do wspinania" },
};

export default function PhotoGallery({ onAskAbout }) {
  const [photos, setPhotos] = useState(FALLBACK_PHOTOS);
  const [lightbox, setLightbox] = useState(null);
  const [activeHotpoint, setActiveHotpoint] = useState(null);
  const [hotpointSegmentModal, setHotpointSegmentModal] = useState(null);

  useEffect(() => {
    base44.entities.GalleryPhoto.list("sort_order", 200).then(data => {
      if (data && data.length > 0) setPhotos(data);
    });
  }, []);

  const prev = () => { setLightbox(i => (i - 1 + photos.length) % photos.length); setActiveHotpoint(null); };
  const next = () => { setLightbox(i => (i + 1) % photos.length); setActiveHotpoint(null); };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
    if (e.key === "Escape") setLightbox(null);
  };

  const currentPhoto = lightbox !== null ? photos[lightbox] : null;

  return (
    <section style={{ background: "#0a0a0a", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "80px 48px" }}>
      <style>{`
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        @media (max-width: 900px) {
          .gallery-grid { grid-template-columns: repeat(2, 1fr); }
          .gallery-section { padding: 60px 20px !important; }
        }
        @media (max-width: 500px) {
          .gallery-grid { grid-template-columns: 1fr 1fr; }
        }
        .gallery-thumb {
          overflow: hidden;
          border-radius: 10px;
          cursor: pointer;
          aspect-ratio: 4/3;
          border: 1.5px solid rgba(255,255,255,0.06);
          transition: border-color 0.2s, transform 0.2s;
          position: relative;
        }
        .gallery-thumb:hover { border-color: #FF5C00; transform: scale(1.02); }
        .gallery-thumb:hover .gallery-overlay { opacity: 1; }
        .gallery-overlay {
          position: absolute; inset: 0;
          background: rgba(255,92,0,0.18);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.2s;
        }
        .hotpoint-pin {
          position: absolute;
          transform: translate(-50%, -50%);
          width: 24px; height: 24px;
          background: #FF5C00;
          border-radius: 50%;
          border: 2px solid #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 900; color: #fff;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(0,0,0,0.6);
          transition: transform 0.15s;
          z-index: 10;
          animation: pulsePin 2s infinite;
        }
        .hotpoint-pin:hover { transform: translate(-50%, -50%) scale(1.2); }
        @keyframes pulsePin {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,92,0,0.5), 0 2px 10px rgba(0,0,0,0.6); }
          50% { box-shadow: 0 0 0 6px rgba(255,92,0,0), 0 2px 10px rgba(0,0,0,0.6); }
        }
        .hotpoint-tooltip {
          position: absolute;
          background: rgba(0,0,0,0.9);
          border: 1px solid #FF5C00;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          font-family: sans-serif;
          padding: 5px 10px;
          border-radius: 6px;
          white-space: nowrap;
          pointer-events: none;
          transform: translateX(-50%);
          bottom: calc(100% + 8px);
          left: 50%;
          z-index: 20;
        }
      `}</style>

      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Section header */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ color: "#FF5C00", fontSize: "11px", fontWeight: 700, letterSpacing: "2.5px", fontFamily: "sans-serif", marginBottom: "12px" }}>
            GALERIA
          </div>
          <h2 style={{ fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif", fontSize: "40px", fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", textTransform: "uppercase" }}>
            Nasze realizacje
          </h2>
        </div>

        {/* Grid */}
        <div className="gallery-grid">
          {photos.map((photo, idx) => (
            <div key={photo.id || idx} className="gallery-thumb" onClick={() => { setLightbox(idx); setActiveHotpoint(null); }}>
              <img src={photo.src} alt={photo.alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <div className="gallery-overlay">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && currentPhoto && (
        <div
          tabIndex={0}
          onKeyDown={handleKeyDown}
          autoFocus
          onClick={() => { setLightbox(null); setActiveHotpoint(null); }}
          style={{
            position: "fixed", inset: 0, zIndex: 300,
            background: "rgba(0,0,0,0.93)",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(8px)",
          }}
        >
          {/* Close */}
          <button
            onClick={() => setLightbox(null)}
            style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: "40px", height: "40px", color: "#fff", fontSize: "22px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}
          >×</button>

          {/* Prev */}
          <button
            onClick={e => { e.stopPropagation(); prev(); }}
            style={{ position: "absolute", left: "20px", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: "48px", height: "48px", color: "#fff", fontSize: "22px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, transition: "background 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,92,0,0.6)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          >‹</button>

          {/* Image + hotpoints */}
          <div
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: "90vw", maxHeight: "85vh", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}
          >
            <div style={{ position: "relative", display: "inline-block" }}>
              <img
                src={currentPhoto.src}
                alt={currentPhoto.alt}
                style={{ maxWidth: "90vw", maxHeight: "65vh", objectFit: "contain", borderRadius: "12px", boxShadow: "0 24px 80px rgba(0,0,0,0.7)", display: "block" }}
              />
              {/* Hotpoints */}
              {(currentPhoto.hotpoints || []).map((hp, i) => (
                <div
                  key={i}
                  className="hotpoint-pin"
                  style={{ left: `${hp.x}%`, top: `${hp.y}%` }}
                  onClick={e => { e.stopPropagation(); setActiveHotpoint(activeHotpoint === i ? null : i); }}
                >
                  {i + 1}
                  {activeHotpoint === i && (
                    <div className="hotpoint-tooltip">{hp.label}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Segment tags */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center" }}>
                {(currentPhoto.segments || []).map(seg => (
                  <span key={seg} style={{ background: "rgba(255,92,0,0.18)", border: "1px solid rgba(255,92,0,0.5)", color: "#FF5C00", fontSize: "11px", fontWeight: 700, fontFamily: "sans-serif", letterSpacing: "0.5px", padding: "3px 10px", borderRadius: "5px" }}>
                    {seg}
                  </span>
                ))}
                {currentPhoto.total_meters && (
                  <span style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", fontSize: "11px", fontWeight: 700, fontFamily: "sans-serif", letterSpacing: "0.5px", padding: "3px 10px", borderRadius: "5px" }}>
                    Łącznie: {currentPhoto.total_meters}
                  </span>
                )}
              </div>
              {currentPhoto.description && (
                <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "14px", fontFamily: "sans-serif", fontStyle: "italic", textAlign: "center", maxWidth: "500px" }}>
                  {currentPhoto.description}
                </div>
              )}

              {/* Price + CTA */}
              {(currentPhoto.price_label || onAskAbout) && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
                  {currentPhoto.price_label && (
                    <div style={{ color: "#FF5C00", fontSize: "18px", fontWeight: 900, fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif", letterSpacing: "-0.3px" }}>
                      {currentPhoto.price_label}
                    </div>
                  )}
                  {onAskAbout && (
                    <button
                      onClick={e => { e.stopPropagation(); setLightbox(null); onAskAbout(currentPhoto); }}
                      style={{
                        background: "#FF5C00",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "10px 20px",
                        fontSize: "13px",
                        fontWeight: 700,
                        fontFamily: "sans-serif",
                        cursor: "pointer",
                        letterSpacing: "0.3px",
                        transition: "opacity 0.15s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                    >
                      Zapytaj o rezerwację →
                    </button>
                  )}
                </div>
              )}

              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", fontFamily: "sans-serif" }}>
                {lightbox + 1} / {photos.length}
                {(currentPhoto.hotpoints || []).length > 0 && (
                  <span style={{ marginLeft: "8px", color: "rgba(255,92,0,0.6)" }}>· kliknij pinezki aby zobaczyć opis</span>
                )}
              </div>
            </div>
          </div>

          {/* Next */}
          <button
            onClick={e => { e.stopPropagation(); next(); }}
            style={{ position: "absolute", right: "20px", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: "48px", height: "48px", color: "#fff", fontSize: "22px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, transition: "background 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,92,0,0.6)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          >›</button>
        </div>
      )}
    </section>
  );
}