// ── Google Analytics 4 — Event Tracking Module ─────────────────────────────
// Centralized wrapper for GA4 gtag() calls.
// Only fires events in production to keep dev data clean.

const GA_MEASUREMENT_ID = 'G-7QZ0TLMLBW';

// Type-safe gtag reference
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

function isProduction(): boolean {
  try {
    return import.meta.env.PROD === true;
  } catch {
    // Fallback: check hostname
    return typeof window !== 'undefined' && window.location.hostname !== 'localhost';
  }
}

/**
 * Send a custom event to GA4.
 * In development, logs to console instead.
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): void {
  const eventData = { ...params, send_to: GA_MEASUREMENT_ID };

  if (!isProduction()) {
    console.log(`[Analytics] ${eventName}`, eventData);
    return;
  }

  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, eventData);
  }
}

// ── Pre-defined Event Helpers ───────────────────────────────────────────────

/** User submitted the analysis form */
export function trackFormSubmit(ubicacion: string): void {
  trackEvent('form_submit', {
    event_category: 'conversion',
    event_label: ubicacion,
  });
}

/** Captcha verification succeeded */
export function trackCaptchaSolved(): void {
  trackEvent('captcha_solved', {
    event_category: 'security',
  });
}

/** All 3 analysis cards loaded successfully */
export function trackAnalysisComplete(): void {
  trackEvent('analysis_complete', {
    event_category: 'conversion',
  });
}

/** Individual analysis card loaded */
export function trackCardLoaded(cardName: string, success: boolean): void {
  trackEvent('card_loaded', {
    event_category: 'engagement',
    card_name: cardName,
    success,
  });
}

/** User clicked the PDF download button */
export function trackPDFDownload(): void {
  trackEvent('pdf_download', {
    event_category: 'conversion',
  });
}

/** User clicked "Nuevo análisis" (back button) */
export function trackNewAnalysis(): void {
  trackEvent('new_analysis_click', {
    event_category: 'engagement',
  });
}
