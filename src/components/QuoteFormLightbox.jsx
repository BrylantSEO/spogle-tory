import { useState } from "react";
import { trackCustom } from "../utils/tracking";

export default function QuoteFormLightbox({
  initialSegments,
  initialSlides,
  totalMeters,
  estimatedPrice,
  totalPower,
  onClose,
  onSuccess,
  onAbandoned,
  SEGMENTS,
  SLIDES,
}) {
  const [formSegments, setFormSegments] = useState(new Set(initialSegments.map(s => s.id)));
  const [formSlides, setFormSlides] = useState(new Set(initialSlides.map(s => s.id)));
  const [form, setForm] = useState({ name: "", phone: "", event_date: "", location: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldFocused, setFieldFocused] = useState(false);
  const [showAddMore, setShowAddMore] = useState(false);

  const selectedSegments = SEGMENTS.filter(s => formSegments.has(s.id));
  const selectedSlideItems = SLIDES.filter(s => formSlides.has(s.id));
  const allSelected = [...selectedSegments, ...selectedSlideItems];

  const calculatedPrice = selectedSegments.filter(s => s.price).reduce((sum, s) => sum + s.price, 0)
    + selectedSlideItems.filter(s => s.price).reduce((sum, s) => sum + s.price, 0);
  const displayPrice = calculatedPrice > 0 ? `od ${calculatedPrice} zł` : "wycena indywidualna";

  const handleClose = () => {
    if (!submitted && onAbandoned) onAbandoned();
    onClose();
  };

  const handleFirstFocus = () => {
    if (!fieldFocused) {
      setFieldFocused(true);
      trackCustom('FormFieldFocused');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const response = await fetch("https://formspree.io/f/xbdavdgl", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        name: form.name,
        phone: form.phone,
        event_date: form.event_date,
        location: form.location,
        selected_segments: allSelected.map(s => s.name).join(", "),
        estimated_price: displayPrice,
        total_power: totalPower,
      })
    });
    setLoading(false);
    if (response.ok) {
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } else {
      alert("Błąd wysyłania. Spróbuj ponownie.");
    }
  };

  const removeItem = (id) => {
    if (formSegments.has(id)) {
      const next = new Set(formSegments); next.delete(id); setFormSegments(next);
    } else {
      const next = new Set(formSlides); next.delete(id); setFormSlides(next);
    }
  };

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    border: "1.5px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    padding: "13px 16px",
    color: "#fff",
    fontSize: "15px",
    fontFamily: "sans-serif",
    outline: "none",
    boxSizing: "border-box",
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
            maxWidth: "360px",
            textAlign: "center",
            width: "100%",
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
            style={{ background: "#FF5C00", color: "#fff", border: "none", borderRadius: "8px", padding: "12px 24px", fontWeight: 700, fontSize: "14px", fontFamily: "sans-serif", cursor: "pointer" }}
          >
            Zamknij
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClose}
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
          maxWidth: "560px",
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
            onClick={handleClose}
            style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: "32px", height: "32px", color: "#fff", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >×</button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: "auto", flex: 1, padding: "20px" }}>
          <style>{`
            input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }
            input::placeholder { color: rgba(255,255,255,0.2); }
            input:focus { border-color: rgba(255,92,0,0.5) !important; outline: none; }
          `}</style>

          {/* Selected items */}
          {allSelected.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", fontFamily: "sans-serif", marginBottom: "10px" }}>
                WYBRANE TORY
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {allSelected.map(seg => (
                  <div
                    key={seg.id}
                    style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,92,0,0.1)", border: "1px solid rgba(255,92,0,0.25)", borderRadius: "20px", padding: "5px 10px 5px 12px" }}
                  >
                    <span style={{ color: "#FF5C00", fontSize: "13px", fontWeight: 600, fontFamily: "sans-serif" }}>{seg.name}</span>
                    <button
                      onClick={() => removeItem(seg.id)}
                      style={{ background: "none", border: "none", color: "rgba(255,92,0,0.5)", cursor: "pointer", fontSize: "14px", lineHeight: 1, padding: 0, display: "flex", alignItems: "center" }}
                    >×</button>
                  </div>
                ))}
                <button
                  onClick={() => setShowAddMore(v => !v)}
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.15)", borderRadius: "20px", padding: "5px 12px", color: "rgba(255,255,255,0.4)", fontSize: "12px", fontFamily: "sans-serif", cursor: "pointer" }}
                >
                  {showAddMore ? "Zwiń" : "+ dodaj"}
                </button>
              </div>

              {/* Add more — expandable */}
              {showAddMore && (
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

          {/* Form fields */}
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
              <input
                style={inputStyle}
                placeholder="Imię"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                onFocus={handleFirstFocus}
                required
              />
              <input
                style={inputStyle}
                placeholder="Telefon"
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                required
              />
              <input
                type="date"
                style={{ ...inputStyle, colorScheme: "dark" }}
                placeholder="Data wydarzenia"
                value={form.event_date}
                onChange={e => setForm({ ...form, event_date: e.target.value })}
              />
              <input
                style={inputStyle}
                placeholder="Lokalizacja (np. Warszawa)"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
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
                padding: "16px",
                fontWeight: 800,
                fontSize: "16px",
                fontFamily: "sans-serif",
                cursor: "pointer",
                letterSpacing: "0.3px",
                boxShadow: "0 4px 24px rgba(255,92,0,0.3)",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Wysyłanie..." : "Wyślij zapytanie →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
