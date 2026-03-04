import { trackClick } from "./internalTracker";
import { Phone } from "lucide-react";
import { useState, useEffect } from "react";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

export default function SpogleHeader() {
  const isMobile = useIsMobile();
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "rgba(15,15,15,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        height: "64px",
        display: "flex",
        alignItems: "center",
        padding: "0 32px",
        justifyContent: "space-between",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "32px",
            height: "32px",
            background: "#FF5C00",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "#fff", fontWeight: 900, fontSize: "16px", fontFamily: "sans-serif" }}>S</span>
        </div>
        <span
          style={{
            color: "#fff",
            fontWeight: 800,
            fontSize: "20px",
            letterSpacing: "-0.5px",
            fontFamily: "'Arial Black', sans-serif",
          }}
        >
          SPOGLE
        </span>
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {/* Desktop: text number */}
        <a
          href="tel:+48573177098"
          onClick={() => { if (typeof window.fbq === 'function') window.fbq('trackCustom', 'PhoneClick'); trackClick('PhoneClick', { source: 'header' }); }}
          style={{
            color: "rgba(255,255,255,0.75)",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 500,
            letterSpacing: "0.3px",
            fontFamily: "sans-serif",
            display: isMobile ? "none" : "block",
          }}
        >
          +48 573 177 098
        </a>
        {/* Mobile: phone icon */}
        <a
          href="tel:+48573177098"
          onClick={() => { if (typeof window.fbq === 'function') window.fbq('trackCustom', 'PhoneClick'); trackClick('PhoneClick', { source: 'header' }); }}
          style={{
            color: "#fff",
            display: isMobile ? "flex" : "none",
            alignItems: "center",
            marginRight: "8px",
          }}
        >
          <Phone size={24} />
        </a>
        <a
          href="https://wa.me/48573177098"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => { if (typeof window.fbq === 'function') window.fbq('trackCustom', 'WhatsAppClick'); trackClick('WhatsAppClick', { source: 'header' }); }}
          style={{
            background: "#FF5C00",
            color: "#fff",
            padding: "8px 18px",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "13px",
            textDecoration: "none",
            fontFamily: "sans-serif",
            letterSpacing: "0.2px",
            whiteSpace: "nowrap",
            transition: "background 0.2s",
          }}
          onMouseEnter={e => (e.target.style.background = "#e05200")}
          onMouseLeave={e => (e.target.style.background = "#FF5C00")}
        >
          Zapytaj na WhatsApp
        </a>
      </div>
    </header>
  );
}