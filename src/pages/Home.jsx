import { useState, useEffect, useRef } from "react";
import SpogleHeader from "../components/SpogleHeader";
import SegmentCard from "../components/SegmentCard";
import SetCard from "../components/SetCard";
import SetLightbox from "../components/SetLightbox";
import SummaryBar from "../components/SummaryBar";
import QuoteForm from "../components/QuoteForm";
import QuoteFormLightbox from "../components/QuoteFormLightbox";
import SegmentModal from "../components/SegmentModal";
import PhotoGallery from "../components/PhotoGallery";
import { track, trackCustom } from "../components/tracking";

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
];

// Preset sets — hardcoded prices
const PRESETS = [
  {
    id: "legia",
    name: "Set LEGIA",
    meters: 75,
    power: "40–45A",
    priceLabel: "od 2 897 zł",
    badge: "POPULARNY",
    badgeColor: "#1a6b2a",
    image: "https://www.spogle.pl/wp-content/uploads/2025/06/Tor-na-tle-legii.jpg",
    components: ["Tor 20m", "Tor 27m", "Tor 28m"],
    segmentIds: ["tor20", "tor27", "tor28"],
    slideIds: [],
  },
  {
    id: "tor4u",
    name: "Set Tor4U",
    meters: 95,
    power: "56–61A",
    priceLabel: "od 4 697 zł",
    badge: "POLECAMY",
    badgeColor: "#1a4a8a",
    image: "https://www.spogle.pl/wp-content/uploads/2025/06/tor-przeszkod-97m-1.jpg",
    components: ["Tor 20m", "Tor 27m", "Tor 28m", "Atomic Drop", "Zjeżdżalnia DUO"],
    segmentIds: ["tor20", "tor27", "tor28"],
    slideIds: ["atomic-drop", "duo"],
  },
  {
    id: "gigant",
    name: "Tor Gigant",
    meters: 128,
    power: "71–76A",
    priceLabel: "Wycena indywidualna",
    badge: "NAJWIĘKSZY W POLSCE",
    badgeColor: "#FF5C00",
    image: "https://www.spogle.pl/wp-content/uploads/2025/06/tor-przeszkod-97m-1.jpg",
    components: ["Tor 12m", "Tor 20m", "Tor 27m", "Tor 28m", "Atomic Drop", "Zjeżdżalnia DUO"],
    segmentIds: ["tor12", "tor20", "tor27", "tor28"],
    slideIds: ["atomic-drop", "duo"],
  },
];

// Giga segment (kept separately since it's now a preset)
const GIGA_SEGMENT = {
  id: "giga",
  name: "Giga Tor 108m",
  shortName: "Gigant (cały zestaw)",
  meters: 108,
  description: "Kompletny zestaw wszystkich segmentów — największy w Polsce",
  power: "10–15A",
  price: null,
  priceLabel: "Wycena indywidualna",
  icon: "giga",
};

const SLIDES = [
  {
    id: "atomic-drop",
    name: "Atomic Drop",
    shortName: "Giga zjeżdżalnia",
    meters: 11,
    description: "Gigantyczna dmuchana zjeżdżalnia, 11m dł × 7m wys. — dwa tory zjazdowe",
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
    meters: 9,
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
  const [selectedSlides, setSelectedSlides] = useState(new Set());
  const [activePreset, setActivePreset] = useState(null);
  const [presetLightbox, setPresetLightbox] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [modalSegment, setModalSegment] = useState(null);
  const isMobile = useMobile();
  const valueFired = useRef({ 2000: false, 4000: false });

  // A) ViewContent on mount
  useEffect(() => {
    track('ViewContent', { content_name: 'Tor Przeszkód Konfigurator' });
  }, []);

  // B) Scroll depth — 25%, 50%, 75%, 90%
  useEffect(() => {
    const fired = { 25: false, 50: false, 75: false, 90: false };
    const handleScroll = () => {
      const pct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      [25, 50, 75, 90].forEach(threshold => {
        if (!fired[threshold] && pct >= threshold) {
          fired[threshold] = true;
          trackCustom(`ScrollDepth${threshold}`);
        }
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // C) Time on page — 30s, 60s, 120s
  useEffect(() => {
    const t30 = setTimeout(() => trackCustom('TimeOnPage30s'), 30000);
    const t60 = setTimeout(() => trackCustom('TimeOnPage60s'), 60000);
    const t120 = setTimeout(() => trackCustom('TimeOnPage120s'), 120000);
    return () => [t30, t60, t120].forEach(clearTimeout);
  }, []);

  const selectedSegments = SEGMENTS.filter(s => selected.has(s.id));
  const selectedSlideItems = SLIDES.filter(s => selectedSlides.has(s.id));
  const hasSelection = selected.size > 0 || selectedSlides.size > 0;

  const activePresetData = activePreset ? PRESETS.find(p => p.id === activePreset) : null;

  const segmentMeters = selectedSegments.reduce((sum, s) => sum + s.meters, 0);
  const slideMeters = selectedSlideItems.reduce((sum, s) => sum + (s.meters || 0), 0);
  const totalMeters = activePresetData ? activePresetData.meters : segmentMeters + slideMeters;
  const totalPrice = selectedSegments.filter(s => s.price).reduce((sum, s) => sum + s.price, 0)
    + selectedSlideItems.filter(s => s.price).reduce((sum, s) => sum + s.price, 0);

  const powerValues = selectedSegments.map(s => {
    if (s.power.includes("–")) return 15;
    return parseInt(s.power);
  });
  const totalPower = activePresetData ? activePresetData.power : (powerValues.length > 0 ? powerValues.reduce((a, b) => a + b, 0) + "A" : "0A");

  const estimatedPrice = activePresetData
    ? activePresetData.priceLabel
    : totalPrice > 0
    ? `od ${totalPrice} zł`
    : "od 0 zł";

  const hasSelection2 = hasSelection || !!activePreset;

  // F) High-value threshold tracking — fire once per threshold
  useEffect(() => {
    if (totalPrice >= 4000 && !valueFired.current[4000]) {
      valueFired.current[4000] = true;
      trackCustom('ConfiguratorHighValue', { threshold: 4000 });
    } else if (totalPrice >= 2000 && !valueFired.current[2000]) {
      valueFired.current[2000] = true;
      trackCustom('ConfiguratorHighValue', { threshold: 2000 });
    }
  }, [totalPrice]);

  // E) Preset selection / deselection
  const applyPreset = (preset) => {
    if (activePreset !== preset.id) {
      trackCustom('PresetSelected', { preset_id: preset.id, meters: preset.meters, price_label: preset.priceLabel });
    } else {
      trackCustom('PresetDeselected', { preset_id: preset.id });
    }
    if (activePreset === preset.id) {
      setActivePreset(null);
      setSelected(new Set());
      setSelectedSlides(new Set());
    } else {
      setActivePreset(preset.id);
      setSelected(new Set(preset.segmentIds));
      setSelectedSlides(new Set(preset.slideIds));
    }
    setShowForm(false);
  };

  // D) Segment toggle — add AND remove
  const toggleSegment = (id) => {
    setActivePreset(null);
    const isAdding = !selected.has(id);
    trackCustom(isAdding ? 'SegmentSelected' : 'SegmentDeselected', { segment_id: id });
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setShowForm(false);
  };

  // D) Slide toggle — add AND remove
  const toggleSlide = (id) => {
    setActivePreset(null);
    const isAddingSlide = !selectedSlides.has(id);
    trackCustom(isAddingSlide ? 'SlideSelected' : 'SlideDeselected', { slide_id: id });
    setSelectedSlides(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setShowForm(false);
  };

  // H) Form open — InitiateCheckout + FormOpened
  const handleFormOpen = () => {
    setShowForm(prev => {
      if (!prev) {
        track('InitiateCheckout');
        trackCustom('FormOpened', { total_meters: totalMeters, estimated_price: estimatedPrice });
      }
      return !prev;
    });
  };

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
                fontSize: isMobile ? "64px" : "96px",
                fontWeight: 900,
                lineHeight: 0.95,
                letterSpacing: "-1px",
                color: "#fff",
                marginBottom: "24px",
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
                fontSize: "17px",
                lineHeight: 1.6,
                fontFamily: "sans-serif",
                marginBottom: "36px",
                maxWidth: "360px",
              }}
            >
              Wybierz segmenty, które chcesz połączyć.{" "}
              <span style={{ color: "rgba(255,255,255,0.7)" }}>Cena, metry i wymagany prąd liczą się na żywo.</span>
            </p>

            {/* CTA scroll button — mobile only */}
            {isMobile && (
              <button
                onClick={() => document.getElementById("segmenty")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#FF5C00",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "14px 22px",
                  fontSize: "15px",
                  fontWeight: 800,
                  fontFamily: "sans-serif",
                  cursor: "pointer",
                  marginBottom: "28px",
                  letterSpacing: "0.2px",
                  boxShadow: "0 4px 20px rgba(255,92,0,0.35)",
                }}
              >
                Wybierz segmenty
                <span style={{ fontSize: "18px", lineHeight: 1 }}>↓</span>
              </button>
            )}

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
            id="segmenty"
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
                  onOpenDetail={() => {
                    setModalSegment(segment);
                    trackCustom('SegmentDetailOpened', { segment_id: segment.id });
                  }}
                />
              ))}
            </div>

            {/* Slides section */}
            <div
              style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "2.5px",
                fontFamily: "sans-serif",
                marginBottom: "16px",
                marginTop: "28px",
              }}
            >
              DODAJ ZJEŻDŻALNIĘ (OPCJONALNIE)
            </div>
            <div className="segment-grid">
              {SLIDES.map(slide => (
                <SegmentCard
                  key={slide.id}
                  segment={slide}
                  selected={selectedSlides.has(slide.id)}
                  onToggle={() => toggleSlide(slide.id)}
                  onOpenDetail={() => {
                    setModalSegment(slide);
                    trackCustom('SegmentDetailOpened', { segment_id: slide.id });
                  }}
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

            {/* padding for fixed bottom bar */}
            <div style={{ height: "64px" }} />
          </div>
        </div>

      </div>

      {/* PRESET SETS — full width, outside hero */}
      <div style={{ background: "#0f0f0f", padding: isMobile ? "0 16px 48px" : "0 48px 64px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ marginBottom: "18px" }}>
            <div style={{ color: "#FF5C00", fontSize: "22px", fontWeight: 900, letterSpacing: "-0.3px", fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif", textTransform: "uppercase", marginBottom: "4px" }}>
              Lub wybierz gotowy set
            </div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", fontFamily: "sans-serif" }}>
              Kliknij zestaw aby automatycznie zaznaczyć wszystkie elementy
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "10px" }}>
            {PRESETS.map(preset => (
              <SetCard
                key={preset.id}
                set={preset}
                isActive={activePreset === preset.id}
                onSelect={() => applyPreset(preset)}
                onDetail={() => {
                  setPresetLightbox(preset);
                  trackCustom('SetDetailOpened', { preset_id: preset.id });
                }}
              />
            ))}
          </div>

          {presetLightbox && (
            <SetLightbox
              set={presetLightbox}
              isActive={activePreset === presetLightbox.id}
              onSelect={() => applyPreset(presetLightbox)}
              onClose={() => setPresetLightbox(null)}
            />
          )}

          {/* JAK WYBRAĆ? — after set cards */}
          <div style={{ marginTop: "32px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px" }}>
            <div style={{ background: "rgba(255,92,0,0.07)", border: "1px solid rgba(255,92,0,0.2)", borderRadius: "12px", padding: "18px 20px" }}>
              <div style={{ color: "#FF5C00", fontSize: "13px", fontWeight: 800, fontFamily: "sans-serif", letterSpacing: "0.5px", marginBottom: "8px" }}>
                GOTOWY SET — KIEDY?
              </div>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "13px", fontFamily: "sans-serif", lineHeight: 1.6, margin: 0 }}>
                Wybierz jeden z naszych sprawdzonych zestawów — idealne proporcje długości, atrakcyjności i kosztów dla typowego eventu.
              </p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "18px 20px" }}>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 800, fontFamily: "sans-serif", letterSpacing: "0.5px", marginBottom: "8px" }}>
                WŁASNA KONFIGURACJA — KIEDY?
              </div>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", fontFamily: "sans-serif", lineHeight: 1.6, margin: 0 }}>
                Masz specyficzną przestrzeń lub budżet? Dobierz segmenty samodzielnie — kalkulator przeliczy metraż i prąd na żywo.
              </p>
            </div>
          </div>

          {/* WIĘCEJ ATRAKCJI — na końcu */}
          <div style={{ marginTop: "16px", background: "rgba(255,92,0,0.06)", border: "1px solid rgba(255,92,0,0.18)", borderRadius: "12px", padding: "18px 20px" }}>
            <div style={{ color: "#FF5C00", fontSize: "13px", fontWeight: 800, fontFamily: "sans-serif", letterSpacing: "0.5px", marginBottom: "8px" }}>
              WIĘCEJ ATRAKCJI
            </div>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "13px", fontFamily: "sans-serif", lineHeight: 1.6, margin: 0 }}>
              Oferujemy też <strong style={{ color: "rgba(255,255,255,0.8)" }}>dmuchańce, zamki, piana party</strong> i inne atrakcje, które można łączyć z torem. Napisz o tym w polu komentarza przy zapytaniu.
            </p>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <PhotoGallery onAskAbout={() => {
        setShowForm(true);
      }} />

      {/* Quote Form Lightbox */}
      {showForm && (
        <QuoteFormLightbox
          initialSegments={selectedSegments}
          initialSlides={selectedSlideItems}
          totalMeters={totalMeters}
          estimatedPrice={estimatedPrice}
          totalPower={totalPower}
          onClose={() => setShowForm(false)}
          onSuccess={() => track('Lead')}
          onAbandoned={() => trackCustom('FormAbandoned')}
          SEGMENTS={SEGMENTS}
          SLIDES={SLIDES}
        />
      )}

      {/* Always-visible bottom bar */}
      <SummaryBar
        totalMeters={totalMeters}
        totalPower={totalPower}
        estimatedPrice={estimatedPrice}
        hasSelection={hasSelection2}
        onSubmit={handleFormOpen}
        isMobile={isMobile}
      />
    </div>
  );
}