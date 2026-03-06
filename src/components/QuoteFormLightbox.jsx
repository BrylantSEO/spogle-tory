import { useState, useRef } from "react";
import { Zap, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { trackClick, session as trackerSession } from "./internalTracker";
import { isReturningVisitor, hadFormOpened, DISCOUNT_CODE } from "./returningVisitor";
import { getSeasonInfo } from "@/lib/seasonUtils";

function fbq(...args) {
  if (typeof window.fbq === 'function') window.fbq(...args);
}

export default function QuoteFormLightbox({
  initialSegments,
  initialSlides,
  totalMeters,
  estimatedPrice,
  totalPower,
  onClose,
  SEGMENTS,
  SLIDES,
}) {
  const [formSegments, setFormSegments] = useState(new Set(initialSegments.map(s => s.id)));
  const [formSlides, setFormSlides] = useState(new Set(initialSlides.map(s => s.id)));
  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem("spogle_quote_form");
      if (saved) return { notes: "", ...JSON.parse(saved) };
    } catch {}
    return { name: "", phone: "", email: "", event_date: "", location: "", notes: "" };
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const nameFocusedRef = useRef(false);
  const showDiscount = isReturningVisitor() && hadFormOpened();
  const seasonInfo = getSeasonInfo(form.event_date);

  // Persist form data to localStorage on change
  const updateForm = (newForm) => {
    setForm(newForm);
    try { localStorage.setItem("spogle_quote_form", JSON.stringify(newForm)); } catch {}
  };

  const selectedSegments = SEGMENTS.filter(s => formSegments.has(s.id));
  const selectedSlideItems = SLIDES.filter(s => formSlides.has(s.id));
  
  const segmentMeters = selectedSegments.reduce((sum, s) => sum + s.meters, 0);
  const slideMeters = selectedSlideItems.reduce((sum, s) => sum + (s.meters || 0), 0);
  const calculatedMeters = segmentMeters + slideMeters;
  const calculatedPrice = selectedSegments.filter(s => s.price).reduce((sum, s) => sum + s.price, 0)
    + selectedSlideItems.filter(s => s.price).reduce((sum, s) => sum + s.price, 0);
  const displayPrice = calculatedPrice > 0 ? `od ${calculatedPrice} zł` : "od 0 zł";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const allSegmentNames = [...selectedSegments.map(s => s.name), ...selectedSlideItems.map(s => s.name)];
    await base44.entities.QuoteRequest.create({
      name: form.name,
      phone: form.phone,
      event_date: form.event_date,
      location: form.location,
      notes: form.notes,
      selected_segments: allSegmentNames,
      total_meters: calculatedMeters,
      estimated_price: displayPrice,
      total_power: totalPower,
    });
    // Send notification via n8n webhook
    const webhookParams = new URLSearchParams({
      name: form.name,
      phone: form.phone,
      email: form.email || "",
      event_date: form.event_date || "",
      location: form.location || "",
      notes: form.notes || "",
      segments: allSegmentNames.join(", "),
      meters: calculatedMeters,
      power: totalPower,
      price: displayPrice,
    });
    await fetch(`https://seodd.app.n8n.cloud/webhook/1075610a-5587-4741-bdbf-c1cb1528ed4d?${webhookParams}`).catch(() => {});
    setLoading(false);
    setSubmitted(true);
    fbq('track', 'Lead');
    trackClick('FormSubmitted', { total_meters: calculatedMeters, estimated_price: displayPrice });
    trackerSession.form_submitted = true;
  };

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1.5px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    padding: "13px 16px",
    color: "#fff",
    fontSize: "14px",
    fontFamily: "sans-serif",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    color: "rgba(255,255,255,0.45)",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.8px",
    fontFamily: "sans-serif",
    marginBottom: "6px",
    display: "block",
  };

  if (submitted) {
    return (
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 600,
          background: "rgba(0,0,0,0.93)",
          backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px",
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: "#1a1a1a",
            border: "1.5px solid rgba(255,255,255,0.1)",
            borderRadius: "16px",
            padding: "48px 32px",
            maxWidth: "400px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: "20px", fontFamily: "'Arial Black', sans-serif", marginBottom: "8px" }}>
            Zapytanie wysłane!
          </div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", fontFamily: "sans-serif", marginBottom: "24px" }}>
            Odpiszemy w ciągu 24 godzin.
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#FF5C00",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "12px 20px",
              fontWeight: 700,
              fontSize: "14px",
              fontFamily: "sans-serif",
              cursor: "pointer",
            }}
          >
            Zamknij
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => { fbq('trackCustom', 'FormAbandoned'); onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 600,
        background: "rgba(0,0,0,0.88)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#161616",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "20px 20px 0 0",
          width: "100%",
          maxWidth: "600px",
          maxHeight: "92dvh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ color: "#fff", fontSize: "20px", fontWeight: 900, fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif", margin: 0, letterSpacing: "-0.2px" }}>
              Wyślij zapytanie
            </h2>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", fontFamily: "sans-serif", marginTop: "2px" }}>
              Odpiszemy w ciągu 24h · bez zobowiązań
            </div>
          </div>
          <button
            onClick={() => { fbq('trackCustom', 'FormAbandoned'); onClose(); }}
            style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: "32px", height: "32px", color: "#fff", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >×</button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: "auto", flex: 1, padding: "20px" }}>
          <style>{`
            input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }
            input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.2); }
            input:focus, textarea:focus { border-color: rgba(255,92,0,0.5) !important; outline: none; }
          `}</style>

        {/* Selected segments — pill chips */}
        {[...selectedSegments, ...selectedSlideItems].length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", fontFamily: "sans-serif", marginBottom: "10px" }}>
              WYBRANE TORY
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {[...selectedSegments, ...selectedSlideItems].map(seg => (
                <div
                  key={seg.id}
                  style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,92,0,0.1)", border: "1px solid rgba(255,92,0,0.25)", borderRadius: "20px", padding: "5px 10px 5px 12px" }}
                >
                  <span style={{ color: "#FF5C00", fontSize: "13px", fontWeight: 600, fontFamily: "sans-serif" }}>{seg.name}</span>
                  <button
                    onClick={() => {
                      if (formSegments.has(seg.id)) {
                        const next = new Set(formSegments); next.delete(seg.id); setFormSegments(next);
                      } else {
                        const next = new Set(formSlides); next.delete(seg.id); setFormSlides(next);
                      }
                    }}
                    style={{ background: "none", border: "none", color: "rgba(255,92,0,0.5)", cursor: "pointer", fontSize: "14px", lineHeight: 1, padding: 0, display: "flex", alignItems: "center" }}
                  >×</button>
                </div>
              ))}
              <button
                onClick={() => setAddOpen(v => !v)}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.15)", borderRadius: "20px", padding: "5px 12px", color: "rgba(255,255,255,0.4)", fontSize: "12px", fontFamily: "sans-serif", cursor: "pointer" }}
              >
                {addOpen ? "Zwiń" : "+ dodaj"}
              </button>
            </div>

            {addOpen && (
              <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {[
                  ...SEGMENTS.filter(s => !formSegments.has(s.id)).map(s => ({ ...s, type: "seg" })),
                  ...SLIDES.filter(s => !formSlides.has(s.id)).map(s => ({ ...s, type: "slide" })),
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.type === "seg") setFormSegments(prev => new Set([...prev, item.id]));
                      else setFormSlides(prev => new Set([...prev, item.id]));
                    }}
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "5px 12px", color: "rgba(255,255,255,0.6)", fontSize: "12px", fontFamily: "sans-serif", cursor: "pointer" }}
                  >
                    + {item.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "12px" }}>
            <input
              style={inputStyle}
              placeholder="Imię"
              value={form.name}
              onChange={e => updateForm({ ...form, name: e.target.value })}
              onFocus={() => { if (!nameFocusedRef.current) { nameFocusedRef.current = true; fbq('trackCustom', 'FormFieldFocused'); } }}
              required
            />
            <input
              style={inputStyle}
              placeholder="Telefon"
              type="tel"
              value={form.phone}
              onChange={e => updateForm({ ...form, phone: e.target.value })}
              required
            />
            <input
              style={inputStyle}
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={e => updateForm({ ...form, email: e.target.value })}
            />
            <input
              type="date"
              lang="pl"
              style={{ ...inputStyle, colorScheme: "dark" }}
              value={form.event_date}
              onChange={e => updateForm({ ...form, event_date: e.target.value })}
            />
            <input
              style={inputStyle}
              placeholder="Lokalizacja (np. Warszawa)"
              value={form.location}
              onChange={e => updateForm({ ...form, location: e.target.value })}
            />
          </div>

          {/* Seasonal banner */}
          {seasonInfo.banner && (
            <div style={{
              background: seasonInfo.banner.bg,
              border: `1.5px solid ${seasonInfo.banner.border}`,
              borderRadius: "10px",
              padding: "12px 16px",
              marginBottom: "12px",
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
            }}>
              <span style={{ fontSize: "20px", flexShrink: 0 }}>{seasonInfo.banner.icon}</span>
              <div>
                <div style={{ color: seasonInfo.banner.color, fontSize: "13px", fontWeight: 800, fontFamily: "sans-serif", marginBottom: "3px" }}>
                  {seasonInfo.banner.title}
                  {seasonInfo.discountPercent > 0 && (
                    <span style={{ marginLeft: "8px", background: seasonInfo.banner.color, color: "#000", borderRadius: "4px", padding: "1px 7px", fontSize: "11px", fontWeight: 900 }}>
                      -{seasonInfo.discountPercent}%
                    </span>
                  )}
                </div>
                <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "12px", fontFamily: "sans-serif", lineHeight: 1.5 }}>
                  {seasonInfo.banner.text}
                </div>
              </div>
            </div>
          )}

          <div style={{ marginBottom: "12px" }}>
            <label style={labelStyle}>DODATKOWE INFORMACJE (OPCJONALNIE)</label>
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: "80px", lineHeight: 1.5 }}
              placeholder="np. liczba uczestników, pytania, szczególne wymagania..."
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: "#FF5C00",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "12px 10px",
              fontWeight: 800,
              fontSize: "clamp(11px, 3vw, 15px)",
              fontFamily: "sans-serif",
              cursor: "pointer",
              letterSpacing: "0.2px",
              boxShadow: "0 4px 24px rgba(255,92,0,0.3)",
              transition: "opacity 0.2s",
              opacity: loading ? 0.6 : 1,
              whiteSpace: "nowrap",
            }}
          >
            {loading ? "Wysyłanie..." : "Wyślij zapytanie — odpiszemy w 24h"}
          </button>

          {showDiscount && (
            <div style={{
              background: "linear-gradient(135deg, rgba(255,92,0,0.12), rgba(255,92,0,0.04))",
              border: "1px solid rgba(255,92,0,0.25)",
              borderRadius: "10px",
              padding: "12px 16px",
              marginTop: "12px",
              textAlign: "center",
            }}>
              <div style={{ color: "#FF5C00", fontSize: "13px", fontWeight: 800, fontFamily: "sans-serif", marginBottom: "2px" }}>
                🎉 Kod zniżkowy: {DISCOUNT_CODE}
              </div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", fontFamily: "sans-serif" }}>
                Podaj go w zapytaniu, a otrzymasz rabat!
              </div>
            </div>
          )}
        </form>
        </div>
      </div>
    </div>
  );
}