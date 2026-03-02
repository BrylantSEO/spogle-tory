import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";

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
  const [form, setForm] = useState({ name: "", phone: "", event_date: "", location: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const nameFocusedRef = useRef(false);

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
    await base44.entities.QuoteRequest.create({
      ...form,
      selected_segments: [...selectedSegments.map(s => s.name), ...selectedSlideItems.map(s => s.name)],
      total_meters: calculatedMeters,
      estimated_price: displayPrice,
      total_power: totalPower,
    });
    setLoading(false);
    setSubmitted(true);
    fbq('track', 'Lead');
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
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 600,
        background: "rgba(0,0,0,0.93)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
        overflowY: "auto",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#1a1a1a",
          border: "1.5px solid rgba(255,255,255,0.1)",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "600px",
          padding: "32px",
          position: "relative",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: "32px", height: "32px", color: "#fff", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >×</button>

        <h2 style={{ color: "#fff", fontSize: "24px", fontWeight: 900, fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif", marginBottom: "24px", letterSpacing: "-0.3px" }}>
          Wyślij zapytanie
        </h2>

        {/* Selected segments + slides */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", fontWeight: 700, letterSpacing: "2px", fontFamily: "sans-serif", marginBottom: "12px" }}>
            WYBRANE TORY ({formSegments.size + formSlides.size})
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
            {[...selectedSegments, ...selectedSlideItems].map(seg => (
              <div
                key={seg.id}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  background: "rgba(255,92,0,0.1)",
                  border: "1px solid rgba(255,92,0,0.3)",
                  borderRadius: "6px",
                  padding: "6px 12px",
                }}
              >
                <span style={{ color: "#FF5C00", fontSize: "13px", fontWeight: 600, fontFamily: "sans-serif" }}>
                  {seg.name}
                </span>
                <button
                  onClick={() => {
                    if (formSegments.has(seg.id)) {
                      const next = new Set(formSegments);
                      next.delete(seg.id);
                      setFormSegments(next);
                    } else {
                      const next = new Set(formSlides);
                      next.delete(seg.id);
                      setFormSlides(next);
                    }
                  }}
                  style={{ background: "none", border: "none", color: "rgba(255,92,0,0.6)", cursor: "pointer", fontSize: "16px", padding: "0 4px" }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Add more segments/slides */}
          <details style={{ cursor: "pointer" }}>
            <summary style={{ color: "#FF5C00", fontSize: "13px", fontWeight: 700, fontFamily: "sans-serif", outline: "none", userSelect: "none" }}>
              + Dodaj kolejne tory
            </summary>
            <div style={{ marginTop: "12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {SEGMENTS.filter(s => !formSegments.has(s.id)).map(seg => (
                <button
                  key={seg.id}
                  onClick={() => setFormSegments(prev => new Set([...prev, seg.id]))}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    color: "#fff",
                    fontSize: "13px",
                    fontFamily: "sans-serif",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => e.target.style.borderColor = "rgba(255,92,0,0.4)"}
                  onMouseLeave={e => e.target.style.borderColor = "rgba(255,255,255,0.07)"}
                >
                  {seg.name} <span style={{ color: "rgba(255,255,255,0.4)" }}>({seg.meters}m)</span>
                </button>
              ))}
              {SLIDES.filter(s => !formSlides.has(s.id)).map(slide => (
                <button
                  key={slide.id}
                  onClick={() => setFormSlides(prev => new Set([...prev, slide.id]))}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    color: "#fff",
                    fontSize: "13px",
                    fontFamily: "sans-serif",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => e.target.style.borderColor = "rgba(255,92,0,0.4)"}
                  onMouseLeave={e => e.target.style.borderColor = "rgba(255,255,255,0.07)"}
                >
                  {slide.name} <span style={{ color: "rgba(255,255,255,0.4)" }}>({slide.meters}m)</span>
                </button>
              ))}
            </div>
          </details>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "10px 12px" }}>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", fontWeight: 600, fontFamily: "sans-serif", marginBottom: "4px" }}>RAZEM</div>
            <div style={{ color: "#fff", fontSize: "16px", fontWeight: 800, fontFamily: "'Arial Black', sans-serif" }}>{calculatedMeters}m</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "10px 12px" }}>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", fontWeight: 600, fontFamily: "sans-serif", marginBottom: "4px" }}>PRĄD</div>
            <div style={{ color: "#fff", fontSize: "16px", fontWeight: 800, fontFamily: "'Arial Black', sans-serif" }}>⚡ {totalPower}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "10px 12px" }}>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", fontWeight: 600, fontFamily: "sans-serif", marginBottom: "4px" }}>CENA</div>
            <div style={{ color: "#FF5C00", fontSize: "16px", fontWeight: 800, fontFamily: "'Arial Black', sans-serif" }}>{displayPrice}</div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <label style={labelStyle}>IMIĘ</label>
              <input
                style={inputStyle}
                placeholder="Jan"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>TELEFON</label>
              <input
                style={inputStyle}
                placeholder="+48 000 000 000"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>DATA WYDARZENIA</label>
              <input
                type="date"
                style={{ ...inputStyle, colorScheme: "dark" }}
                value={form.event_date}
                onChange={e => setForm({ ...form, event_date: e.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>LOKALIZACJA</label>
              <input
                style={inputStyle}
                placeholder="np. Warszawa, Mokotów"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
              />
            </div>
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
              padding: "14px",
              fontWeight: 800,
              fontSize: "15px",
              fontFamily: "sans-serif",
              cursor: "pointer",
              letterSpacing: "0.3px",
              boxShadow: "0 4px 24px rgba(255,92,0,0.3)",
              transition: "opacity 0.2s",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Wysyłanie..." : "Wyślij zapytanie — odpiszemy w 24h"}
          </button>

          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px", textAlign: "center", marginTop: "10px", fontFamily: "sans-serif" }}>
            Bez zobowiązań. Nie sprzedajemy danych.
          </p>
        </form>
      </div>
    </div>
  );
}