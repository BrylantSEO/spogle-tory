import { useState, useEffect, useRef } from "react";
import { MousePointer, Calculator, MessageSquare, Shield, Award, Clock, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { initSession, trackClick, session as trackerSession } from "../components/internalTracker";
import SpogleHeader from "../components/SpogleHeader";
import ReturningBanner from "../components/ReturningBanner";
import { recordVisit, isReturningVisitor, saveLastSelection, getLastSelection, markFormOpened } from "../components/returningVisitor";
import SegmentCard from "../components/SegmentCard";
import SetCard from "../components/SetCard";
import SetLightbox from "../components/SetLightbox";
import SummaryBar from "../components/SummaryBar";
import QuoteForm from "../components/QuoteForm";
import QuoteFormLightbox from "../components/QuoteFormLightbox";
import SegmentModal from "../components/SegmentModal";
import PhotoGallery from "../components/PhotoGallery";
import { getSeasonInfo } from "../lib/seasonUtils";

const SEGMENTS = [
  {
    id: "tor12",
    name: "Tor 12m",
    shortName: "Mały tor",
    meters: 12,
    description: "Idealna opcja na mniejsze eventy i place zabaw",
    power: "3.5 kW",
    price: 1200,
    icon: "short",
  },
  {
    id: "tor20",
    name: "Tor 20m",
    shortName: "Średni tor",
    meters: 20,
    description: "Świetny wybór na festyny i firmowe pikniki",
    power: "3.5 kW",
    price: 1700,
    icon: "medium",
  },
  {
    id: "tor27",
    name: "Tor 27m",
    shortName: "Tor z zakrętem",
    meters: 27,
    description: "Unikalny układ z zakrętem — idealna dla większych obszarów",
    power: "2.3–3.5 kW",
    price: 2200,
    icon: "lshape",
  },
  {
    id: "tor28",
    name: "Tor 28m",
    shortName: "Duży tor",
    meters: 28,
    description: "Maksimum zabawy na dużych eventach plenerowych",
    power: "3.5 kW",
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
    power: "9–10 kW",
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
    power: "13–14 kW",
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
    power: "16–17 kW",
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
  power: "2.3–3.5 kW",
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
    power: "1.8 kW",
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
    power: "1.8 kW",
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
  const [selectedHours, setSelectedHours] = useState(null);
  const [segmentPrices, setSegmentPrices] = useState({});
  const [returningVisitor, setReturningVisitor] = useState(false);
  const [lastSelectionNames, setLastSelectionNames] = useState([]);
  const isMobile = useMobile();
  const firedValueRef = useRef(new Set());

  // Init session + ViewContent on mount
  useEffect(() => {
    initSession();
    fbq('track', 'ViewContent', { content_name: 'Tor Przeszkód Konfigurator' });
    // Track returning visitor
    const visitData = recordVisit();
    if (visitData.visit_count >= 3) {
      setReturningVisitor(true);
      const last = getLastSelection();
      const allItems = [...SEGMENTS, ...SLIDES];
      const names = [...last.segments, ...last.slides]
        .map(id => allItems.find(s => s.id === id)?.name)
        .filter(Boolean);
      setLastSelectionNames(names);
    }
    // Load preset overrides from DB
    base44.entities.PresetSet.list().then(data => {
      const map = {};
      data.forEach(p => { map[p.set_id] = p; });
      setPresetData(map);
    });
    // Load segment prices from DB
    base44.entities.TrackSegment.list().then(data => {
      const map = {};
      data.forEach(s => { map[s.segment_id] = s; });
      setSegmentPrices(map);
    });
  }, []);

  const applyPreset = (preset) => {
    if (activePreset === preset.id) {
      setActivePreset(null);
      setSelected(new Set());
      setSelectedSlides(new Set());
    } else {
      fbq('trackCustom', 'PresetSelected', { preset_id: preset.id, meters: preset.meters });
      trackClick('PresetSelected', { preset_id: preset.id, meters: preset.meters });
      setActivePreset(preset.id);
      setSelected(new Set(preset.segmentIds));
      setSelectedSlides(new Set(preset.slideIds));
      // Presets require minimum 5h
      if (!selectedHours || selectedHours < 5) setSelectedHours(5);
    }
    setShowForm(false);
  };

  const toggleSegment = (id) => {
    setActivePreset(null);
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
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

  const parsePowerKw = (powerStr) => {
    const nums = powerStr.match(/[\d.]+/g);
    if (!nums) return 0;
    return parseFloat(nums[nums.length - 1]);
  };
  const getEffectivePowerKw = (seg) => {
    const db = segmentPrices[seg.id];
    if (db?.total_power_kw) return db.total_power_kw;
    return parsePowerKw(seg.power);
  };
  const allPowerItems = [...selectedSegments, ...selectedSlideItems];
  const totalPowerNum = allPowerItems.reduce((sum, s) => sum + getEffectivePowerKw(s), 0);
  const totalPower = activePresetData ? activePresetData.power : (totalPowerNum > 0 ? totalPowerNum.toFixed(1).replace(/\.0$/, "") + " kW" : "0 kW");

  // Discount logic based on number of selected items
  const totalItemCount = selected.size + selectedSlides.size;
  const discountPercent = activePresetData ? 0 : (
    totalItemCount === 2 ? 10 : totalItemCount === 3 ? 20 : 0
  );
  const needsCustomQuote = !activePresetData && totalItemCount >= 4;

  // Calculate price based on selected hours
  const calcPriceWithHours = () => {
    if (activePresetData) {
      // For presets, use preset-level prices from DB
      if (selectedHours) {
        const hourKey = `price_${selectedHours}h`;
        const dbPreset = presetData[activePresetData.id];
        if (dbPreset && dbPreset[hourKey]) return `${dbPreset[hourKey]} zł netto`;
      }
      // Fallback to preset's default price_label from DB or hardcoded
      const dbPreset = presetData[activePresetData.id];
      return dbPreset?.price_label || activePresetData.priceLabel;
    }
    if (needsCustomQuote) return "Wycena indywidualna";
    if (!selectedHours) {
      if (totalPrice <= 0) return "od 0 zł";
      const discounted = discountPercent > 0 ? Math.round(totalPrice * (1 - discountPercent / 100)) : totalPrice;
      return `od ${discounted} zł`;
    }
    const hourKey = `price_${selectedHours}h`;
    let total = 0;
    let anyPrice = false;
    [...selected].forEach(id => {
      const dbSeg = segmentPrices[id];
      if (dbSeg && dbSeg[hourKey]) { total += dbSeg[hourKey]; anyPrice = true; }
    });
    [...selectedSlides].forEach(id => {
      const dbSeg = segmentPrices[id];
      if (dbSeg && dbSeg[hourKey]) { total += dbSeg[hourKey]; anyPrice = true; }
    });
    if (!anyPrice) return totalPrice > 0 ? `od ${totalPrice} zł` : "od 0 zł";
    const discounted = discountPercent > 0 ? Math.round(total * (1 - discountPercent / 100)) : total;
    return `${discounted} zł netto`;
  };
  const estimatedPrice = calcPriceWithHours();

  const calcDiscountAmount = () => {
    if (discountPercent === 0 || activePresetData) return 0;
    if (selectedHours) {
      const hourKey = `price_${selectedHours}h`;
      let total = 0;
      let anyPrice = false;
      [...selected].forEach(id => {
        const dbSeg = segmentPrices[id];
        if (dbSeg && dbSeg[hourKey]) { total += dbSeg[hourKey]; anyPrice = true; }
      });
      [...selectedSlides].forEach(id => {
        const dbSeg = segmentPrices[id];
        if (dbSeg && dbSeg[hourKey]) { total += dbSeg[hourKey]; anyPrice = true; }
      });
      if (!anyPrice) return 0;
      return Math.round(total * discountPercent / 100);
    }
    if (totalPrice <= 0) return 0;
    return Math.round(totalPrice * discountPercent / 100);
  };
  const discountAmount = calcDiscountAmount();

  // Configurator value threshold
  useEffect(() => {
    [2000, 4000].forEach(threshold => {
      if (totalPrice >= threshold && !firedValueRef.current.has(threshold)) {
        firedValueRef.current.add(threshold);
        fbq('trackCustom', 'ConfiguratorHighValue', { threshold });
      }
    });
  }, [totalPrice]);

  // Save selection for returning visitors
  useEffect(() => {
    if (selected.size > 0 || selectedSlides.size > 0) {
      saveLastSelection([...selected], [...selectedSlides]);
    }
  }, [selected, selectedSlides]);

  const hasSelection2 = hasSelection || !!activePreset;
  const currentSeasonInfo = getSeasonInfo();

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

      {/* Call banner */}
      <div style={{
        position: "fixed",
        top: "64px",
        left: 0,
        right: 0,
        zIndex: 90,
        background: "linear-gradient(90deg, rgba(255,92,0,0.95) 0%, rgba(220,60,0,0.95) 100%)",
        backdropFilter: "blur(8px)",
        padding: "10px 32px",
        display: isMobile ? "none" : "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        flexWrap: "wrap",
      }}>
        <span style={{ color: "#fff", fontSize: isMobile ? "13px" : "14px", fontFamily: "sans-serif", fontWeight: 600, textAlign: "center" }}>
          🤔 Nie wiesz co wybrać? <strong>Zadzwoń — doradzimy!</strong>
        </span>
        <a
          href="tel:+48573177098"
          onClick={() => { if (typeof window.fbq === 'function') window.fbq('trackCustom', 'PhoneClick'); trackClick('PhoneClick', { source: 'call_banner' }); }}
          style={{
            background: "#fff",
            color: "#FF5C00",
            padding: "6px 18px",
            borderRadius: "6px",
            fontWeight: 800,
            fontSize: "14px",
            textDecoration: "none",
            fontFamily: "sans-serif",
            whiteSpace: "nowrap",
            letterSpacing: "0.2px",
          }}
        >
          📞 +48 573 177 098
        </a>
      </div>

      {/* Hero */}
      <div
        className="noise-bg grid-lines"
        style={{
          minHeight: "100vh",
          paddingTop: "110px",
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
            padding: isMobile ? "24px 16px 0" : "40px 48px",
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
                color: "rgba(255,255,255,0.78)",
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

            {/* How it works — large steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { num: "1", icon: <MousePointer size={22} color="#FF5C00" />, title: "Wybierz segmenty", desc: "Kliknij tory po prawej lub wybierz gotowy set" },
                { num: "2", icon: <Calculator size={22} color="#FF5C00" />, title: "Sprawdź cenę na żywo", desc: "Cena, metry i prąd aktualizują się automatycznie" },
                { num: "3", icon: <MessageSquare size={22} color="#FF5C00" />, title: "Wyślij zapytanie", desc: "Odpiszemy w ciągu 24h z dokładną ofertą" },
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                  <div style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "rgba(255,92,0,0.12)",
                    border: "1px solid rgba(255,92,0,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {step.icon}
                  </div>
                  <div>
                    <div style={{ color: "#fff", fontSize: "16px", fontWeight: 800, fontFamily: "sans-serif", letterSpacing: "-0.2px", marginBottom: "3px" }}>
                      {step.title}
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "13px", fontFamily: "sans-serif", lineHeight: 1.5 }}>
                      {step.desc}
                    </div>
                  </div>
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
            {/* Returning visitor banner */}
            {returningVisitor && (
              <div style={{ paddingTop: "24px" }}>
                <ReturningBanner
                  lastSegmentNames={lastSelectionNames}
                  onRestoreSelection={() => {
                    const last = getLastSelection();
                    setSelected(new Set(last.segments));
                    setSelectedSlides(new Set(last.slides));
                    setActivePreset(null);
                  }}
                />
              </div>
            )}

            {/* Seasonal banner */}
            {currentSeasonInfo.banner && (
              <div style={{
                marginTop: "16px",
                background: currentSeasonInfo.banner.bg,
                border: `1.5px solid ${currentSeasonInfo.banner.border}`,
                borderRadius: "12px",
                padding: "14px 18px",
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
              }}>
                <span style={{ fontSize: "22px", flexShrink: 0 }}>{currentSeasonInfo.banner.icon}</span>
                <div>
                  <div style={{ color: currentSeasonInfo.banner.color, fontSize: "13px", fontWeight: 800, fontFamily: "sans-serif", marginBottom: "3px" }}>
                    {currentSeasonInfo.banner.title}
                    {currentSeasonInfo.discountPercent > 0 && (
                      <span style={{ marginLeft: "8px", background: currentSeasonInfo.banner.color, color: "#000", borderRadius: "4px", padding: "1px 7px", fontSize: "11px", fontWeight: 900 }}>
                        -{currentSeasonInfo.discountPercent}%
                      </span>
                    )}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "12px", fontFamily: "sans-serif", lineHeight: 1.5 }}>
                    {currentSeasonInfo.banner.text}
                  </div>
                </div>
              </div>
            )}

            {/* Section label */}
            <div
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "2.5px",
                fontFamily: "sans-serif",
                marginBottom: "16px",
                paddingTop: returningVisitor ? "8px" : "24px",
              }}
            >
              WYBIERZ SEGMENTY TORU
            </div>

            {/* Cards grid */}
            <div className="segment-grid">
              {SEGMENTS.map(segment => {
                const dbPow = segmentPrices[segment.id]?.total_power_kw;
                const seg = dbPow ? { ...segment, power: `${dbPow} kW` } : segment;
                return (
                  <SegmentCard
                    key={segment.id}
                    segment={seg}
                    selected={selected.has(segment.id)}
                    onToggle={() => toggleSegment(segment.id)}
                    onOpenDetail={() => { setModalSegment(seg); }}
                  />
                );
              })}
            </div>

            {/* Slides section */}
            <div
              style={{
                color: "rgba(255,255,255,0.6)",
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
              {SLIDES.map(slide => {
                const dbPow = segmentPrices[slide.id]?.total_power_kw;
                const sl = dbPow ? { ...slide, power: `${dbPow} kW` } : slide;
                return (
                  <SegmentCard
                    key={slide.id}
                    segment={sl}
                    selected={selectedSlides.has(slide.id)}
                    onToggle={() => toggleSlide(slide.id)}
                    onOpenDetail={() => { setModalSegment(sl); }}
                  />
                );
              })}
            </div>

            {/* Modal */}
            {modalSegment && (
              <SegmentModal
                segment={modalSegment}
                selected={selected.has(modalSegment.id) || selectedSlides.has(modalSegment.id)}
                onToggle={() => {
                  if (SEGMENTS.find(s => s.id === modalSegment.id)) toggleSegment(modalSegment.id);
                  else toggleSlide(modalSegment.id);
                }}
                onClose={() => setModalSegment(null)}
                selectedHours={selectedHours}
                onSelectHours={setSelectedHours}
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
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px", fontFamily: "sans-serif" }}>
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
                setup_time_minutes: override.setup_time_minutes || null,
                animators_included: override.animators_included || null,
              };
              return (
                <SetCard
                  key={preset.id}
                  set={mergedPreset}
                  isActive={activePreset === preset.id}
                  onSelect={() => applyPreset(mergedPreset)}
                  onDetail={() => { setPresetLightbox(mergedPreset); }}
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

          {/* Jak wybrać? — after set cards */}
          <div style={{ marginTop: "32px" }}>
            <div style={{
              color: "rgba(255,255,255,0.82)",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "2.5px",
              fontFamily: "sans-serif",
              marginBottom: "14px",
              textTransform: "uppercase",
            }}>
              Jak wybrać?
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: "12px",
            }}>
              <div style={{
                background: "rgba(255,92,0,0.08)",
                border: "1.5px solid rgba(255,92,0,0.35)",
                borderRadius: "16px",
                padding: "24px 28px",
              }}>
                <div style={{ color: "#FF5C00", fontSize: "16px", fontWeight: 900, fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif", letterSpacing: "0.5px", marginBottom: "4px", textTransform: "uppercase" }}>
                  Gotowy set — kiedy?
                </div>
                <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "12px", fontFamily: "sans-serif", marginBottom: "16px" }}>
                  Wybierz jeden z naszych sprawdzonych zestawów
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    "Duży event plenerowy — festyn, piknik firmowy, dni osiedla",
                    "Chcesz gotowej ceny bez kombinowania",
                    "Zależy Ci na szybkiej decyzji i pewności dostępności",
                    "Szukasz maksymalnego WOW-efektu — sety to nasze największe tory",
                  ].map((item, i) => (
                    <li key={i} style={{ color: "rgba(255,255,255,0.75)", fontSize: "14px", fontFamily: "sans-serif", lineHeight: 1.5, display: "flex", gap: "10px", alignItems: "flex-start" }}>
                      <span style={{ color: "#FF5C00", flexShrink: 0, fontWeight: 700, marginTop: "1px" }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{
                background: "rgba(255,255,255,0.04)",
                border: "1.5px solid rgba(255,255,255,0.12)",
                borderRadius: "16px",
                padding: "24px 28px",
              }}>
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "16px", fontWeight: 900, fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif", letterSpacing: "0.5px", marginBottom: "4px", textTransform: "uppercase" }}>
                  Własne zestawienie — kiedy?
                </div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px", fontFamily: "sans-serif", marginBottom: "16px" }}>
                  Kliknij segmenty wyżej i ułóż tor pod siebie
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    "Ograniczona przestrzeń — dopasujesz metry do miejsca",
                    "Mniejszy event: szkolny dzień sportu, urodziny, piknik",
                    "Konkretny układ terenu wymaga niestandardowej konfiguracji",
                    "Masz określony budżet i sam decydujesz co wchodzi w skład",
                  ].map((item, i) => (
                    <li key={i} style={{ color: "rgba(255,255,255,0.82)", fontSize: "14px", fontFamily: "sans-serif", lineHeight: 1.5, display: "flex", gap: "10px", alignItems: "flex-start" }}>
                      <span style={{ color: "rgba(255,255,255,0.6)", flexShrink: 0, marginTop: "1px" }}>→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* WIĘCEJ ATRAKCJI — na samym końcu */}
          <div style={{ marginTop: "16px", background: "rgba(255,92,0,0.05)", border: "1px solid rgba(255,92,0,0.2)", borderRadius: "12px", padding: "16px 20px" }}>
            <div style={{ color: "#FF5C00", fontSize: "12px", fontWeight: 700, letterSpacing: "1.5px", fontFamily: "sans-serif", marginBottom: "6px" }}>
              WIĘCEJ ATRAKCJI
            </div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", fontFamily: "sans-serif", lineHeight: 1.6, margin: 0 }}>
              Oferujemy też <strong style={{ color: "rgba(255,255,255,0.85)" }}>dmuchańce, zamki, piana party</strong> i inne atrakcje, które można łączyć z torem. Napisz o tym w polu komentarza przy zapytaniu.
            </p>
          </div>
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

      {/* Trust badges with icons */}
      <div style={{ padding: isMobile ? "40px 16px 0" : "60px 48px 0", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr",
          gap: "12px",
          marginBottom: "60px",
        }}>
          {[
            { icon: <Clock size={28} color="#FF5C00" />, value: "7 lat", label: "doświadczenia" },
            { icon: <Award size={28} color="#FF5C00" />, value: "500+", label: "eventów wykonanych" },
            { icon: <Shield size={28} color="#FF5C00" />, value: "OC", label: "ubezpieczenie" },
            { icon: <Users size={28} color="#FF5C00" />, value: "Własni", label: "doświadczeni animatorzy" },
          ].map((item, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: "16px",
              padding: isMobile ? "20px 16px" : "28px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              textAlign: "center",
            }}>
              <div style={{ background: "rgba(255,92,0,0.12)", borderRadius: "12px", padding: "14px" }}>
                {item.icon}
              </div>
              <div>
                <div style={{ color: "#fff", fontSize: isMobile ? "24px" : "30px", fontWeight: 900, fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif", lineHeight: 1, letterSpacing: "-0.5px" }}>
                  {item.value}
                </div>
                <div style={{ color: "rgba(255,255,255,0.72)", fontSize: "12px", fontFamily: "sans-serif", marginTop: "4px", lineHeight: 1.4 }}>
                  {item.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ padding: isMobile ? "0 16px 40px" : "0 48px 60px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "11px", fontWeight: 700, letterSpacing: "3px", fontFamily: "sans-serif", marginBottom: "32px", textAlign: "center" }}>
          CO MÓWIĄ KLIENCI
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "16px" }}>
          {[
            { text: "Korzystam z usług Spogle od kilku lat i jeszcze nigdy mnie nie zawiedli. Mogę polecić tę współpracę. Zawsze miła i bezproblemowa obsługa oraz konkurencyjne stawki.", author: "Anna Kautz", ago: "6 miesięcy temu" },
            { text: "Miałam przyjemność współpracować z tą firmą przy organizacji dnia dziecka w szkole podstawowej. Całość usługi na najwyższym poziomie, począwszy od wstępnych ustaleń aż po realizację.", author: "Aneta Baj", ago: "8 miesięcy temu" },
            { text: "Obsługa na najwyższym poziomie. Super kontakt i współpraca z Panem Hubertem. Animatorzy do obsługi urządzeń zaangażowani i dbający o bezpieczeństwo nawet najmniejszych użytkowników. Polecam :)", author: "Natalia", ago: "7 miesięcy temu" },
          ].map((r, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <span style={{ color: "#FF5C00", fontSize: "16px" }}>★★★★★</span>
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px", fontFamily: "sans-serif" }}>{r.ago}</span>
              </div>
              <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "14px", fontFamily: "sans-serif", lineHeight: "1.6", marginBottom: "16px" }}>
                "{r.text}"
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "rgba(255,255,255,0.78)", fontSize: "13px", fontFamily: "sans-serif", fontWeight: 600 }}>{r.author}</span>
                <span style={{ color: "rgba(255,255,255,0.82)", fontSize: "11px", fontFamily: "sans-serif" }}>· Google</span>
              </div>
            </div>
          ))}
        </div>
      </div>

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
        selectedHours={selectedHours}
        onSelectHours={setSelectedHours}
        isPreset={!!activePreset}
        isHighSeason={currentSeasonInfo.type === "highseason"}
        discountPercent={discountPercent}
        discountAmount={discountAmount}
        needsCustomQuote={needsCustomQuote}
        onSubmit={() => {
          fbq('track', 'InitiateCheckout');
          fbq('trackCustom', 'FormOpened', { total_meters: totalMeters, estimated_price: estimatedPrice });
          trackClick('FormOpened', { total_meters: totalMeters, estimated_price: estimatedPrice });
          trackerSession.form_opened = true;
          markFormOpened();
          setShowForm(v => !v);
        }}
        isMobile={isMobile}
      />
    </div>
  );
}