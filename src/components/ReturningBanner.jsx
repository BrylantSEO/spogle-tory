import { useState } from "react";
import { X } from "lucide-react";
import { DISCOUNT_CODE, hadFormOpened } from "./returningVisitor";

export default function ReturningBanner({ lastSegmentNames, onRestoreSelection }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const hasLastSegments = lastSegmentNames && lastSegmentNames.length > 0;
  const showDiscount = hadFormOpened();

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(255,92,0,0.15), rgba(255,92,0,0.05))",
      border: "1.5px solid rgba(255,92,0,0.3)",
      borderRadius: "14px",
      padding: "20px 24px",
      marginBottom: "20px",
      position: "relative",
    }}>
      <button
        onClick={() => setDismissed(true)}
        style={{
          position: "absolute", top: "12px", right: "12px",
          background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%",
          width: "28px", height: "28px", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <X size={14} color="rgba(255,255,255,0.5)" />
      </button>

      <div style={{ fontSize: "18px", fontWeight: 900, color: "#FF5C00", fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif", marginBottom: "6px" }}>
        👋 Witaj ponownie!
      </div>

      <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", fontFamily: "sans-serif", lineHeight: 1.5, marginBottom: hasLastSegments ? "14px" : "0" }}>
        Cieszmy się, że wracasz. 
        {showDiscount && (
          <span>
            {" "}Mamy dla Ciebie kod zniżkowy <strong style={{ color: "#FF5C00" }}>{DISCOUNT_CODE}</strong> — podaj go w zapytaniu!
          </span>
        )}
      </div>

      {hasLastSegments && (
        <div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", fontFamily: "sans-serif", marginBottom: "8px" }}>
            OSTATNIO OGLĄDAŁEŚ
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
            {lastSegmentNames.map(name => (
              <span key={name} style={{
                background: "rgba(255,92,0,0.12)",
                border: "1px solid rgba(255,92,0,0.25)",
                borderRadius: "6px",
                padding: "4px 10px",
                color: "#FF5C00",
                fontSize: "12px",
                fontWeight: 700,
                fontFamily: "sans-serif",
              }}>
                {name}
              </span>
            ))}
          </div>
          <button
            onClick={onRestoreSelection}
            style={{
              background: "#FF5C00",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 18px",
              fontSize: "13px",
              fontWeight: 800,
              fontFamily: "sans-serif",
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            Przywróć wybór →
          </button>
        </div>
      )}
    </div>
  );
}