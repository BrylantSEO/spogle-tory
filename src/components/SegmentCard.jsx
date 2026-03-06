import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const FALLBACK_IMAGES = {
  tor12: "https://www.spogle.pl/wp-content/uploads/2025/02/tor-przeszkod-12m-warszawa.jpg",
  tor20: "https://www.spogle.pl/wp-content/uploads/2025/02/tor-przeszkod-20m-warszawa.jpg",
  tor27: "https://www.spogle.pl/wp-content/uploads/2025/02/tor-przeszkod-27m-warszawa.jpg",
  tor28: "https://www.spogle.pl/wp-content/uploads/2025/02/tor-przeszkod-28m-warszawa.jpg",
  giga: "https://www.spogle.pl/wp-content/uploads/2025/06/tor-przeszkod-97m-1.jpg",
};

export default function SegmentCard({ segment, selected, onToggle, onOpenDetail }) {
  const isGiga = segment.id === "giga";
  const [coverImage, setCoverImage] = useState(segment.image || FALLBACK_IMAGES[segment.id] || null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    base44.entities.TrackSegment.filter({ segment_id: segment.id }).then(results => {
      if (results && results.length > 0 && results[0].cover_image) {
        setCoverImage(results[0].cover_image);
      }
    });
  }, [segment.id]);

  const imgSrc = coverImage;

  return (
    <div
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: isGiga
          ? selected ? "rgba(255,92,0,0.12)" : hovered ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)"
          : selected ? "rgba(255,92,0,0.08)" : hovered ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
        border: selected
          ? "1.5px solid #FF5C00"
          : hovered
          ? "1.5px solid rgba(255,255,255,0.28)"
          : isGiga
          ? "1.5px solid rgba(255,255,255,0.12)"
          : "1.5px solid rgba(255,255,255,0.07)",
        borderRadius: "12px",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.18s ease",
        boxShadow: selected
          ? "0 0 0 1px #FF5C00, 0 4px 24px rgba(255,92,0,0.15)"
          : hovered
          ? "0 4px 16px rgba(0,0,0,0.3)"
          : "none",
        gridColumn: isGiga ? "1 / -1" : undefined,
        userSelect: "none",
      }}
    >
      {/* Photo */}
      <div style={{ position: "relative", height: isGiga ? "160px" : "110px", overflow: "hidden" }}>
        <img
          src={imgSrc}
          alt={segment.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            filter: selected ? "brightness(1)" : hovered ? "brightness(0.8)" : "brightness(0.65)",
            transition: "filter 0.2s",
          }}
        />
        {/* Orange overlay tint when selected */}
        {selected && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(255,92,0,0.12)",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Giga badge */}
        {isGiga && (
          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              background: "#FF5C00",
              color: "#fff",
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "1.2px",
              padding: "3px 8px",
              borderRadius: "4px",
              fontFamily: "sans-serif",
            }}
          >
            NAJWIĘKSZY W POLSCE
          </div>
        )}

        {/* Checkbox */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            width: "22px",
            height: "22px",
            borderRadius: "5px",
            border: selected ? "none" : "2px solid rgba(255,255,255,0.4)",
            background: selected ? "#FF5C00" : "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s ease",
          }}
        >
          {selected && (
            <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
              <path d="M1 4L4.2 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        {/* "Szczegóły" button */}
        <button
          onClick={e => { e.stopPropagation(); onOpenDetail(); }}
          style={{
            position: "absolute",
            bottom: "8px",
            right: "8px",
            background: "rgba(0,0,0,0.6)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "6px",
            color: "rgba(255,255,255,0.8)",
            fontSize: "11px",
            fontFamily: "sans-serif",
            fontWeight: 600,
            padding: "4px 10px",
            cursor: "pointer",
            letterSpacing: "0.3px",
            backdropFilter: "blur(4px)",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.target.style.background = "rgba(255,92,0,0.7)"; e.target.style.color = "#fff"; }}
          onMouseLeave={e => { e.target.style.background = "rgba(0,0,0,0.6)"; e.target.style.color = "rgba(255,255,255,0.8)"; }}
        >
          Szczegóły ↗
        </button>
      </div>

      {/* Text content */}
      <div style={{ padding: "12px 14px 14px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
          <span
            style={{
              color: "#fff",
              fontSize: isGiga ? "16px" : "14px",
              fontWeight: 800,
              fontFamily: "'Arial Black', Arial, sans-serif",
              letterSpacing: "-0.3px",
            }}
          >
            {segment.name}
          </span>
          <span
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.6)",
              fontSize: "11px",
              fontWeight: 600,
              padding: "2px 7px",
              borderRadius: "4px",
              fontFamily: "sans-serif",
            }}
          >
            {segment.meters}m
          </span>
        </div>

        <div
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: "11px",
            marginTop: "3px",
            fontFamily: "sans-serif",
            lineHeight: 1.4,
          }}
        >
          {segment.description}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "10px",
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", fontFamily: "sans-serif" }}>
            ⚡ {segment.power}
          </span>
          <span
            style={{
              color: segment.priceLabel ? "#FF5C00" : selected ? "#FF5C00" : "rgba(255,255,255,0.7)",
              fontSize: isGiga ? "14px" : "13px",
              fontWeight: 700,
              fontFamily: "'Arial Black', sans-serif",
              transition: "color 0.15s",
            }}
          >
            {segment.priceLabel || `od ${segment.price} zł`}
          </span>
        </div>
      </div>
    </div>
  );
}