/**
 * Returns seasonal context for a given date (or today if no date provided).
 * @param {string} [dateStr] - ISO date string (YYYY-MM-DD)
 * @returns {{ type: 'earlybird' | 'normal' | 'highseason' | null, banner: object | null }}
 */
export function getSeasonInfo(dateStr) {
  const date = dateStr ? new Date(dateStr) : new Date();
  if (isNaN(date.getTime())) return { type: null, banner: null };

  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  // March (3) and April (4) — early bird
  if (month === 3 || month === 4) {
    return {
      type: "earlybird",
      discountPercent: 10,
      banner: {
        icon: "🌱",
        title: "Ceny wiosenne — Early Bird",
        text: "Marzec i kwiecień to terminy z cenami wiosennymi. Rezerwując teraz zyskujesz 10% rabatu early bird od całości.",
        color: "#22c55e",
        bg: "rgba(34,197,94,0.08)",
        border: "rgba(34,197,94,0.3)",
      },
    };
  }

  // May 1–15 — normal, no banner
  if (month === 5 && day <= 15) {
    return { type: "normal", discountPercent: 0, banner: null };
  }

  // May 16 – June 30 — high season
  if ((month === 5 && day >= 16) || month === 6) {
    return {
      type: "highseason",
      discountPercent: 0,
      banner: {
        icon: "🔥",
        title: "Termin z wysokim obłożeniem",
        text: "Druga połowa maja i czerwiec to najbardziej oblegane terminy. Rekomendujemy szybkie potwierdzenie — dostępność jest ograniczona. Minimalny czas wynajmu toru: 5 godzin.",
        color: "#f97316",
        bg: "rgba(249,115,22,0.08)",
        border: "rgba(249,115,22,0.35)",
      },
    };
  }

  return { type: "normal", discountPercent: 0, banner: null };
}
