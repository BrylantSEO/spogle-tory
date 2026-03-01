import { useState } from "react";

const PHOTOS = [
  {
    src: "https://www.spogle.pl/wp-content/uploads/2025/06/tor-przeszkod-97m-1.jpg",
    alt: "Tor przeszkód 97m",
  },
  {
    src: "https://www.spogle.pl/wp-content/uploads/2025/06/2.png",
    alt: "Tor przeszkód",
  },
  {
    src: "https://www.spogle.pl/wp-content/uploads/2025/06/Tor-na-tle-legii.jpg",
    alt: "Tor na tle Legii",
  },
  {
    src: "https://www.spogle.pl/wp-content/uploads/2025/02/tor-przeszkod-20m-warszawa.jpg",
    alt: "Tor przeszkód 20m Warszawa",
  },
];

export default function PhotoGallery() {
  const [lightbox, setLightbox] = useState(null); // index or null

  const prev = () => setLightbox(i => (i - 1 + PHOTOS.length) % PHOTOS.length);
  const next = () => setLightbox(i => (i + 1) % PHOTOS.length);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
    if (e.key === "Escape") setLightbox(null);
  };

  return (
    <section
      style={{
        background: "#0a0a0a",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "80px 48px",
      }}
    >
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
        .gallery-thumb:hover {
          border-color: #FF5C00;
          transform: scale(1.02);
        }
        .gallery-thumb:hover .gallery-overlay {
          opacity: 1;
        }
        .gallery-overlay {
          position: absolute;
          inset: 0;
          background: rgba(255,92,0,0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
        }
      `}</style>

      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Section header */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ color: "#FF5C00", fontSize: "11px", fontWeight: 700, letterSpacing: "2.5px", fontFamily: "sans-serif", marginBottom: "12px" }}>
            GALERIA
          </div>
          <h2
            style={{
              fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif",
              fontSize: "40px",
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-0.5px",
              textTransform: "uppercase",
            }}
          >
            Nasze realizacje
          </h2>
        </div>

        {/* Grid */}
        <div className="gallery-grid">
          {PHOTOS.map((photo, idx) => (
            <div
              key={idx}
              className="gallery-thumb"
              onClick={() => setLightbox(idx)}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
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
      {lightbox !== null && (
        <div
          tabIndex={0}
          onKeyDown={handleKeyDown}
          autoFocus
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 300,
            background: "rgba(0,0,0,0.93)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(8px)",
          }}
        >
          {/* Close */}
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              color: "#fff",
              fontSize: "22px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
              zIndex: 10,
            }}
          >
            ×
          </button>

          {/* Prev */}
          <button
            onClick={e => { e.stopPropagation(); prev(); }}
            style={{
              position: "absolute",
              left: "20px",
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "50%",
              width: "48px",
              height: "48px",
              color: "#fff",
              fontSize: "22px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              transition: "background 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,92,0,0.6)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          >
            ‹
          </button>

          {/* Image */}
          <div
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: "90vw", maxHeight: "85vh", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}
          >
            <img
              src={PHOTOS[lightbox].src}
              alt={PHOTOS[lightbox].alt}
              style={{
                maxWidth: "90vw",
                maxHeight: "80vh",
                objectFit: "contain",
                borderRadius: "12px",
                boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
              }}
            />
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", fontFamily: "sans-serif" }}>
              {lightbox + 1} / {PHOTOS.length} · {PHOTOS[lightbox].alt}
            </div>
          </div>

          {/* Next */}
          <button
            onClick={e => { e.stopPropagation(); next(); }}
            style={{
              position: "absolute",
              right: "20px",
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "50%",
              width: "48px",
              height: "48px",
              color: "#fff",
              fontSize: "22px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              transition: "background 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,92,0,0.6)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          >
            ›
          </button>
        </div>
      )}
    </section>
  );
}