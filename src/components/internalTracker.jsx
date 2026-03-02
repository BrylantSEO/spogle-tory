import { base44 } from "@/api/base44Client";

// In-memory session state
export const session = {
  id: null,           // db record id (for updates)
  session_id: null,
  started_at: null,
  max_scroll_depth: 0,
  device_type: null,
  screen_width: null,
  referrer: null,
  utm_source: null,
  utm_campaign: null,
  is_bot_suspected: false,
  bot_reason: null,
  total_clicks: 0,
  form_opened: false,
  form_submitted: false,
  // internal
  _startMs: null,
  _firstClickMs: null,
  _recentClicks: [],
};

function detectDevice(w) {
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function checkInitialBotReasons() {
  const reasons = [];
  if (navigator.webdriver === true) reasons.push("webdriver");
  if (window.innerWidth === 0) reasons.push("zero_width");
  if (!navigator.languages || navigator.languages.length === 0) reasons.push("no_languages");
  if (window.screen && window.screen.width === window.screen.height && window.screen.width > 0) reasons.push("square_screen");
  return reasons;
}

function applyBotReason(reason) {
  session.is_bot_suspected = true;
  session.bot_reason = session.bot_reason
    ? session.bot_reason + ", " + reason
    : reason;
  window.__spogle_is_bot = true;
}

function injectHoneypot() {
  const trap = document.createElement("div");
  trap.setAttribute("style", "position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;");
  trap.setAttribute("aria-hidden", "true");
  trap.setAttribute("tabindex", "-1");
  const link = document.createElement("a");
  link.href = "#";
  link.textContent = "Kliknij tutaj";
  link.addEventListener("click", (e) => {
    e.preventDefault();
    applyBotReason("honeypot");
  });
  trap.appendChild(link);
  document.body.appendChild(trap);
}

function getScrollPct() {
  const scrolled = window.scrollY + window.innerHeight;
  const total = document.documentElement.scrollHeight;
  if (!total) return 0;
  return Math.round((scrolled / total) * 100);
}

export async function initSession() {
  const params = new URLSearchParams(window.location.search);
  const w = window.innerWidth;

  session.session_id = crypto.randomUUID();
  session.started_at = new Date().toISOString();
  session._startMs = Date.now();
  session.device_type = detectDevice(w);
  session.screen_width = w;
  session.referrer = document.referrer || null;
  session.utm_source = params.get("utm_source") || null;
  session.utm_campaign = params.get("utm_campaign") || null;

  // Initial bot checks
  const initialReasons = checkInitialBotReasons();
  initialReasons.forEach(applyBotReason);

  // Scroll depth tracking
  const onScroll = () => {
    const pct = getScrollPct();
    if (pct > session.max_scroll_depth) session.max_scroll_depth = pct;
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  // Save initial record to DB
  try {
    const record = await base44.entities.PageSession.create({
      session_id: session.session_id,
      started_at: session.started_at,
      device_type: session.device_type,
      screen_width: session.screen_width,
      referrer: session.referrer,
      utm_source: session.utm_source,
      utm_campaign: session.utm_campaign,
      is_bot_suspected: session.is_bot_suspected,
      bot_reason: session.bot_reason,
      total_clicks: 0,
      segments_selected: 0,
      form_opened: false,
      form_submitted: false,
    });
    session.id = record.id;
  } catch (_) {
    // silently fail — tracking must never break the app
  }

  // Honeypot trap
  injectHoneypot();

  // End session on unload
  window.addEventListener("beforeunload", endSession);
}

export async function trackClick(eventName, data = {}) {
  const now = Date.now();
  session.total_clicks += 1;

  // First click timing — bot check
  if (session._firstClickMs === null) {
    session._firstClickMs = now;
    const timeSinceLoad = now - session._startMs;
    if (timeSinceLoad < 500) applyBotReason("too_fast");
  }

  // Click flood detection: >30 clicks in <10s
  session._recentClicks.push(now);
  session._recentClicks = session._recentClicks.filter(t => now - t < 10000);
  if (session._recentClicks.length > 30 && !session.bot_reason?.includes("click_flood")) {
    applyBotReason("click_flood");
  }

  try {
    await base44.entities.ClickEvent.create({
      session_id: session.session_id,
      event_name: eventName,
      event_data: JSON.stringify(data),
      clicked_at: new Date().toISOString(),
      time_since_load_seconds: parseFloat(((now - session._startMs) / 1000).toFixed(2)),
      scroll_position: getScrollPct(),
    });
  } catch (_) {
    // silently fail
  }
}

export async function endSession() {
  if (!session.id) return;
  const seconds = Math.round((Date.now() - session._startMs) / 1000);

  try {
    await base44.entities.PageSession.update(session.id, {
      ended_at: new Date().toISOString(),
      time_on_page_seconds: seconds,
      max_scroll_depth: session.max_scroll_depth,
      total_clicks: session.total_clicks,
      form_opened: session.form_opened,
      form_submitted: session.form_submitted,
      is_bot_suspected: session.is_bot_suspected,
      bot_reason: session.bot_reason,
    });
  } catch (_) {
    // silently fail
  }
}