export default function SegmentCard({ segment, selected, onToggle }) {
  const isGiga = segment.id === "giga";

  return (
    <div
      onClick={onToggle}
      style={{
        position: "relative",
        background: isGiga
          ? selected
            ? "rgba(255,92,0,0.12)"
            : "rgba(255,255,255,0.04)"
          : selected
          ? "rgba(255,92,0,0.08)"
          : "rgba(255,255,255,0.03)",
        border: selected
          ? "1.5px solid #FF5C00"
          : isGiga
          ? "1.5px solid rgba(255,255,255,0.12)"
          : "1.5px solid rgba(255,255,255,0.07)",
        borderRadius: "12px",
        padding: isGiga ? "18px 20px" : "14px 16px",
        cursor: "pointer",
        transition: "all 0.18s ease",
        boxShadow: selected
          ? "0 0 0 1px #FF5C00, 0 4px 24px rgba(255,92,0,0.15)"
          : "none",
        gridColumn: isGiga ? "1 / -1" : undefined,
        userSelect: "none",
        overflow: "hidden",
      }}
    >
      {/* Giga badge */}
      {isGiga && (
        <div
          style={{
            position: "absolute",
            top: "14px",
            left: "16px",
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
          top: isGiga ? "14px" : "12px",
          right: "14px",
          width: "20px",
          height: "20px",
          borderRadius: "5px",
          border: selected ? "none" : "2px solid rgba(255,255,255,0.25)",
          background: selected ? "#FF5C00" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s ease",
          flexShrink: 0,
          zIndex: 2,
        }}
      >
        {selected && (
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path d="M1 4L4.2 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Visual illustration */}
      <div
        style={{
          marginTop: isGiga ? "32px" : "0",
          marginBottom: "12px",
          display: "flex",
          justifyContent: isGiga ? "center" : "flex-start",
          opacity: selected ? 1 : 0.6,
          transition: "opacity 0.2s",
        }}
      >
        <ObstacleIllustration type={segment.id} selected={selected} />
      </div>

      {/* Name + meters */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
        <span
          style={{
            color: "#fff",
            fontSize: isGiga ? "17px" : "15px",
            fontWeight: 800,
            fontFamily: "'Arial Black', Arial, sans-serif",
            letterSpacing: "-0.3px",
            lineHeight: 1.2,
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
            letterSpacing: "0.3px",
          }}
        >
          {segment.meters}m
        </span>
      </div>

      <div
        style={{
          color: "rgba(255,255,255,0.45)",
          fontSize: "12px",
          marginTop: "3px",
          fontFamily: "sans-serif",
          lineHeight: 1.4,
        }}
      >
        {segment.description}
      </div>

      {/* Bottom row: power + price */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "10px",
        }}
      >
        <span
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: "12px",
            fontFamily: "sans-serif",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          ⚡ {segment.power}
        </span>
        <span
          style={{
            color: segment.priceLabel ? "#FF5C00" : selected ? "#FF5C00" : "rgba(255,255,255,0.7)",
            fontSize: isGiga ? "15px" : "14px",
            fontWeight: 700,
            fontFamily: "'Arial Black', sans-serif",
            transition: "color 0.15s",
          }}
        >
          {segment.priceLabel || `od ${segment.price} zł`}
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Obstacle course SVG illustrations
   Inspired by inflatable obstacle course look:
   grey base, yellow/orange arches, pillars, obstacles
───────────────────────────────────────── */
function ObstacleIllustration({ type, selected }) {
  const accent = selected ? "#FF5C00" : "#E8C040";
  const base = selected ? "rgba(255,92,0,0.25)" : "rgba(160,160,160,0.2)";
  const dark = selected ? "rgba(255,92,0,0.15)" : "rgba(80,80,80,0.4)";
  const pillar = selected ? "rgba(255,130,30,0.8)" : "rgba(180,180,180,0.6)";

  if (type === "tor12") {
    // Short course: 2 arches, simple
    return (
      <svg width="120" height="52" viewBox="0 0 120 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* base platform */}
        <rect x="2" y="36" width="116" height="14" rx="4" fill={base} />
        {/* left arch */}
        <rect x="12" y="16" width="8" height="22" rx="3" fill={pillar} />
        <rect x="38" y="16" width="8" height="22" rx="3" fill={pillar} />
        <path d="M12 18 Q29 4 46 18" stroke={accent} strokeWidth="7" fill="none" strokeLinecap="round" />
        {/* right arch */}
        <rect x="72" y="16" width="8" height="22" rx="3" fill={pillar} />
        <rect x="98" y="16" width="8" height="22" rx="3" fill={pillar} />
        <path d="M72 18 Q89 4 106 18" stroke={accent} strokeWidth="7" fill="none" strokeLinecap="round" />
        {/* X obstacles */}
        <line x1="18" y1="22" x2="36" y2="36" stroke={accent} strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        <line x1="36" y1="22" x2="18" y2="36" stroke={accent} strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        <line x1="78" y1="22" x2="96" y2="36" stroke={accent} strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        <line x1="96" y1="22" x2="78" y2="36" stroke={accent} strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        {/* floor segments lines */}
        <line x1="58" y1="37" x2="58" y2="49" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
      </svg>
    );
  }

  if (type === "tor20") {
    // Medium: 3 arches
    return (
      <svg width="160" height="52" viewBox="0 0 160 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="36" width="156" height="14" rx="4" fill={base} />
        {/* arch 1 */}
        <rect x="8" y="14" width="7" height="24" rx="3" fill={pillar} />
        <rect x="38" y="14" width="7" height="24" rx="3" fill={pillar} />
        <path d="M8 16 Q26 2 45 16" stroke={accent} strokeWidth="7" fill="none" strokeLinecap="round" />
        <line x1="10" y1="18" x2="42" y2="36" stroke={accent} strokeWidth="3.5" strokeLinecap="round" opacity="0.7" />
        <line x1="42" y1="18" x2="10" y2="36" stroke={accent} strokeWidth="3.5" strokeLinecap="round" opacity="0.7" />
        {/* arch 2 */}
        <rect x="62" y="14" width="7" height="24" rx="3" fill={pillar} />
        <rect x="92" y="14" width="7" height="24" rx="3" fill={pillar} />
        <path d="M62 16 Q80 2 99 16" stroke={accent} strokeWidth="7" fill="none" strokeLinecap="round" />
        {/* slide ramp in middle */}
        <polygon points="62,36 92,20 92,36" fill={dark} opacity="0.9" />
        <line x1="62" y1="36" x2="92" y2="20" stroke={accent} strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
        {/* arch 3 */}
        <rect x="116" y="14" width="7" height="24" rx="3" fill={pillar} />
        <rect x="148" y="14" width="7" height="24" rx="3" fill={pillar} />
        <path d="M116 16 Q134 2 155 16" stroke={accent} strokeWidth="7" fill="none" strokeLinecap="round" />
        <line x1="118" y1="18" x2="150" y2="36" stroke={accent} strokeWidth="3.5" strokeLinecap="round" opacity="0.7" />
        <line x1="150" y1="18" x2="118" y2="36" stroke={accent} strokeWidth="3.5" strokeLinecap="round" opacity="0.7" />
        {/* dividers */}
        <line x1="54" y1="37" x2="54" y2="49" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
        <line x1="108" y1="37" x2="108" y2="49" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
      </svg>
    );
  }

  if (type === "tor27") {
    // L-shape: straight section + turn indicator
    return (
      <svg width="160" height="72" viewBox="0 0 160 72" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* horizontal section */}
        <rect x="2" y="36" width="100" height="14" rx="4" fill={base} />
        {/* vertical section (turn) */}
        <rect x="2" y="36" width="18" height="32" rx="4" fill={base} />
        {/* arch 1 */}
        <rect x="12" y="14" width="7" height="24" rx="3" fill={pillar} />
        <rect x="42" y="14" width="7" height="24" rx="3" fill={pillar} />
        <path d="M12 16 Q30 2 49 16" stroke={accent} strokeWidth="7" fill="none" strokeLinecap="round" />
        <line x1="14" y1="18" x2="46" y2="36" stroke={accent} strokeWidth="3.5" strokeLinecap="round" opacity="0.7" />
        <line x1="46" y1="18" x2="14" y2="36" stroke={accent} strokeWidth="3.5" strokeLinecap="round" opacity="0.7" />
        {/* arch 2 */}
        <rect x="64" y="14" width="7" height="24" rx="3" fill={pillar} />
        <rect x="92" y="14" width="7" height="24" rx="3" fill={pillar} />
        <path d="M64 16 Q82 2 99 16" stroke={accent} strokeWidth="7" fill="none" strokeLinecap="round" />
        <line x1="66" y1="18" x2="97" y2="36" stroke={accent} strokeWidth="3.5" strokeLinecap="round" opacity="0.7" />
        {/* turn arrow */}
        <path d="M11 50 Q2 52 4 62" stroke={accent} strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="4 3" />
        <polygon points="4,62 10,56 0,56" fill={accent} opacity="0.8" />
        {/* turn base bottom */}
        <rect x="2" y="56" width="18" height="12" rx="3" fill={dark} />
        {/* turn label */}
        <text x="70" y="62" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="sans-serif" textAnchor="middle">z zakrętem</text>
      </svg>
    );
  }

  if (type === "tor28") {
    // Large: 4 arches + big slide
    return (
      <svg width="190" height="52" viewBox="0 0 190 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="36" width="186" height="14" rx="4" fill={base} />
        {/* arch 1 */}
        <rect x="6" y="14" width="6" height="24" rx="3" fill={pillar} />
        <rect x="32" y="14" width="6" height="24" rx="3" fill={pillar} />
        <path d="M6 16 Q22 2 38 16" stroke={accent} strokeWidth="6" fill="none" strokeLinecap="round" />
        <line x1="8" y1="18" x2="36" y2="36" stroke={accent} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        <line x1="36" y1="18" x2="8" y2="36" stroke={accent} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        {/* arch 2 */}
        <rect x="52" y="14" width="6" height="24" rx="3" fill={pillar} />
        <rect x="80" y="14" width="6" height="24" rx="3" fill={pillar} />
        <path d="M52 16 Q68 2 86 16" stroke={accent} strokeWidth="6" fill="none" strokeLinecap="round" />
        {/* big slide in middle */}
        <polygon points="52,36 86,12 86,36" fill={dark} />
        <line x1="52" y1="36" x2="86" y2="12" stroke={accent} strokeWidth="3" strokeLinecap="round" />
        {/* arch 3 */}
        <rect x="106" y="14" width="6" height="24" rx="3" fill={pillar} />
        <rect x="134" y="14" width="6" height="24" rx="3" fill={pillar} />
        <path d="M106 16 Q122 2 140 16" stroke={accent} strokeWidth="6" fill="none" strokeLinecap="round" />
        <line x1="108" y1="18" x2="138" y2="36" stroke={accent} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        <line x1="138" y1="18" x2="108" y2="36" stroke={accent} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        {/* arch 4 */}
        <rect x="154" y="14" width="6" height="24" rx="3" fill={pillar} />
        <rect x="182" y="14" width="6" height="24" rx="3" fill={pillar} />
        <path d="M154 16 Q170 2 188 16" stroke={accent} strokeWidth="6" fill="none" strokeLinecap="round" />
        <line x1="156" y1="18" x2="186" y2="36" stroke={accent} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        {/* dividers */}
        <line x1="46" y1="37" x2="46" y2="49" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
        <line x1="100" y1="37" x2="100" y2="49" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
        <line x1="148" y1="37" x2="148" y2="49" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
      </svg>
    );
  }

  if (type === "giga") {
    // Giga: full wide multi-section panoramic view
    return (
      <svg width="100%" height="60" viewBox="0 0 400 60" preserveAspectRatio="xMidYMid meet" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* base platform — two rows joined */}
        <rect x="2" y="40" width="260" height="14" rx="4" fill={base} />
        <rect x="2" y="40" width="20" height="16" rx="4" fill={base} />
        <rect x="2" y="52" width="100" height="8" rx="3" fill={dark} />
        <rect x="140" y="52" width="122" height="8" rx="3" fill={dark} />

        {/* Section 1 arches */}
        <rect x="10" y="18" width="6" height="24" rx="3" fill={pillar} />
        <rect x="36" y="18" width="6" height="24" rx="3" fill={pillar} />
        <path d="M10 20 Q26 6 42 20" stroke={accent} strokeWidth="6" fill="none" strokeLinecap="round" />
        <line x1="12" y1="22" x2="40" y2="40" stroke={accent} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        <line x1="40" y1="22" x2="12" y2="40" stroke={accent} strokeWidth="3" strokeLinecap="round" opacity="0.7" />

        {/* Section 2 arches */}
        <rect x="56" y="18" width="6" height="24" rx="3" fill={pillar} />
        <rect x="84" y="18" width="6" height="24" rx="3" fill={pillar} />
        <path d="M56 20 Q72 6 90 20" stroke={accent} strokeWidth="6" fill="none" strokeLinecap="round" />
        <polygon points="56,40 90,20 90,40" fill={dark} />
        <line x1="56" y1="40" x2="90" y2="20" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />

        {/* Section 3 */}
        <rect x="106" y="18" width="6" height="24" rx="3" fill={pillar} />
        <rect x="130" y="18" width="6" height="24" rx="3" fill={pillar} />
        <path d="M106 20 Q120 6 136 20" stroke={accent} strokeWidth="6" fill="none" strokeLinecap="round" />
        <line x1="108" y1="22" x2="134" y2="40" stroke={accent} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        <line x1="134" y1="22" x2="108" y2="40" stroke={accent} strokeWidth="3" strokeLinecap="round" opacity="0.7" />

        {/* Turn connector */}
        <path d="M2 52 Q2 60 12 60" stroke={accent} strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="4 3" />

        {/* Second row (below main) */}
        <rect x="158" y="18" width="6" height="24" rx="3" fill={pillar} />
        <rect x="186" y="18" width="6" height="24" rx="3" fill={pillar} />
        <path d="M158 20 Q174 6 192 20" stroke={accent} strokeWidth="6" fill="none" strokeLinecap="round" />
        <line x1="160" y1="22" x2="190" y2="40" stroke={accent} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        <line x1="190" y1="22" x2="160" y2="40" stroke={accent} strokeWidth="3" strokeLinecap="round" opacity="0.7" />

        <rect x="210" y="18" width="6" height="24" rx="3" fill={pillar} />
        <rect x="238" y="18" width="6" height="24" rx="3" fill={pillar} />
        <path d="M210 20 Q226 6 244 20" stroke={accent} strokeWidth="6" fill="none" strokeLinecap="round" />
        <polygon points="210,40 244,18 244,40" fill={dark} />
        <line x1="210" y1="40" x2="244" y2="18" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />

        {/* Dividers */}
        <line x1="50" y1="41" x2="50" y2="53" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
        <line x1="100" y1="41" x2="100" y2="53" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
        <line x1="152" y1="41" x2="152" y2="53" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
        <line x1="204" y1="41" x2="204" y2="53" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

        {/* "108m" label */}
        <text x="310" y="35" fill={accent} fontSize="22" fontWeight="900" fontFamily="Arial Black, sans-serif" opacity="0.35">108m</text>
      </svg>
    );
  }

  return null;
}