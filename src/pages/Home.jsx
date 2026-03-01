import { useState, useEffect } from "react";
import SpogleHeader from "../components/SpogleHeader";
import SegmentCard from "../components/SegmentCard";
import SummaryBar from "../components/SummaryBar";
import QuoteForm from "../components/QuoteForm";
import SegmentModal from "../components/SegmentModal";
import PhotoGallery from "../components/PhotoGallery";

const SEGMENTS = [
  {
    id: "tor12",
    name: "Tor 12m",
    shortName: "Mały tor",
    meters: 12,
    description: "Idealna opcja na mniejsze eventy i place zabaw",
    power: "15A",
    price: 599,
    icon: "short",
  },
  {
    id: "tor20",
    name: "Tor 20m",
    shortName: "Średni tor",
    meters: 20,
    description: "Świetny wybór na festyny i firmowe pikniki",
    power: "15A",
    price: 799,
    icon: "medium",
  },
  {
    id: "tor27",
    name: "Tor 27m",
    shortName: "Tor z zakrętem",
    meters: 27,
    description: "Unikalny układ z zakrętem — idealna dla większych obszarów",
    power: "10–15A",
    price: 999,
    icon: "lshape",
  },
  {
    id: "tor28",
    name: "Tor 28m",
    shortName: "Duży tor",
    meters: 28,
    description: "Maksimum zabawy na dużych eventach plenerowych",
    power: "15A",
    price: 1099,
    icon: "large",
  },
  {
    id: "giga",
    name: "Giga Tor 108m",
    shortName: "Gigant (cały zestaw)",
    meters: 108,
    description: "Kompletny zestaw wszystkich segmentów — największy w Polsce",
    power: "10–15A",
    price: null,
    priceLabel: "Wycena indywidualna",
    icon: "giga",
  },
];

const SLIDES = [
  {
    id: "atomic-drop",
    name: "Atomic Drop",
    shortName: "Giga zjeżdżalnia",
    description: "Gigantyczna dmuchana zjeżdżalnia, 13m dł × 7m wys. — dwa tory zjazdowe",
    power: "8A",
    price: 1800,
    priceLabel: "od 1800 zł netto",
    badge: "NOWOŚĆ",
    image: "https://www.spogle.pl/wp-content/uploads/2025/02/IMG_1031-scaled.jpg",
  },
  {
    id: "duo",
    name: "Zjeżdżalnia DUO",
    shortName: "Giga DUO",
    description: "Ogromna zjeżdżalnia z dwoma torami jazdy i linami do wspinania, 9m dł × 6m wys.",
    power: "8A",
    price: 1800,
    priceLabel: "od 1800 zł netto",
    badge: "NOWOŚĆ",
    image: "https://www.spogle.pl/wp-content/uploads/2025/02/zjezdzalnia-dmuchana-duo.jpg",
  },
];

function useMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

export default function Home() {
  const [selected, setSelected] = useState(new Set());
  const [showForm, setShowForm] = useState(false);
  const [modalSegment, setModalSegment] = useState(null);
  const isMobile = useMobile();

  const toggleSegment = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (id === "giga") {
        if (next.has("giga")) {
          // deselect giga only
          next.delete("giga");
        } else {
          // select giga + all others
          SEGMENTS.forEach(s => next.add(s.id));
        }
      } else {
        if (next.has(id)) next.delete(id);
        else next.add(id);
      }
      return next;
    });
    setShowForm(false);
  };

  const selectedSegments = SEGMENTS.filter(s => selected.has(s.id));
  const hasGiga = selected.has("giga");
  const totalMeters = selectedSegments.reduce((sum, s) => sum + s.meters, 0);
  const totalPrice = selectedSegments.filter(s => s.price).reduce((sum, s) => sum + s.price, 0);

  const powerValues = selectedSegments.map(s => {
    if (s.power.includes("–")) return 15;
    return parseInt(s.power);
  });
  const totalPower = powerValues.length > 0 ? powerValues.reduce((a, b) => a + b, 0) + "A" : "0A";

  const estimatedPrice = hasGiga
    ? "Wycena indywidualna"
    : totalPrice > 0
    ? `od ${totalPrice} zł`
    : "od 0 zł";

  const hasSelection = selected.size > 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f0f",
        color: "#fff",
        fontFamily: "sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* Noise texture overlay */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0f0f0f; }

        .noise-bg {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 200px 200px;
        }

        .grid-lines {
          background-image: 
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        .segment-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        @media (max-width: 767px) {
          .segment-grid { grid-template-columns: 1fr; }
          .hero-grid { flex-direction: column !important; }
          .left-col { width: 100% !important; padding-right: 0 !important; padding-bottom: 20px !important; }
          .right-col { width: 100% !important; }
          .trust-badges { flex-wrap: wrap; }
          .form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <SpogleHeader />

      {/* Hero */}
      <div
        className="noise-bg grid-lines"
        style={{
          minHeight: "100vh",
          paddingTop: "64px",
          display: "flex",
          alignItems: "stretch",
        }}
      >
        <div
          className="hero-grid"
          style={{
            width: "100%",
            maxWidth: "1400px",
            margin: "0 auto",
            padding: isMobile ? "24px 16px 120px" : "40px 48px",
            display: "flex",
            gap: "0",
            alignItems: "flex-start",
          }}
        >
          {/* LEFT COLUMN */}
          <div
            className="left-col"
            style={{
              width: "38%",
              paddingRight: "56px",
              paddingTop: "20px",
              flexShrink: 0,
              position: "sticky",
              top: "84px",
            }}
          >
            {/* Label */}
            <div
              style={{
                color: "#FF5C00",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "2.5px",
                fontFamily: "sans-serif",
                marginBottom: "20px",
              }}
            >
              TORY PRZESZKÓD · WARSZAWA I OKOLICE
            </div>

            {/* Headline */}
            <h1
              style={{
                fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif",
                fontSize: isMobile ? "52px" : "72px",
                fontWeight: 900,
                lineHeight: 0.95,
                letterSpacing: "-1px",
                color: "#fff",
                marginBottom: "20px",
                textTransform: "uppercase",
              }}
            >
              Zbuduj swój<br />
              <span style={{ color: "#FF5C00" }}>tor</span><br />
              przeszkód
            </h1>

            {/* Subline */}
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "15px",
                lineHeight: 1.6,
                fontFamily: "sans-serif",
                marginBottom: "36px",
                maxWidth: "340px",
              }}
            >
              Wybierz segmenty, które chcesz połączyć.{" "}
              <span style={{ color: "rgba(255,255,255,0.7)" }}>Cena, metry i wymagany prąd liczą się na żywo.</span>
            </p>

            {/* Trust badges */}
            <div
              className="trust-badges"
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              {["500+ eventów", "Montaż w cenie", "Własny transport"].map(badge => (
                <div
                  key={badge}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    padding: "8px 14px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.65)",
                    fontFamily: "sans-serif",
                    letterSpacing: "0.2px",
                    whiteSpace: "nowrap",
                  }}
                >
                  ✓ {badge}
                </div>
              ))}
            </div>

            {/* Decorative line accent */}
            <div
              style={{
                marginTop: "48px",
                width: "60px",
                height: "3px",
                background: "#FF5C00",
                borderRadius: "2px",
                opacity: 0.5,
              }}
            />
          </div>

          {/* RIGHT COLUMN — CONFIGURATOR */}
          <div
            className="right-col"
            style={{
              flex: 1,
              minWidth: 0,
            }}
          >
            {/* Section label */}
            <div
              style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "2.5px",
                fontFamily: "sans-serif",
                marginBottom: "16px",
                paddingTop: "24px",
              }}
            >
              WYBIERZ SEGMENTY TORU
            </div>

            {/* Cards grid */}
            <div className="segment-grid">
              {SEGMENTS.map(segment => (
                <SegmentCard
                  key={segment.id}
                  segment={segment}
                  selected={selected.has(segment.id)}
                  onToggle={() => toggleSegment(segment.id)}
                  onOpenDetail={() => setModalSegment(segment)}
                />
              ))}
            </div>

            {/* Modal */}
            {modalSegment && (
              <SegmentModal
                segment={modalSegment}
                selected={selected.has(modalSegment.id)}
                onToggle={() => toggleSegment(modalSegment.id)}
                onClose={() => setModalSegment(null)}
              />
            )}

            {/* Summary bar */}
            {!isMobile && (
              <SummaryBar
                totalMeters={totalMeters}
                totalPower={totalPower}
                estimatedPrice={estimatedPrice}
                hasSelection={hasSelection}
                onSubmit={() => setShowForm(v => !v)}
                isMobile={false}
              />
            )}

            {/* Inline form */}
            {showForm && !isMobile && (
              <QuoteForm
                selectedSegments={selectedSegments}
                totalMeters={totalMeters}
                estimatedPrice={estimatedPrice}
                totalPower={totalPower}
                onClose={() => setShowForm(false)}
              />
            )}

            {/* Mobile: form above bottom bar */}
            {isMobile && showForm && (
              <QuoteForm
                selectedSegments={selectedSegments}
                totalMeters={totalMeters}
                estimatedPrice={estimatedPrice}
                totalPower={totalPower}
                onClose={() => setShowForm(false)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Gallery */}
      <PhotoGallery />

      {/* Mobile sticky bottom bar */}
      {isMobile && (
        <SummaryBar
          totalMeters={totalMeters}
          totalPower={totalPower}
          estimatedPrice={estimatedPrice}
          hasSelection={hasSelection}
          onSubmit={() => setShowForm(v => !v)}
          isMobile={true}
        />
      )}
    </div>
  );
}