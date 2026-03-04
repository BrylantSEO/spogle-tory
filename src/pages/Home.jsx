import { useState, useEffect, useRef } from "react";
import { MousePointer, Calculator, MessageSquare } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { initSession, trackClick, session as trackerSession } from "../components/internalTracker";
import SpogleHeader from "../components/SpogleHeader";
import SegmentCard from "../components/SegmentCard";
import SetCard from "../components/SetCard";
import SetLightbox from "../components/SetLightbox";
import SummaryBar from "../components/SummaryBar";
import QuoteForm from "../components/QuoteForm";
import QuoteFormLightbox from "../components/QuoteFormLightbox";
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
    price: 1200,
    icon: "short",
  },
  {
    id: "tor20",
    name: "Tor 20m",
    shortName: "Średni tor",
    meters: 20,
    description: "Świetny wybór na festyny i firmowe pikniki",
    power: "15A",
    price: 1700,
    icon: "medium",
  },
  {
    id: "tor27",
    name: "Tor 27m",
    shortName: "Tor z zakrętem",
    meters: 27,
    description: "Unikalny układ z zakrętem — idealna dla większych obszarów",
    power: "10–15A",
    price: 2200,
    icon: "lshape",
  },
  {
    id: "tor28",
    name: "Tor 28m",
    shortName: "Duży tor",
    meters: 28,
    description: "Maksimum zabawy na dużych eventach plenerowych",
    power: "15A",
    price: 2700,
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

function fbq(...args) {
  if (typeof window.fbq === 'function' && !window.__spogle_is_bot) window.fbq(...args);
}

export default function Home() {
  const [selected, setSelected] = useState(new Set());
  const [selectedSlides, setSelectedSlides] = useState(new Set());
  const [activePreset, setActivePreset] = useState(null);
  const [presetData, setPresetData] = useState({});
  const [presetLightbox, setPresetLightbox] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [modalSegment, setModalSegment] = useState(null);
  const isMobile = useMobile();
  const firedScrollRef = useRef(new Set());
  const firedValueRef = useRef(new Set());

  // Init session + ViewContent on mount
  useEffect(() => {
    initSession();
    fbq('track', 'ViewContent', { content_name: 'Tor Przeszkód Konfigurator' });
    // Load preset overrides from DB
    base44.entities.PresetSet.list().then(data => {
      const map = {};
      data.forEach(p => { map[p.set_id] = p; });
      setPresetData(map);
    });
  }, []);

  // Scroll depth
  useEffect(() => {
    const thresholds = [25, 50, 75, 90];
    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      const pct = (scrolled / total) * 100;
      thresholds.forEach(t => {
        if (pct >= t && !firedScrollRef.current.has(t)) {
          firedScrollRef.current.add(t);
          fbq('trackCustom', `ScrollDepth${t}`);
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Time on page
  useEffect(() => {
    const t1 = setTimeout(() => fbq('trackCustom', 'TimeOnPage30s'), 30000);
    const t2 = setTimeout(() => fbq('trackCustom', 'TimeOnPage60s'), 60000);
    const t3 = setTimeout(() => fbq('trackCustom', 'TimeOnPage120s'), 120000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const applyPreset = (preset) => {
    if (activePreset === preset.id) {
      fbq('trackCustom', 'PresetDeselected', { preset_id: preset.id });
      trackClick('PresetDeselected', { preset_id: preset.id });
      setActivePreset(null);
      setSelected(new Set());
      setSelectedSlides(new Set());
    } else {
      fbq('trackCustom', 'PresetSelected', { preset_id: preset.id, meters: preset.meters });
      trackClick('PresetSelected', { preset_id: preset.id, meters: preset.meters });
      setActivePreset(preset.id);
      setSelected(new Set(preset.segmentIds));
      setSelectedSlides(new Set(preset.slideIds));
    }
    setShowForm(false);
  };

  const toggleSegment = (id) => {
    setActivePreset(null);
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        fbq('trackCustom', 'SegmentDeselected', { segment_id: id });
        trackClick('SegmentDeselected', { segment_id: id });
        next.delete(id);
      } else {
        fbq('trackCustom', 'SegmentSelected', { segment_id: id });
        trackClick('SegmentSelected', { segment_id: id });
        next.add(id);
      }
      return next;
    });
    setShowForm(false);
  };

  const toggleSlide = (id) => {
    setActivePreset(null);
    setSelectedSlides(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        fbq('trackCustom', 'SlideDeselected', { slide_id: id });
        trackClick('SlideDeselected', { slide_id: id });
        next.delete(id);
      } else {
        fbq('trackCustom', 'SlideSelected', { slide_id: id });
        trackClick('SlideSelected', { slide_id: id });
        next.add(id);
      }
      return next;
    });
    setShowForm(false);
  };

  const selectedSegments = SEGMENTS.filter(s => selected.has(s.id));
  const selectedSlideItems = SLIDES.filter(s => selectedSlides.has(s.id));
  const hasSelection = selected.size > 0 || selectedSlides.size > 0;

  // If active preset, use preset data for display
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

  // Configurator value threshold
  useEffect(() => {
    [2000, 4000].forEach(threshold => {
      if (totalPrice >= threshold && !firedValueRef.current.has(threshold)) {
        firedValueRef.current.add(threshold);
        fbq('trackCustom', 'ConfiguratorHighValue', { threshold });
      }
    });
  }, [totalPrice]);

  const hasSelection2 = hasSelection || !!activePreset;

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
                  onOpenDetail={() => { setModalSegment(segment); fbq('trackCustom', 'SegmentDetailOpened', { segment_id: segment.id }); trackClick('SegmentDetailOpened', { segment_id: segment.id }); }}
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
                  onOpenDetail={() => { setModalSegment(slide); fbq('trackCustom', 'SegmentDetailOpened', { segment_id: slide.id }); trackClick('SegmentDetailOpened', { segment_id: slide.id }); }}
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
            {PRESETS.map(preset => {
              const override = presetData[preset.id] || {};
              const mergedPreset = {
                ...preset,
                image: override.image || preset.image,
                priceLabel: override.price_label || preset.priceLabel,
                name: override.name || preset.name,
                components: override.components && override.components.length > 0 ? override.components : preset.components,
              };
              return (
                <SetCard
                  key={preset.id}
                  set={mergedPreset}
                  isActive={activePreset === preset.id}
                  onSelect={() => applyPreset(mergedPreset)}
                  onDetail={() => { setPresetLightbox(mergedPreset); fbq('trackCustom', 'SetDetailOpened', { preset_id: preset.id }); trackClick('SetDetailOpened', { preset_id: preset.id }); }}
                />
              );
            })}
          </div>

          {presetLightbox && (
            <SetLightbox
              set={presetLightbox}
              isActive={activePreset === presetLightbox.id}
              onSelect={() => applyPreset(presetLightbox)}
              onClose={() => setPresetLightbox(null)}
            />
          )}
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ padding: isMobile ? "40px 16px" : "60px 48px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", fontWeight: 700, letterSpacing: "3px", fontFamily: "sans-serif", marginBottom: "32px", textAlign: "center" }}>
          CO MÓWIĄ KLIENCI
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "16px" }}>
          {[
            { stars: 5, text: "Profesjonalna obsługa, tor był hitem eventu!", author: "Anna K.", city: "Warszawa" },
            { stars: 5, text: "Szybka wycena, montaż bez problemów. Polecamy!", author: "Firma XYZ", city: "Kraków" },
            { stars: 5, text: "Dzieci szalały przez 4 godziny. Zdecydowanie wrócimy!", author: "Piotr M.", city: "Łódź" },
          ].map((r, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "20px" }}>
              <div style={{ color: "#FF5C00", fontSize: "18px", marginBottom: "12px" }}>{"★".repeat(r.stars)}</div>
              <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "14px", fontFamily: "sans-serif", lineHeight: "1.6", marginBottom: "16px" }}>
                "{r.text}"
              </div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", fontFamily: "sans-serif", fontWeight: 600 }}>
                {r.author}, {r.city}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gallery */}
      <PhotoGallery onAskAbout={(photo) => {
        // Pre-select segments from the photo
        if (photo.segments && photo.segments.length > 0) {
          const SEGMENT_NAME_TO_ID = {
            "Tor 12m": "tor12", "Tor 20m": "tor20", "Tor 27m": "tor27", "Tor 28m": "tor28",
          };
          const SLIDE_NAME_TO_ID = {
            "Atomic Drop": "atomic-drop", "Zjeżdżalnia DUO": "duo",
          };
          const newSeg = new Set();
          const newSlides = new Set();
          photo.segments.forEach(name => {
            if (SEGMENT_NAME_TO_ID[name]) newSeg.add(SEGMENT_NAME_TO_ID[name]);
            else if (SLIDE_NAME_TO_ID[name]) newSlides.add(SLIDE_NAME_TO_ID[name]);
          });
          if (newSeg.size > 0) setSelected(newSeg);
          if (newSlides.size > 0) setSelectedSlides(newSlides);
          setActivePreset(null);
        }
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
        onSubmit={() => {
          fbq('track', 'InitiateCheckout');
          fbq('trackCustom', 'FormOpened', { total_meters: totalMeters, estimated_price: estimatedPrice });
          trackClick('FormOpened', { total_meters: totalMeters, estimated_price: estimatedPrice });
          trackerSession.form_opened = true;
          setShowForm(v => !v);
        }}
        isMobile={isMobile}
      />
    </div>
  );
}