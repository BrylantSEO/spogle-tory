import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

function toEmbedUrl(url) {
  if (!url) return null;
  let videoId = null;
  if (url.includes("youtube.com/embed/")) {
    const m = url.match(/embed\/([^?&/]+)/);
    videoId = m ? m[1] : null;
    if (!videoId) return url;
  }
  if (!videoId) {
    const m = url.match(/[?&]v=([^&]+)/);
    if (m) videoId = m[1];
  }
  if (!videoId) {
    const m2 = url.match(/youtu\.be\/([^?&]+)/);
    if (m2) videoId = m2[1];
  }
  if (!videoId) return url;
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
}

const SEGMENT_IMAGES = {
  tor12: "https://www.spogle.pl/wp-content/uploads/2025/02/tor-przeszkod-12m-warszawa.jpg",
  tor20: "https://www.spogle.pl/wp-content/uploads/2025/02/tor-przeszkod-20m-warszawa.jpg",
  tor27: "https://www.spogle.pl/wp-content/uploads/2025/02/tor-przeszkod-27m-warszawa.jpg",
  tor28: "https://www.spogle.pl/wp-content/uploads/2025/02/Tor-28m.jpg",
  giga: "https://www.spogle.pl/wp-content/uploads/2025/06/tor-przeszkod-97m-1.jpg",
};

export default function SegmentModal({ segment, onClose, onToggle, selected, selectedHours, onSelectHours }) {
  const [dbData, setDbData] = useState(null);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);

  useEffect(() => {
    base44.entities.TrackSegment.filter({ segment_id: segment.id }).then(res => {
      if (res && res.length > 0) setDbData(res[0]);
    });
    setGalleryIdx(0);
    setDescExpanded(false);
  }, [segment.id]);

  const coverImg = dbData?.cover_image || segment.image || SEGMENT_IMAGES[segment.id] || null;
  const promoVideo = dbData?.promo_video_url ? toEmbedUrl(dbData.promo_video_url) : null;
  const rawGallery = dbData?.gallery_images?.length > 0 ? dbData.gallery_images : [];
  const allImages = coverImg ? [coverImg, ...rawGallery.filter(url => url !== coverImg)] : rawGallery;
  const baseImages = allImages.length > 0 ? allImages : (coverImg ? [coverImg] : []);
  const galleryItems = [
    ...baseImages.map(url => ({ type: "image", url })),
    ...(promoVideo ? [{ type: "video", url: promoVideo }] : []),
  ];
  const description = dbData?.description || segment.description;
  const currentItem = galleryItems[galleryIdx] || { type: "image", url: coverImg };

  const prices = dbData ? [
    { h: 3, v: dbData.price_3h },
    { h: 4, v: dbData.price_4h },
    { h: 5, v: dbData.price_5h },
    { h: 6, v: dbData.price_6h },
    { h: 8, v: dbData.price_8h },
  ].filter(p => p.v) : [];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.88)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#141414",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "20px 20px 0 0",
          width: "100%",
          maxWidth: "640px",
          maxHeight: "92dvh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 -8px 60px rgba(0,0,0,0.7)",
        }}
      >
        {/* IMAGE — fixed at top */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          {currentItem.type === "video" ? (
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, background: "#000" }}>
              <iframe
                src={currentItem.url}
                title="Film promocyjny"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
              />
            </div>
          ) : (
            <img
              src={currentItem.url}
              alt={segment.name}
              style={{ width: "100%", height: "240px", objectFit: "cover", display: "block" }}
            />
          )}

          {currentItem.type === "image" && (
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 40%, rgba(20,20,20,0.65) 100%)", pointerEvents: "none" }} />
          )}

          {/* Close */}
          <button
            onClick={onClose}
            style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.65)", border: "none", borderRadius: "50%", width: "34px", height: "34px", color: "#fff", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)", zIndex: 2 }}
          >×</button>

          {segment.id === "giga" && currentItem.type === "image" && (
            <div style={{ position: "absolute", top: "12px", left: "12px", background: "#FF5C00", color: "#fff", fontSize: "11px", fontWeight: 800, letterSpacing: "1.2px", padding: "4px 10px", borderRadius: "5px", fontFamily: "sans-serif", zIndex: 2 }}>
              NAJWIĘKSZY W POLSCE
            </div>
          )}

          {/* Gallery nav arrows */}
          {galleryItems.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); setGalleryIdx(i => (i - 1 + galleryItems.length) % galleryItems.length); }}
                style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.55)", border: "none", borderRadius: "50%", width: "34px", height: "34px", color: "#fff", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}
              >‹</button>
              <button
                onClick={e => { e.stopPropagation(); setGalleryIdx(i => (i + 1) % galleryItems.length); }}
                style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.55)", border: "none", borderRadius: "50%", width: "34px", height: "34px", color: "#fff", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}
              >›</button>
              <div style={{ position: "absolute", bottom: "10px", right: "14px", color: "rgba(255,255,255,0.5)", fontSize: "11px", fontFamily: "sans-serif", zIndex: 2 }}>
                {galleryIdx + 1} / {galleryItems.length}
              </div>
            </>
          )}

          {/* Title overlay on image */}
          {currentItem.type === "image" && (
            <div style={{ position: "absolute", bottom: "14px", left: "16px", right: "60px", zIndex: 2 }}>
              <h2 style={{ color: "#fff", fontSize: "24px", fontWeight: 900, fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif", letterSpacing: "-0.3px", margin: 0, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
                {segment.name}
              </h2>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px", fontFamily: "sans-serif", marginTop: "2px" }}>
                {segment.meters}m · ⚡ {segment.power}
              </div>
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {galleryItems.length > 1 && (
          <div style={{ display: "flex", gap: "6px", padding: "10px 16px 0", overflowX: "auto", flexShrink: 0 }}>
            {galleryItems.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setGalleryIdx(idx)}
                style={{
                  flexShrink: 0,
                  width: "56px", height: "40px",
                  borderRadius: "6px", overflow: "hidden",
                  border: idx === galleryIdx ? "2px solid #FF5C00" : "2px solid transparent",
                  cursor: "pointer", opacity: idx === galleryIdx ? 1 : 0.5, transition: "all 0.15s",
                  background: "#000",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {item.type === "video" ? (
                  <span style={{ fontSize: "18px" }}>▶</span>
                ) : (
                  <img src={item.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* SCROLLABLE CONTENT */}
        <div style={{ overflowY: "auto", flex: 1, padding: "16px 20px 28px" }}>

          {/* Description — collapsible */}
          {description && (
            <div style={{ marginBottom: "14px" }}>
              <p style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: "13px",
                fontFamily: "sans-serif",
                lineHeight: 1.6,
                margin: 0,
                display: "-webkit-box",
                WebkitLineClamp: descExpanded ? "unset" : 2,
                WebkitBoxOrient: "vertical",
                overflow: descExpanded ? "visible" : "hidden",
              }}>
                {description}
              </p>
              <button
                onClick={() => setDescExpanded(v => !v)}
                style={{ background: "none", border: "none", color: "#FF5C00", fontSize: "12px", fontWeight: 700, fontFamily: "sans-serif", cursor: "pointer", padding: "4px 0 0", letterSpacing: "0.3px" }}
              >
                {descExpanded ? "Zwiń ▲" : "Czytaj więcej ▼"}
              </button>
            </div>
          )}

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: prices.length > 0 ? "14px" : "16px" }}>
            <StatBox label="Długość" value={`${segment.meters}m`} />
            <StatBox label="Wymagany prąd" value={`⚡ ${segment.power}`} />
          </div>

          {/* Price table */}
          {prices.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", fontWeight: 700, letterSpacing: "1.2px", fontFamily: "sans-serif", marginBottom: "8px" }}>
                CENNIK (ZŁ NETTO)
              </div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${prices.length}, 1fr)`, gap: "6px" }}>
                {prices.map(({ h, v }) => (
                  <div
                    key={h}
                    onClick={() => onSelectHours && onSelectHours(selectedHours === h ? null : h)}
                    style={{
                      background: selectedHours === h ? "rgba(255,92,0,0.15)" : "rgba(255,255,255,0.04)",
                      border: selectedHours === h ? "1.5px solid #FF5C00" : "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "10px",
                      padding: "10px 6px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ color: selectedHours === h ? "#FF5C00" : "rgba(255,255,255,0.4)", fontSize: "10px", fontWeight: 700, fontFamily: "sans-serif", marginBottom: "4px" }}>{h}H</div>
                    <div style={{ color: selectedHours === h ? "#FF5C00" : "#fff", fontSize: "15px", fontWeight: 900, fontFamily: "'Arial Black', sans-serif" }}>{v} zł</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No prices fallback */}
          {prices.length === 0 && (
            <div style={{ marginBottom: "16px" }}>
              <StatBox label="Cena" value={segment.priceLabel || `od ${segment.price} zł`} orange />
            </div>
          )}

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
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "12px 14px" }}>
      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.8px", fontFamily: "sans-serif", marginBottom: "4px" }}>
        {label.toUpperCase()}
      </div>
      <div style={{ color: orange ? "#FF5C00" : "#fff", fontSize: "14px", fontWeight: 800, fontFamily: "'Arial Black', sans-serif" }}>
        {value}
      </div>
    </div>
  );
}
