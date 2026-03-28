import gsap from 'gsap';

// ── GSAP Defaults ──────────────────────────────────────────────────────────
// force3D: true ensures GPU acceleration is always active for transforms
gsap.defaults({ duration: 0.6, ease: 'power2.out', force3D: true });

// ── Selector Cache ─────────────────────────────────────────────────────────
// Caching elements prevents repeated DOM queries during transitions
const cache = {
  navbar: null as HTMLElement | null,
  heroBadge: null as HTMLElement | null,
  heroTitle: null as HTMLElement | null,
  heroSubtitle: null as HTMLElement | null,
  formCard: null as HTMLElement | null,
  formNotice: null as HTMLElement | null,
  formFooter: null as HTMLElement | null,
  inputView: null as HTMLElement | null,
  resultsSection: null as HTMLElement | null,
  resultsTitle: null as HTMLElement | null,
  resultsSubtitle: null as HTMLElement | null,
};

function updateCache() {
  cache.navbar = document.querySelector('[data-animate="navbar"]');
  cache.heroBadge = document.querySelector('[data-animate="hero-badge"]');
  cache.heroTitle = document.querySelector('[data-animate="hero-title"]');
  cache.heroSubtitle = document.querySelector('[data-animate="hero-subtitle"]');
  cache.formCard = document.querySelector('[data-animate="form-card"]');
  cache.formNotice = document.querySelector('[data-animate="form-notice"]');
  cache.formFooter = document.querySelector('[data-animate="form-footer"]');
  cache.inputView = document.getElementById('input-view');
  cache.resultsSection = document.getElementById('results-section');
  cache.resultsTitle = document.querySelector('[data-animate="results-title"]');
  cache.resultsSubtitle = document.querySelector('[data-animate="results-subtitle"]');
}

// ── Responsive + Reduced Motion ────────────────────────────────────────────
const mm = gsap.matchMedia();
let motionEnabled = true;

mm.add(
  {
    full: '(prefers-reduced-motion: no-preference)',
    reduced: '(prefers-reduced-motion: reduce)',
  },
  (ctx) => {
    const { reduced } = ctx.conditions!;
    motionEnabled = !reduced;
  }
);

function dur(seconds: number): number {
  return motionEnabled ? seconds : 0;
}

// ── Page Entrance ──────────────────────────────────────────────────────────

export function initPageEntrance(): void {
  updateCache();
  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

  // Consolidate initial states to reduce layout writes
  const fadeUpTargets = [
    cache.heroTitle, cache.heroSubtitle, cache.formCard, 
    cache.formNotice, cache.formFooter
  ].filter(Boolean);

  gsap.set(cache.navbar, { autoAlpha: 0, y: -16 });
  gsap.set(cache.heroBadge, { autoAlpha: 0, scale: 0.85 });
  gsap.set(fadeUpTargets, { autoAlpha: 0, y: 20 });
  gsap.set('.q-group', { autoAlpha: 0, y: 20 });

  // Build timeline using cached elements
  tl.to(cache.navbar, { autoAlpha: 1, y: 0, duration: dur(0.5) })
    .to(cache.heroBadge, { autoAlpha: 1, scale: 1, duration: dur(0.45) }, '-=0.25')
    .to(cache.heroTitle, { autoAlpha: 1, y: 0, duration: dur(0.6) }, '-=0.2')
    .to(cache.heroSubtitle, { autoAlpha: 1, y: 0, duration: dur(0.5) }, '-=0.3')
    .to(cache.formCard, { autoAlpha: 1, y: 0, duration: dur(0.55) }, '-=0.2')
    .to(cache.formNotice, { autoAlpha: 1, y: 0, duration: dur(0.4) }, '-=0.25')
    .to('.q-group', {
      autoAlpha: 1, y: 0, duration: dur(0.4),
      stagger: dur(0.08),
    }, '-=0.15')
    .to(cache.formFooter, { autoAlpha: 1, y: 0, duration: dur(0.45) }, '-=0.15');
}

// ── Form → Results Transition ──────────────────────────────────────────────

export function animateToResults(): Promise<void> {
  return new Promise((resolve) => {
    if (!cache.inputView || !cache.resultsSection) {
      updateCache();
      if (!cache.inputView || !cache.resultsSection) { resolve(); return; }
    }

    const tl = gsap.timeline({
      onComplete: resolve,
      defaults: { ease: 'power3.inOut' },
    });

    // Form exits
    tl.to(cache.inputView, {
      autoAlpha: 0, y: -20, scale: 0.98, duration: dur(0.4),
      onComplete: () => cache.inputView?.classList.add('hidden'),
    });

    // Results section enters
    tl.call(() => {
      cache.resultsSection?.classList.remove('hidden');
      gsap.set(cache.resultsSection, { autoAlpha: 0, y: 30 });
    });

    tl.to(cache.resultsSection, {
      autoAlpha: 1, y: 0, duration: dur(0.5), ease: 'power2.out',
    });

    tl.from([cache.resultsTitle, cache.resultsSubtitle], {
      autoAlpha: 0, y: 15, duration: dur(0.4), stagger: dur(0.1),
    }, '-=0.2');

    tl.from('.card-section', {
      autoAlpha: 0, y: 40, duration: dur(0.45), stagger: dur(0.12), ease: 'power2.out',
    }, '-=0.15');
  });
}

// ── Card Content Reveal ────────────────────────────────────────────────────

export function animateCardReveal(cardId: string): void {
  const skeleton = document.getElementById(`skeleton-${cardId}`);
  const content = document.getElementById(`content-${cardId}`);
  if (!skeleton || !content) return;

  const tl = gsap.timeline();

  tl.to(skeleton, {
    autoAlpha: 0, scale: 0.95, duration: dur(0.3), ease: 'power2.in',
    onComplete: () => skeleton.classList.add('hidden'),
  });

  tl.call(() => {
    content.classList.remove('hidden');
    gsap.set(content, { autoAlpha: 0, y: 15 });
  });

  tl.to(content, {
    autoAlpha: 1, y: 0, duration: dur(0.45), ease: 'power2.out',
  });

  const innerEls = content.querySelectorAll('[data-animate="card-inner"]');
  if (innerEls.length > 0) {
    tl.from(innerEls, {
      autoAlpha: 0, y: 12, duration: dur(0.3), stagger: dur(0.06), ease: 'power2.out',
    }, '-=0.2');
  }
}

// ── PDF Button Reveal ──────────────────────────────────────────────────────

export function animatePDFButton(): void {
  const btn = document.getElementById('download-pdf');
  if (!btn) return;

  btn.style.display = 'flex';
  gsap.from(btn, {
    autoAlpha: 0, scale: 0.5, duration: dur(0.5), ease: 'back.out(1.7)',
  });
}

// ── Results → Form (Back Button) ───────────────────────────────────────────

export function animateBackToForm(): Promise<void> {
  return new Promise((resolve) => {
    if (!cache.inputView || !cache.resultsSection) {
      updateCache();
      if (!cache.inputView || !cache.resultsSection) { resolve(); return; }
    }

    const tl = gsap.timeline({
      onComplete: resolve,
      defaults: { ease: 'power2.inOut' },
    });

    tl.to(cache.resultsSection, {
      autoAlpha: 0, y: 20, duration: dur(0.35),
      onComplete: () => {
        cache.resultsSection?.classList.add('hidden');
        gsap.set(cache.resultsSection, { clearProps: 'all' });
      },
    });

    tl.call(() => {
      cache.inputView?.classList.remove('hidden');
      gsap.set(cache.inputView, { autoAlpha: 0, y: 20, scale: 0.98 });
    });

    tl.to(cache.inputView, {
      autoAlpha: 1, y: 0, scale: 1, duration: dur(0.45), ease: 'power2.out',
    });

    tl.from('.q-group', {
      autoAlpha: 0, y: 14, duration: dur(0.3), stagger: dur(0.06), ease: 'power2.out',
    }, '-=0.2');
  });
}

// ── Card Skeleton Entrance (initial) ───────────────────────────────────────

export function animateSkeletonEntrance(): void {
  gsap.from('.skeleton-state:not(.hidden)', {
    autoAlpha: 0, y: 20, duration: dur(0.35), stagger: dur(0.1), ease: 'power2.out',
  });
}
