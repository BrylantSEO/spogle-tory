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
        }}
      >
        {selected && (
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path d="M1 4L4.2 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Icon + Name row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginTop: isGiga ? "28px" : "0",
        }}
      >
        {/* Shape icon */}
        <div style={{ flexShrink: 0 }}>
          <SegmentIcon type={segment.icon} selected={selected} />
        </div>

        <div style={{ flex: 1 }}>
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
        </div>
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

function SegmentIcon({ type, selected }) {
  const color = selected ? "#FF5C00" : "rgba(255,255,255,0.3)";

  if (type === "short") {
    return (
      <svg width="36" height="20" viewBox="0 0 36 20">
        <rect x="1" y="4" width="34" height="12" rx="4" fill={color} opacity="0.9" />
      </svg>
    );
  }
  if (type === "medium") {
    return (
      <svg width="44" height="20" viewBox="0 0 44 20">
        <rect x="1" y="4" width="42" height="12" rx="4" fill={color} opacity="0.9" />
      </svg>
    );
  }
  if (type === "lshape") {
    return (
      <svg width="36" height="30" viewBox="0 0 36 30">
        <rect x="1" y="1" width="18" height="10" rx="3" fill={color} opacity="0.9" />
        <rect x="1" y="9" width="10" height="20" rx="3" fill={color} opacity="0.9" />
      </svg>
    );
  }
  if (type === "large") {
    return (
      <svg width="52" height="20" viewBox="0 0 52 20">
        <rect x="1" y="4" width="50" height="12" rx="4" fill={color} opacity="0.9" />
      </svg>
    );
  }
  if (type === "giga") {
    return (
      <svg width="60" height="24" viewBox="0 0 60 24">
        <rect x="1" y="1" width="58" height="10" rx="3" fill={color} opacity="0.9" />
        <rect x="1" y="9" width="30" height="10" rx="3" fill={color} opacity="0.7" />
        <rect x="29" y="13" width="30" height="10" rx="3" fill={color} opacity="0.5" />
      </svg>
    );
  }
  return null;
}