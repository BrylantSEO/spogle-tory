import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const SEGMENT_IMAGES = {
  tor20: "https://www.spogle.pl/wp-content/uploads/2025/02/tor-przeszkod-20m-warszawa.jpg",
  tor27: "https://www.spogle.pl/wp-content/uploads/2025/02/tor-przeszkod-27m-warszawa.jpg",
  tor28: "https://www.spogle.pl/wp-content/uploads/2025/02/tor-przeszkod-28m-warszawa.jpg",
  giga: "https://www.spogle.pl/wp-content/uploads/2025/06/tor-przeszkod-97m-1.jpg",
};

export default function SegmentModal({ segment, onClose, onToggle, selected }) {
  const [dbData, setDbData] = useState(null);
  const [galleryIdx, setGalleryIdx] = useState(0);

  useEffect(() => {
    base44.entities.TrackSegment.filter({ segment_id: segment.id }).then(res => {
      if (res && res.length > 0) setDbData(res[0]);
    });
    setGalleryIdx(0);
  }, [segment.id]);

  const coverImg = dbData?.cover_image || segment.image || SEGMENT_IMAGES[segment.id] || null;
  const promoVideo = dbData?.promo_video_url ? toEmbedUrl(dbData.promo_video_url) : null;
  const galleryImages = dbData?.gallery_images?.length > 0 ? dbData.gallery_images : [coverImg];
  const description = dbData?.description || segment.description;
  const displayedImg = galleryImages[galleryIdx] || coverImg;

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
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
        backdropFilter: "blur(6px)",
        overflowY: "auto",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#141414",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "18px",
          maxWidth: "640px",
          width: "100%",
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
        }}
      >
        {/* Main image */}
        <div style={{ position: "relative" }}>
          <img
            src={displayedImg}
            alt={segment.name}
            style={{ width: "100%", height: "280px", objectFit: "cover", display: "block" }}
          />
          {/* gradient */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 60%, rgba(20,20,20,0.7) 100%)", pointerEvents: "none" }} />

          {/* Close */}
          <button
            onClick={onClose}
            style={{ position: "absolute", top: "14px", right: "14px", background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: "34px", height: "34px", color: "#fff", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >×</button>

          {segment.id === "giga" && (
            <div style={{ position: "absolute", top: "14px", left: "14px", background: "#FF5C00", color: "#fff", fontSize: "11px", fontWeight: 800, letterSpacing: "1.2px", padding: "4px 10px", borderRadius: "5px", fontFamily: "sans-serif" }}>
              NAJWIĘKSZY W POLSCE
            </div>
          )}

          {/* Gallery nav arrows */}
          {galleryImages.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); setGalleryIdx(i => (i - 1 + galleryImages.length) % galleryImages.length); }}
                style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.55)", border: "none", borderRadius: "50%", width: "34px", height: "34px", color: "#fff", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >‹</button>
              <button
                onClick={e => { e.stopPropagation(); setGalleryIdx(i => (i + 1) % galleryImages.length); }}
                style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.55)", border: "none", borderRadius: "50%", width: "34px", height: "34px", color: "#fff", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >›</button>
              <div style={{ position: "absolute", bottom: "10px", right: "14px", color: "rgba(255,255,255,0.5)", fontSize: "11px", fontFamily: "sans-serif" }}>
                {galleryIdx + 1} / {galleryImages.length}
              </div>
            </>
          )}
        </div>

        {/* Gallery thumbnails */}
        {galleryImages.length > 1 && (
          <div style={{ display: "flex", gap: "6px", padding: "10px 16px 0", overflowX: "auto" }}>
            {galleryImages.map((url, idx) => (
              <div
                key={idx}
                onClick={() => setGalleryIdx(idx)}
                style={{
                  flexShrink: 0,
                  width: "60px", height: "44px",
                  borderRadius: "6px", overflow: "hidden",
                  border: idx === galleryIdx ? "2px solid #FF5C00" : "2px solid transparent",
                  cursor: "pointer", opacity: idx === galleryIdx ? 1 : 0.55, transition: "all 0.15s",
                }}
              >
                <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div style={{ padding: "20px 24px 24px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
            <div>
              <h2 style={{ color: "#fff", fontSize: "24px", fontWeight: 900, fontFamily: "'Arial Black', sans-serif", letterSpacing: "-0.5px", margin: 0 }}>
                {segment.name}
              </h2>
              {description && (
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", fontFamily: "sans-serif", marginTop: "5px", lineHeight: 1.6 }}>
                  {description}
                </p>
              )}
            </div>
            <span style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", fontSize: "13px", fontWeight: 700, padding: "5px 12px", borderRadius: "6px", fontFamily: "sans-serif", whiteSpace: "nowrap", flexShrink: 0 }}>
              {segment.meters}m
            </span>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: prices.length > 0 ? "16px" : "20px" }}>
            <StatBox label="Długość" value={`${segment.meters}m`} />
            <StatBox label="Wymagany prąd" value={`⚡ ${segment.power}`} />
          </div>

          {/* Price table */}
          {prices.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", fontWeight: 700, letterSpacing: "1.2px", fontFamily: "sans-serif", marginBottom: "8px" }}>
                CENNIK (ZŁ NETTO)
              </div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${prices.length}, 1fr)`, gap: "8px" }}>
                {prices.map(({ h, v }) => (
                  <div key={h} style={{ background: "rgba(255,92,0,0.08)", border: "1px solid rgba(255,92,0,0.2)", borderRadius: "10px", padding: "10px 8px", textAlign: "center" }}>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", fontWeight: 700, fontFamily: "sans-serif", marginBottom: "4px" }}>{h}H</div>
                    <div style={{ color: "#FF5C00", fontSize: "15px", fontWeight: 900, fontFamily: "'Arial Black', sans-serif" }}>{v} zł</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No prices fallback */}
          {prices.length === 0 && (
            <div style={{ marginBottom: "20px" }}>
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