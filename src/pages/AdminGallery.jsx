import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";

const SEGMENT_OPTIONS = [
  "Tor 12m", "Tor 20m", "Tor 27m", "Tor 28m",
  "Giga Tor 108m", "Atomic Drop", "Zjeżdżalnia DUO"
];

export default function AdminGallery() {
  const [photos, setPhotos] = useState([]);
  const [editing, setEditing] = useState(null); // photo object being edited
  const [hotpointMode, setHotpointMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await base44.entities.GalleryPhoto.list("sort_order", 100);
    setPhotos(data);
  };

  const startEdit = (photo) => {
    setEditing({ ...photo, hotpoints: photo.hotpoints || [], segments: photo.segments || [] });
    setHotpointMode(false);
    setShowForm(true);
  };

  const startNew = () => {
    setEditing({ src: "", alt: "", segments: [], total_meters: "", hotpoints: [], sort_order: photos.length });
    setHotpointMode(false);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    if (editing.id) {
      await base44.entities.GalleryPhoto.update(editing.id, editing);
    } else {
      await base44.entities.GalleryPhoto.create(editing);
    }
    setSaving(false);
    setShowForm(false);
    setEditing(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Usunąć to zdjęcie z galerii?")) return;
    await base44.entities.GalleryPhoto.delete(id);
    load();
  };

  const handleImageClick = (e) => {
    if (!hotpointMode || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const label = prompt("Etykieta hotpointa (np. 'Tor 12m'):");
    if (!label) return;
    setEditing(prev => ({
      ...prev,
      hotpoints: [...(prev.hotpoints || []), { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, label }]
    }));
  };

  const removeHotpoint = (idx) => {
    setEditing(prev => ({
      ...prev,
      hotpoints: prev.hotpoints.filter((_, i) => i !== idx)
    }));
  };

  const toggleSegment = (seg) => {
    setEditing(prev => {
      const segs = prev.segments || [];
      return {
        ...prev,
        segments: segs.includes(seg) ? segs.filter(s => s !== seg) : [...segs, seg]
      };
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", color: "#fff", fontFamily: "sans-serif", padding: "40px 24px" }}>
      <style>{`
        .admin-input {
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          color: #fff;
          padding: 10px 14px;
          font-size: 14px;
          width: 100%;
          outline: none;
          font-family: sans-serif;
          transition: border-color 0.2s;
        }
        .admin-input:focus { border-color: #FF5C00; }
        .admin-input::placeholder { color: rgba(255,255,255,0.25); }
        .seg-chip {
          padding: 5px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          border: 1.5px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.5);
          transition: all 0.15s;
        }
        .seg-chip.active {
          background: rgba(255,92,0,0.18);
          border-color: #FF5C00;
          color: #FF5C00;
        }
        .btn-orange {
          background: #FF5C00;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: sans-serif;
          transition: opacity 0.15s;
        }
        .btn-orange:hover { opacity: 0.85; }
        .btn-ghost {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.6);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: sans-serif;
          transition: all 0.15s;
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .photo-card {
          background: rgba(255,255,255,0.03);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .photo-card:hover { border-color: rgba(255,92,0,0.4); }
      `}</style>

      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <div style={{ color: "#FF5C00", fontSize: "11px", fontWeight: 700, letterSpacing: "2.5px", marginBottom: "8px" }}>
              PANEL ADMINA
            </div>
            <h1 style={{ fontFamily: "'Arial Black', sans-serif", fontSize: "28px", fontWeight: 900, margin: 0 }}>
              Zarządzanie galerią
            </h1>
          </div>
          <button className="btn-orange" onClick={startNew}>+ Dodaj zdjęcie</button>
        </div>

        {/* Photo list */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginBottom: "40px" }}>
          {photos.map(photo => (
            <div key={photo.id} className="photo-card">
              <div style={{ position: "relative", aspectRatio: "4/3" }}>
                <img src={photo.src} alt={photo.alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                {(photo.hotpoints || []).map((hp, i) => (
                  <div key={i} style={{
                    position: "absolute", left: `${hp.x}%`, top: `${hp.y}%`,
                    transform: "translate(-50%, -50%)",
                    width: "18px", height: "18px",
                    background: "#FF5C00",
                    borderRadius: "50%",
                    border: "2px solid #fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "9px", fontWeight: 800, color: "#fff",
                  }}>
                    {i + 1}
                  </div>
                ))}
              </div>
              <div style={{ padding: "14px" }}>
                <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "6px" }}>{photo.alt}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "10px" }}>
                  {(photo.segments || []).map(s => (
                    <span key={s} style={{ background: "rgba(255,92,0,0.15)", border: "1px solid rgba(255,92,0,0.4)", color: "#FF5C00", fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px" }}>{s}</span>
                  ))}
                  {photo.total_meters && (
                    <span style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)", fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px" }}>
                      {photo.total_meters}
                    </span>
                  )}
                </div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", marginBottom: "10px" }}>
                  {(photo.hotpoints || []).length} hotpoint{(photo.hotpoints || []).length !== 1 ? "ów" : ""}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="btn-ghost" style={{ flex: 1 }} onClick={() => startEdit(photo)}>✏ Edytuj</button>
                  <button className="btn-ghost" style={{ color: "#ff4444", borderColor: "rgba(255,68,68,0.3)" }} onClick={() => handleDelete(photo.id)}>✕</button>
                </div>
              </div>
            </div>
          ))}
          {photos.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", color: "rgba(255,255,255,0.3)", padding: "60px" }}>
              Brak zdjęć. Dodaj pierwsze zdjęcie do galerii.
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {showForm && editing && (
        <div
          onClick={() => { setShowForm(false); setEditing(null); }}
          style={{
            position: "fixed", inset: 0, zIndex: 400,
            background: "rgba(0,0,0,0.88)",
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
              padding: "32px",
              width: "100%",
              maxWidth: "800px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h2 style={{ fontFamily: "'Arial Black', sans-serif", fontSize: "20px", marginBottom: "24px", fontWeight: 900 }}>
              {editing.id ? "Edytuj zdjęcie" : "Nowe zdjęcie"}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* URL */}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", marginBottom: "6px" }}>URL ZDJĘCIA</label>
                <input className="admin-input" value={editing.src} onChange={e => setEditing(p => ({ ...p, src: e.target.value }))} placeholder="https://..." />
              </div>

              {/* Alt */}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", marginBottom: "6px" }}>TYTUŁ / OPIS</label>
                <input className="admin-input" value={editing.alt} onChange={e => setEditing(p => ({ ...p, alt: e.target.value }))} placeholder="np. Tor przeszkód na pikniku firmowym" />
              </div>

              {/* Total meters */}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", marginBottom: "6px" }}>ŁĄCZNE METRY</label>
                <input className="admin-input" value={editing.total_meters || ""} onChange={e => setEditing(p => ({ ...p, total_meters: e.target.value }))} placeholder="np. 97m" style={{ maxWidth: "160px" }} />
              </div>

              {/* Sort order */}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", marginBottom: "6px" }}>KOLEJNOŚĆ</label>
                <input className="admin-input" type="number" value={editing.sort_order ?? 0} onChange={e => setEditing(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} style={{ maxWidth: "100px" }} />
              </div>

              {/* Segments */}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", marginBottom: "10px" }}>SEGMENTY NA ZDJĘCIU</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {SEGMENT_OPTIONS.map(seg => (
                    <button
                      key={seg}
                      className={`seg-chip ${(editing.segments || []).includes(seg) ? "active" : ""}`}
                      onClick={() => toggleSegment(seg)}
                    >
                      {seg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hotpoints */}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", marginBottom: "10px" }}>HOTPOINTY</label>

                {editing.src && (
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                      <button
                        className={hotpointMode ? "btn-orange" : "btn-ghost"}
                        onClick={() => setHotpointMode(v => !v)}
                      >
                        {hotpointMode ? "🖱 Kliknij na zdjęcie" : "➕ Dodaj hotpoint"}
                      </button>
                      {hotpointMode && <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>Kliknij na zdjęcie aby dodać punkt</span>}
                    </div>
                    <div style={{ position: "relative", display: "inline-block", borderRadius: "8px", overflow: "hidden", cursor: hotpointMode ? "crosshair" : "default", border: hotpointMode ? "2px solid #FF5C00" : "2px solid transparent", transition: "border-color 0.2s" }}>
                      <img
                        ref={imgRef}
                        src={editing.src}
                        alt="preview"
                        onClick={handleImageClick}
                        style={{ maxWidth: "100%", maxHeight: "340px", objectFit: "contain", display: "block" }}
                      />
                      {(editing.hotpoints || []).map((hp, i) => (
                        <div
                          key={i}
                          title={hp.label}
                          style={{
                            position: "absolute",
                            left: `${hp.x}%`,
                            top: `${hp.y}%`,
                            transform: "translate(-50%, -50%)",
                            width: "22px",
                            height: "22px",
                            background: "#FF5C00",
                            borderRadius: "50%",
                            border: "2px solid #fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "10px",
                            fontWeight: 900,
                            color: "#fff",
                            cursor: "pointer",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
                            zIndex: 10,
                          }}
                          onClick={(e) => { e.stopPropagation(); removeHotpoint(i); }}
                          title={`${hp.label} — kliknij aby usunąć`}
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hotpoint list */}
                {(editing.hotpoints || []).length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {editing.hotpoints.map((hp, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "8px", padding: "8px 12px"
                      }}>
                        <span style={{ background: "#FF5C00", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 900, flexShrink: 0 }}>{i + 1}</span>
                        <input
                          className="admin-input"
                          value={hp.label}
                          onChange={e => {
                            const hps = [...editing.hotpoints];
                            hps[i] = { ...hps[i], label: e.target.value };
                            setEditing(p => ({ ...p, hotpoints: hps }));
                          }}
                          style={{ flex: 1 }}
                        />
                        <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px", whiteSpace: "nowrap" }}>
                          {hp.x.toFixed(1)}%, {hp.y.toFixed(1)}%
                        </span>
                        <button onClick={() => removeHotpoint(i)} style={{ background: "none", border: "none", color: "#ff4444", cursor: "pointer", fontSize: "16px", padding: 0 }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "12px", marginTop: "28px", justifyContent: "flex-end" }}>
              <button className="btn-ghost" onClick={() => { setShowForm(false); setEditing(null); }}>Anuluj</button>
              <button className="btn-orange" onClick={handleSave} disabled={saving}>
                {saving ? "Zapisywanie..." : "Zapisz"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}