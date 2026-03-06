import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import SegmentModal from "./SegmentModal";

function getYoutubeVideoId(url) {
  if (!url) return null;
  // Already embed URL
  const mEmbed = url.match(/youtube\.com\/embed\/([^?&]+)/);
  if (mEmbed) return mEmbed[1];
  // Standard watch URL
  const mWatch = url.match(/[?&]v=([^&]+)/);
  if (mWatch) return mWatch[1];
  // Short URL: youtu.be/VIDEO_ID
  const mShort = url.match(/youtu\.be\/([^?&]+)/);
  if (mShort) return mShort[1];
  // Shorts URL
  const mShorts = url.match(/youtube\.com\/shorts\/([^?&]+)/);
  if (mShorts) return mShorts[1];
  return null;
}

function YoutubeEmbed({ url, title }) {
  const [playing, setPlaying] = useState(false);
  const [thumbError, setThumbError] = useState(false);
  const videoId = getYoutubeVideoId(url);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : null;
  const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;

  if (!embedUrl) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", width: "100%", height: "100%", background: "#1a1a1a", color: "#fff", textDecoration: "none" }}
      >
        <div style={{ background: "#FF5C00", borderRadius: "50%", width: "56px", height: "56px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>▶</div>
        <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "12px", fontFamily: "sans-serif" }}>Otwórz film →</div>
      </a>
    );
  }

  if (playing) {
    return (
      <iframe
        src={embedUrl}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      />
    );
  }

  return (
    <div
      onClick={() => setPlaying(true)}
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", cursor: "pointer", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}
    >
      {thumbUrl && !thumbError && (
        <img
          src={thumbUrl}
          alt={title}
          onError={() => setThumbError(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)" }} />
      <div style={{
        position: "relative",
        background: "#FF5C00",
        borderRadius: "50%",
        width: "60px",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "22px",
        color: "#fff",
        boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
        transition: "transform 0.15s",
      }}>▶</div>
    </div>
  );
}

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
  const [allItems, setAllItems] = useState({ photos: FALLBACK_PHOTOS, videos: [] });
  const [lightbox, setLightbox] = useState(null);
  const [activeHotpoint, setActiveHotpoint] = useState(null);
  const [hotpointSegmentModal, setHotpointSegmentModal] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    base44.entities.GalleryPhoto.list("sort_order", 200).then(data => {
      if (data && data.length > 0) {
        setAllItems({
          photos: data.filter(d => !d.video_url),
          videos: data.filter(d => !!d.video_url),
        });
      }
    });
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const photos = allItems.photos;
  const videos = allItems.videos;

  const prev = () => { setLightbox(i => (i - 1 + photos.length) % photos.length); setActiveHotpoint(null); };
  const next = () => { setLightbox(i => (i + 1) % photos.length); setActiveHotpoint(null); };

  const touchStartX = useRef(null);
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); }
    touchStartX.current = null;
  };

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
          <h2 style={{ fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif", fontSize: "40px", fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", textTransform: "uppercase", marginBottom: "16px" }}>
            Nasze realizacje
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "16px", fontFamily: "sans-serif", lineHeight: 1.65, maxWidth: "640px", marginBottom: "10px" }}>
            <strong style={{ color: "#fff" }}>Tory przeszkód dopasowane do Twoich potrzeb!</strong> Zainteresowała Cię jakaś konfiguracja? Na każdym zdjęciu masz zaznaczone jakie dokładnie dmuchańce wchodzą w jej skład.{" "}
            <span style={{ color: "rgba(255,255,255,0.7)" }}>Powiększ zdjęcie i wyślij nam zapytanie o ten dokładnie tor.</span>
          </p>
        </div>

        {/* Grid */}
        <div className="gallery-grid">
          {photos.map((photo, idx) => {
            const isVideo = !!photo.video_url;
            const thumbSrc = photo.src || null;
            return (
              <div key={photo.id || idx} className="gallery-thumb" onClick={() => { setLightbox(idx); setActiveHotpoint(null); }}>
                {isVideo && !thumbSrc ? (
                  <div style={{ width: "100%", height: "100%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "36px", marginBottom: "8px" }}>▶</div>
                      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", fontFamily: "sans-serif" }}>{photo.alt}</div>
                    </div>
                  </div>
                ) : (
                  <img src={thumbSrc} alt={photo.alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                )}
                <div className="gallery-overlay">
                  {isVideo ? (
                    <div style={{ background: "#FF5C00", borderRadius: "50%", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>▶</div>
                  ) : (
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                    </svg>
                  )}
                </div>
                {isVideo && (
                  <div style={{ position: "absolute", top: "8px", left: "8px", background: "#FF5C00", color: "#fff", fontSize: "9px", fontWeight: 800, letterSpacing: "1px", padding: "2px 7px", borderRadius: "4px", fontFamily: "sans-serif" }}>
                    WIDEO
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && currentPhoto && (
        <div
          tabIndex={0}
          onKeyDown={handleKeyDown}
          autoFocus
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
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

          {/* Image/Video + hotpoints */}
          <div
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: "90vw", maxHeight: "85vh", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}
          >
            <div style={{ position: "relative", display: "inline-block" }}>
              {currentPhoto.video_url ? (
                <div style={{ width: "min(800px, 90vw)", position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: "12px", overflow: "hidden", background: "#000", boxShadow: "0 24px 80px rgba(0,0,0,0.7)" }}>
                  <YoutubeEmbed url={currentPhoto.video_url} title={currentPhoto.alt} />
                </div>
              ) : (
              <img
                src={currentPhoto.src}
                alt={currentPhoto.alt}
                style={{ maxWidth: "90vw", maxHeight: "65vh", objectFit: "contain", borderRadius: "12px", boxShadow: "0 24px 80px rgba(0,0,0,0.7)", display: "block" }}
              />
              )}
              {/* Hotpoints — desktop only */}
              {!isMobile && !currentPhoto.video_url && (currentPhoto.hotpoints || []).map((hp, i) => {
                const segmentObj = SEGMENT_BY_NAME[hp.label];
                return (
                  <div
                    key={i}
                    className="hotpoint-pin"
                    style={{ left: `${hp.x}%`, top: `${hp.y}%` }}
                    onClick={e => { e.stopPropagation(); setActiveHotpoint(activeHotpoint === i ? null : i); }}
                  >
                    {i + 1}
                    {activeHotpoint === i && (
                      <div
                        className="hotpoint-tooltip"
                        style={{ pointerEvents: "auto", display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap" }}
                        onClick={e => e.stopPropagation()}
                      >
                        <span>{hp.label}</span>
                        {segmentObj && (
                          <button
                            onClick={e => { e.stopPropagation(); setHotpointSegmentModal(segmentObj); }}
                            style={{
                              background: "#FF5C00",
                              color: "#fff",
                              border: "none",
                              borderRadius: "4px",
                              padding: "2px 8px",
                              fontSize: "11px",
                              fontWeight: 700,
                              fontFamily: "sans-serif",
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Szczegóły →
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Info pod zdjęciem */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", width: "100%", maxWidth: isMobile ? "100%" : "auto" }}>

              {/* Mobile: rozbudowana lista torów */}
              {isMobile && (currentPhoto.segments || []).length > 0 && (
                <div style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px 14px" }}>
                  <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "10px", fontWeight: 700, letterSpacing: "2px", fontFamily: "sans-serif", marginBottom: "10px" }}>
                    SKŁAD ZESTAWU
                    {currentPhoto.total_meters && (
                      <span style={{ marginLeft: "8px", color: "rgba(255,92,0,0.8)", fontWeight: 700 }}>· łącznie {currentPhoto.total_meters}</span>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {(currentPhoto.segments || []).map((seg, i) => {
                      const obj = SEGMENT_BY_NAME[seg];
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ color: "#FF5C00", fontWeight: 900, fontSize: "14px", flexShrink: 0, width: "16px", textAlign: "center" }}>{i + 1}</span>
                          <span style={{ color: "#fff", fontSize: "14px", fontWeight: 700, fontFamily: "sans-serif" }}>{seg}</span>
                          {obj && (
                            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", fontFamily: "sans-serif" }}>{obj.meters}m</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Desktop: tagi */}
              {!isMobile && (
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
              )}

              {currentPhoto.description && (
                <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "14px", fontFamily: "sans-serif", fontStyle: "italic", textAlign: "center", maxWidth: "500px" }}>
                  {currentPhoto.description}
                </div>
              )}

              {/* Price + CTA */}
              {(currentPhoto.price_label || onAskAbout) && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", justifyContent: "center", width: "100%" }}>
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
                        width: isMobile ? "100%" : "auto",
                      }}
                    >
                      Zapytaj o rezerwację tego toru →
                    </button>
                  )}
                </div>
              )}

              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", fontFamily: "sans-serif" }}>
                {lightbox + 1} / {photos.length}
                {!isMobile && (currentPhoto.hotpoints || []).length > 0 && (
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

      {/* VIDEO SECTION */}
      {videos.length > 0 && (
        <div style={{ maxWidth: "1400px", margin: "60px auto 0" }}>
          <div style={{ marginBottom: "28px" }}>
            <div style={{ color: "#FF5C00", fontSize: "11px", fontWeight: 700, letterSpacing: "2.5px", fontFamily: "sans-serif", marginBottom: "12px" }}>
              WIDEO
            </div>
            <h2 style={{ fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif", fontSize: "36px", fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", textTransform: "uppercase" }}>
              Filmy z realizacji
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
            {videos.map((video, idx) => (
              <div key={video.id || idx} style={{ borderRadius: "12px", overflow: "hidden", border: "1.5px solid rgba(255,255,255,0.08)", background: "#111" }}>
                <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                  <YoutubeEmbed url={video.video_url} title={video.alt} />
                </div>
                {(video.alt || video.description) && (
                  <div style={{ padding: "12px 16px" }}>
                    {video.alt && <div style={{ color: "#fff", fontSize: "14px", fontWeight: 700, fontFamily: "sans-serif", marginBottom: "4px" }}>{video.alt}</div>}
                    {video.description && <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", fontFamily: "sans-serif" }}>{video.description}</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hotpoint segment modal — renders on top of everything */}
      {hotpointSegmentModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 400 }}>
          <SegmentModal
            segment={hotpointSegmentModal}
            selected={false}
            onToggle={() => {}}
            onClose={() => setHotpointSegmentModal(null)}
          />
        </div>
      )}
    </section>
  );
}