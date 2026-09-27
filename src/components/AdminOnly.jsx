import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// Strony administracyjne tylko dla zalogowanego admina aplikacji.
// Dane chroni też RLS w encjach — to jest warstwa interfejsu (logowanie, komunikat).
export default function AdminOnly({ children }) {
  const [state, setState] = useState("loading");

  useEffect(() => {
    base44.auth
      .me()
      .then((user) => setState(user?.role === "admin" ? "ok" : "denied"))
      .catch(() => base44.auth.redirectToLogin(window.location.href));
  }, []);

  if (state === "loading") {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f0f0f", color: "#fff", fontFamily: "sans-serif", padding: 24 }}>
        <div style={{ maxWidth: 420, textAlign: "center", display: "flex", flexDirection: "column", gap: 16 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Brak dostępu</h1>
          <p style={{ color: "#bbb" }}>Ta strona jest tylko dla administratorów Spogle.</p>
          <button
            onClick={() => base44.auth.logout(window.location.href)}
            style={{ background: "#FF5C00", color: "#fff", border: 0, borderRadius: 8, padding: "12px 20px", fontWeight: 600, cursor: "pointer" }}
          >
            Zaloguj się na inne konto
          </button>
        </div>
      </div>
    );
  }

  return children;
}
