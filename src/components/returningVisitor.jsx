// Returning visitor tracking via localStorage
const STORAGE_KEY = "spogle_visitor";

function getVisitorData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveVisitorData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // silently fail
  }
}

export function recordVisit() {
  const existing = getVisitorData() || {
    visit_count: 0,
    first_visit: new Date().toISOString(),
    last_visit: null,
    last_segments: [],
    last_slides: [],
    form_opened: false,
  };
  existing.visit_count += 1;
  existing.last_visit = new Date().toISOString();
  saveVisitorData(existing);
  return existing;
}

export function getVisitCount() {
  const data = getVisitorData();
  return data?.visit_count || 0;
}

export function isReturningVisitor() {
  return getVisitCount() >= 3;
}

export function saveLastSelection(segmentIds, slideIds) {
  const data = getVisitorData();
  if (!data) return;
  data.last_segments = [...segmentIds];
  data.last_slides = [...slideIds];
  saveVisitorData(data);
}

export function getLastSelection() {
  const data = getVisitorData();
  if (!data) return { segments: [], slides: [] };
  return {
    segments: data.last_segments || [],
    slides: data.last_slides || [],
  };
}

export function markFormOpened() {
  const data = getVisitorData();
  if (!data) return;
  data.form_opened = true;
  saveVisitorData(data);
}

export function hadFormOpened() {
  const data = getVisitorData();
  return data?.form_opened || false;
}

export const DISCOUNT_CODE = "WRACAM10";