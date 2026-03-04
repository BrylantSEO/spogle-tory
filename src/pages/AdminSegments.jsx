import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const SEGMENT_IDS = ["tor12", "tor20", "tor27", "tor28", "atomic-drop", "duo"];
const PRESET_IDS = ["legia", "tor4u", "gigant"];
const PRESET_NAMES = { legia: "Set LEGIA", tor4u: "Set Tor4U", gigant: "Tor Gigant" };
const DEFAULT_NAMES = {
  "tor12": "Tor 12m",
  "tor20": "Tor 20m",
  "tor27": "Tor 27m",
  "tor28": "Tor 28m",
  "atomic-drop": "Atomic Drop",
  "duo": "Zjeżdżalnia DUO",
};

export default function AdminSegments() {
  const [segments, setSegments] = useState({});
  const [presets, setPresets] = useState({});
  const [editing, setEditing] = useState(null); // segment_id
  const [editingPreset, setEditingPreset] = useState(null); // preset set_id
  const [form, setForm] = useState({});
  const [presetForm, setPresetForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("segments"); // "segments" | "presets"

  useEffect(() => {
    loadSegments();
    loadPresets();
  }, []);

  const loadSegments = async () => {
    const data = await base44.entities.TrackSegment.list();
    const map = {};
    data.forEach(s => { map[s.segment_id] = s; });
    setSegments(map);
  };

  const loadPresets = async () => {
    const data = await base44.entities.PresetSet.list();
    const map = {};
    data.forEach(p => { map[p.set_id] = p; });
    setPresets(map);
  };

  const openEdit = (segId) => {
    const existing = segments[segId] || {};
    setForm({
      segment_id: segId,
      name: existing.name || DEFAULT_NAMES[segId] || segId,
      description: existing.description || "",
      cover_image: existing.cover_image || "",
      gallery_images: existing.gallery_images || [],
      promo_video_url: existing.promo_video_url || "",
      price_3h: existing.price_3h || "",
      price_4h: existing.price_4h || "",
      price_5h: existing.price_5h || "",
      price_6h: existing.price_6h || "",
      price_8h: existing.price_8h || "",
      id: existing.id || null,
    });
    setEditing(segId);
    setNewGalleryUrl("");
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      segment_id: form.segment_id,
      name: form.name,
      description: form.description,
      cover_image: form.cover_image,
      gallery_images: form.gallery_images,
      promo_video_url: form.promo_video_url || null,
      price_3h: form.price_3h ? Number(form.price_3h) : null,
      price_4h: form.price_4h ? Number(form.price_4h) : null,
      price_5h: form.price_5h ? Number(form.price_5h) : null,
      price_6h: form.price_6h ? Number(form.price_6h) : null,
      price_8h: form.price_8h ? Number(form.price_8h) : null,
    };
    if (form.id) {
      await base44.entities.TrackSegment.update(form.id, payload);
    } else {
      await base44.entities.TrackSegment.create(payload);
    }
    await loadSegments();
    setSaving(false);
    setEditing(null);
  };

  const addGalleryUrl = () => {
    if (!newGalleryUrl.trim()) return;
    setForm(f => ({ ...f, gallery_images: [...(f.gallery_images || []), newGalleryUrl.trim()] }));
    setNewGalleryUrl("");
  };

  const removeGalleryImg = (idx) => {
    setForm(f => ({ ...f, gallery_images: f.gallery_images.filter((_, i) => i !== idx) }));
  };

  const setCoverFromGallery = (url) => {
    setForm(f => ({ ...f, cover_image: url }));
  };

  const handleFileUpload = async (e, target) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    if (target === "cover") {
      setForm(f => ({ ...f, cover_image: file_url }));
    } else {
      setForm(f => ({ ...f, gallery_images: [...(f.gallery_images || []), file_url] }));
    }
    setUploading(false);
  };

  const openEditPreset = (setId) => {
    const existing = presets[setId] || {};
    setPresetForm({
      set_id: setId,
      name: existing.name || PRESET_NAMES[setId] || setId,
      image: existing.image || "",
      price_label: existing.price_label || "",
      id: existing.id || null,
    });
    setEditingPreset(setId);
  };

  const handleSavePreset = async () => {
    setSaving(true);
    const payload = {
      set_id: presetForm.set_id,
      name: presetForm.name,
      image: presetForm.image,
      price_label: presetForm.price_label,
    };
    if (presetForm.id) {
      await base44.entities.PresetSet.update(presetForm.id, payload);
    } else {
      await base44.entities.PresetSet.create(payload);
    }
    await loadPresets();
    setSaving(false);
    setEditingPreset(null);
  };

  const handlePresetImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setPresetForm(f => ({ ...f, image: file_url }));
    setUploading(false);
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "8px",
    color: "#fff",
    padding: "10px 12px",
    fontSize: "14px",
    fontFamily: "sans-serif",
    width: "100%",
    outline: "none",
  };

  const labelStyle = {
    color: "rgba(255,255,255,0.45)",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "1.2px",
    fontFamily: "sans-serif",
    marginBottom: "5px",
    display: "block",
  };

  return (
    <div style={{ background: "#0f0f0f", minHeight: "100vh", color: "#fff", fontFamily: "sans-serif", padding: "40px 32px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ color: "#FF5C00", fontSize: "11px", fontWeight: 700, letterSpacing: "2.5px", marginBottom: "8px" }}>PANEL ADMINA</div>
        <h1 style={{ fontSize: "32px", fontWeight: 900, marginBottom: "32px" }}>Edycja segmentów toru</h1>

        {/* Segment list */}
        {!editing && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            {SEGMENT_IDS.map(segId => {
              const s = segments[segId];
              return (
                <div
                  key={segId}
                  onClick={() => openEdit(segId)}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1.5px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#FF5C00"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
                >
                  {s?.cover_image && (
                    <img src={s.cover_image} alt={s.name} style={{ width: "100%", height: "100px", objectFit: "cover", display: "block", opacity: 0.8 }} />
                  )}
                  {!s?.cover_image && (
                    <div style={{ height: "100px", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.2)", fontSize: "12px" }}>
                      Brak zdjęcia
                    </div>
                  )}
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{ fontWeight: 800, fontSize: "14px", marginBottom: "4px" }}>{s?.name || DEFAULT_NAMES[segId]}</div>
                    <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px" }}>
                      {s ? `${(s.gallery_images || []).length} zdjęć w galerii` : "Nie skonfigurowano"}
                    </div>
                    <div style={{ marginTop: "8px", color: "#FF5C00", fontSize: "12px", fontWeight: 700 }}>Edytuj →</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Edit form */}
        {editing && (
          <div>
            <button onClick={() => setEditing(null)} style={{ background: "rgba(255,255,255,0.07)", border: "none", borderRadius: "8px", color: "#fff", padding: "8px 16px", cursor: "pointer", marginBottom: "24px", fontSize: "13px", fontFamily: "sans-serif" }}>
              ← Wróć do listy
            </button>

            <h2 style={{ fontSize: "22px", fontWeight: 900, marginBottom: "24px" }}>{form.name}</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Name */}
              <div>
                <label style={labelStyle}>NAZWA</label>
                <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>OPIS</label>
                <textarea
                  style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>

              {/* Cover image */}
              <div>
                <label style={labelStyle}>ZDJĘCIE GŁÓWNE (na karcie)</label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input style={{ ...inputStyle, flex: 1 }} value={form.cover_image} onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))} placeholder="URL zdjęcia..." />
                  <label style={{ background: "#FF5C00", color: "#fff", borderRadius: "8px", padding: "10px 14px", cursor: "pointer", fontSize: "12px", fontWeight: 700, fontFamily: "sans-serif", whiteSpace: "nowrap" }}>
                    {uploading ? "..." : "Wgraj plik"}
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFileUpload(e, "cover")} />
                  </label>
                </div>
                {form.cover_image && (
                  <img src={form.cover_image} alt="cover" style={{ marginTop: "10px", height: "120px", objectFit: "cover", borderRadius: "8px", display: "block" }} />
                )}
              </div>

              {/* Gallery images */}
              <div>
                <label style={labelStyle}>GALERIA ZDJĘĆ</label>
                <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    value={newGalleryUrl}
                    onChange={e => setNewGalleryUrl(e.target.value)}
                    placeholder="Wklej URL zdjęcia..."
                    onKeyDown={e => e.key === "Enter" && addGalleryUrl()}
                  />
                  <button onClick={addGalleryUrl} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "8px", color: "#fff", padding: "10px 16px", cursor: "pointer", fontFamily: "sans-serif", fontSize: "13px", fontWeight: 700, whiteSpace: "nowrap" }}>
                    Dodaj URL
                  </button>
                  <label style={{ background: "rgba(255,92,0,0.2)", border: "1px solid #FF5C00", color: "#FF5C00", borderRadius: "8px", padding: "10px 14px", cursor: "pointer", fontSize: "12px", fontWeight: 700, fontFamily: "sans-serif", whiteSpace: "nowrap" }}>
                    {uploading ? "..." : "Wgraj plik"}
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFileUpload(e, "gallery")} />
                  </label>
                </div>

                {(form.gallery_images || []).length === 0 && (
                  <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "13px" }}>Brak zdjęć w galerii</div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                  {(form.gallery_images || []).map((url, idx) => (
                    <div key={idx} style={{ position: "relative", borderRadius: "8px", overflow: "hidden", border: form.cover_image === url ? "2px solid #FF5C00" : "2px solid transparent" }}>
                      <img src={url} alt="" style={{ width: "100%", height: "80px", objectFit: "cover", display: "block" }} />
                      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", gap: "4px", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.opacity = 1}
                        onMouseLeave={e => e.currentTarget.style.opacity = 0}
                      >
                        <button onClick={() => setCoverFromGallery(url)} title="Ustaw jako główne" style={{ background: "#FF5C00", border: "none", borderRadius: "4px", color: "#fff", fontSize: "10px", padding: "4px 6px", cursor: "pointer", fontWeight: 700 }}>
                          Główne
                        </button>
                        <button onClick={() => removeGalleryImg(idx)} style={{ background: "rgba(220,50,50,0.8)", border: "none", borderRadius: "4px", color: "#fff", fontSize: "10px", padding: "4px 6px", cursor: "pointer", fontWeight: 700 }}>
                          Usuń
                        </button>
                      </div>
                      {form.cover_image === url && (
                        <div style={{ position: "absolute", top: "4px", left: "4px", background: "#FF5C00", color: "#fff", fontSize: "9px", fontWeight: 800, padding: "2px 5px", borderRadius: "3px" }}>GŁÓWNE</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Promo video */}
              <div>
                <label style={labelStyle}>FILM PROMOCYJNY (YouTube URL)</label>
                <input
                  style={inputStyle}
                  value={form.promo_video_url || ""}
                  onChange={e => setForm(f => ({ ...f, promo_video_url: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px", marginTop: "4px" }}>Będzie wyświetlany w modalu szczegółów toru.</div>
              </div>

              {/* Prices */}
              <div>
                <label style={labelStyle}>CENNIK (zł netto)</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
                  {[3, 4, 5, 6, 8].map(h => (
                    <div key={h}>
                      <label style={{ ...labelStyle, marginBottom: "3px" }}>{h}H</label>
                      <input
                        style={inputStyle}
                        type="number"
                        value={form[`price_${h}h`]}
                        onChange={e => setForm(f => ({ ...f, [`price_${h}h`]: e.target.value }))}
                        placeholder="—"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  background: "#FF5C00",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "14px",
                  fontSize: "15px",
                  fontWeight: 800,
                  fontFamily: "sans-serif",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? "Zapisywanie..." : "Zapisz zmiany"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}