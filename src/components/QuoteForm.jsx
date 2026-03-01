import { useState } from "react";
import { base44 } from "@/api/base44Client";

export default function QuoteForm({ selectedSegments, totalMeters, estimatedPrice, totalPower, onClose }) {
  const [form, setForm] = useState({ name: "", phone: "", event_date: "", location: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await base44.entities.QuoteRequest.create({
      ...form,
      selected_segments: selectedSegments.map(s => s.name),
      total_meters: totalMeters,
      estimated_price: estimatedPrice,
      total_power: totalPower,
    });
    setLoading(false);
    setSubmitted(true);
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
        style={{
          marginTop: "16px",
          background: "rgba(255,92,0,0.08)",
          border: "1.5px solid rgba(255,92,0,0.3)",
          borderRadius: "14px",
          padding: "32px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "36px", marginBottom: "12px" }}>✅</div>
        <div style={{ color: "#fff", fontWeight: 800, fontSize: "18px", fontFamily: "'Arial Black', sans-serif", marginBottom: "8px" }}>
          Zapytanie wysłane!
        </div>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", fontFamily: "sans-serif" }}>
          Odpiszemy w ciągu 24 godzin.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: "16px",
        background: "rgba(255,255,255,0.03)",
        border: "1.5px solid rgba(255,255,255,0.08)",
        borderRadius: "14px",
        padding: "24px",
        animation: "slideDown 0.25s ease",
      }}
    >
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input:focus { border-color: rgba(255,92,0,0.5) !important; }
      `}</style>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
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
            marginTop: "16px",
            background: "#FF5C00",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "16px",
            fontWeight: 800,
            fontSize: "15px",
            fontFamily: "sans-serif",
            cursor: "pointer",
            letterSpacing: "0.3px",
            boxShadow: "0 4px 24px rgba(255,92,0,0.3)",
            transition: "background 0.2s",
          }}
        >
          {loading ? "Wysyłanie..." : "Wyślij zapytanie — odpiszemy w 24h"}
        </button>

        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px", textAlign: "center", marginTop: "10px", fontFamily: "sans-serif" }}>
          Bez zobowiązań. Nie sprzedajemy danych.
        </p>
      </form>
    </div>
  );
}