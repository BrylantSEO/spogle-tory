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
        justifyContent: "space-between"
      }}>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src="https://www.spogle.pl/wp-content/webp-express/webp-images/uploads/2024/12/Spogle_logo.png.webp"
          alt="Spogle"
          style={{ height: "36px", width: "auto" }}
        />
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {/* Desktop: text number */}
        <a
          href="tel:+48573177098"
          onClick={() => {if (typeof window.fbq === 'function') window.fbq('trackCustom', 'PhoneClick');trackClick('PhoneClick', { source: 'header' });}}
          style={{
            color: "rgba(255,255,255,0.75)",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 500,
            letterSpacing: "0.3px",
            fontFamily: "sans-serif",
            display: isMobile ? "none" : "block"
          }}>

          +48 573 177 098
        </a>
        {/* Mobile: clickable phone number */}
        <a
          href="tel:+48573177098"
          onClick={() => {if (typeof window.fbq === 'function') window.fbq('trackCustom', 'PhoneClick');trackClick('PhoneClick', { source: 'header' });}}
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
            display: isMobile ? "flex" : "none",
            alignItems: "center",
            gap: "6px"
          }}>

          <Phone size={16} /> 573 177 098
        </a>
        {/* Desktop: Email */}
        <a
          href="mailto:kontakt@spogle.pl"
          style={{
            color: "rgba(255,255,255,0.65)",
            textDecoration: "none",
            fontSize: "13px",
            fontFamily: "sans-serif",
            letterSpacing: "0.2px",
            display: isMobile ? "none" : "block"
          }}>

          kontakt@spogle.pl
        </a>
        {/* Desktop: WhatsApp button */}
        























      </div>
    </header>);

}