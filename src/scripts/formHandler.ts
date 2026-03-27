import type {
  PreguntasRequest,
  FodaZonaResponse,
  ProductoEstrategiaResponse,
  PasosPresupuestoResponse,
} from '../types/api';
import { ApiError } from '../types/api';
import {
  fetchFodaZona,
  fetchProductoEstrategia,
  fetchPasosPresupuesto,
} from '../services/apiService';

// ── Validation Helpers ─────────────────────────────────────────────────────

const VALIDATORS: Record<string, (v: string) => string | null> = {
  ubicacion: (v) => {
    if (!v.trim()) return 'Indica la ciudad o región donde operarás.';
    if (v.trim().length < 3) return 'Ingresa una ubicación válida.';
    return null;
  },
  producto: (v) => {
    if (!v.trim()) return 'Describe el producto o servicio.';
    if (v.trim().length < 40) return 'Por favor, describe tu producto con al menos 40 caracteres.';
    return null;
  },
  necesidad: (v) => {
    if (!v.trim()) return 'Explica qué necesidad o problema resuelve.';
    if (v.trim().length < 40) return 'Por favor, brinda más detalle (mínimo 40 caracteres).';
    return null;
  },
  publico: (v) => {
    if (!v.trim()) return 'Define a quién va dirigido tu producto.';
    if (v.trim().length < 5) return 'Sé más específico sobre tu público objetivo.';
    return null;
  },
  pagos: (v) => {
    if (!v.trim()) return 'Indica los medios de pago que aceptarás.';
    return null;
  },
  contexto: () => null, // Optional
};

function showError(fieldName: string, message: string): void {
  const group = document.querySelector<HTMLElement>(`[data-field="${fieldName}"]`);
  const errEl = document.getElementById(`q-${fieldName}-error`);
  const input = document.getElementById(`q-${fieldName}`);
  if (!group || !errEl || !input) return;
  errEl.textContent = message;
  errEl.classList.remove('hidden');
  group.dataset.state = 'error';
  input.setAttribute('aria-invalid', 'true');
}

function clearError(fieldName: string): void {
  const group = document.querySelector<HTMLElement>(`[data-field="${fieldName}"]`);
  const errEl = document.getElementById(`q-${fieldName}-error`);
  const input = document.getElementById(`q-${fieldName}`);
  if (!group || !errEl || !input) return;
  errEl.textContent = '';
  errEl.classList.add('hidden');
  delete group.dataset.state;
  input.setAttribute('aria-invalid', 'false');
}

function markValid(fieldName: string): void {
  const group = document.querySelector<HTMLElement>(`[data-field="${fieldName}"]`);
  if (!group) return;
  group.dataset.state = 'valid';
}

function validateField(name: string, value: string): boolean {
  const validator = VALIDATORS[name];
  if (!validator) return true;
  const err = validator(value);
  if (err) {
    showError(name, err);
    return false;
  }
  clearError(name);
  if (name !== 'contexto' || value.trim().length > 0) {
    markValid(name);
  }
  return true;
}

// ── DOM Helpers for Cards ──────────────────────────────────────────────────

function showSkeleton(cardId: string): void {
  document.getElementById(`skeleton-${cardId}`)?.classList.remove('hidden');
  document.getElementById(`error-${cardId}`)?.classList.add('hidden');
  document.getElementById(`content-${cardId}`)?.classList.add('hidden');
}

function showCardError(cardId: string, msg: string): void {
  document.getElementById(`skeleton-${cardId}`)?.classList.add('hidden');
  document.getElementById(`content-${cardId}`)?.classList.add('hidden');
  const errEl = document.getElementById(`error-${cardId}`);
  const msgEl = document.getElementById(`error-${cardId}-msg`);
  if (errEl) errEl.classList.remove('hidden');
  if (msgEl) msgEl.textContent = msg;
}

function showCardContent(cardId: string): void {
  document.getElementById(`skeleton-${cardId}`)?.classList.add('hidden');
  document.getElementById(`error-${cardId}`)?.classList.add('hidden');
  document.getElementById(`content-${cardId}`)?.classList.remove('hidden');
}

function setText(id: string, text: string): void {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setList(id: string, items: string[]): void {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = items
    .map((item) => `<li>${escHtml(item)}</li>`)
    .join('');
}

function escHtml(s: string): string {
  if (!s) return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Render Functions ───────────────────────────────────────────────────────

function renderFodaZona(data: FodaZonaResponse): void {
  const { analisisFODA, analisisZona } = data.analisis;

  const renderFodaList = (id: string, items: Array<{ keyword: string; descripcion: string }>) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = items
      .map(
        (item) =>
          `<li><span class="foda-keyword">${escHtml(item.keyword)}:</span> <span class="foda-desc">${escHtml(item.descripcion)}</span></li>`,
      )
      .join('');
  };

  renderFodaList('foda-fortalezas', analisisFODA.fortalezas);
  renderFodaList('foda-oportunidades', analisisFODA.oportunidades);
  renderFodaList('foda-debilidades', analisisFODA.debilidades);
  renderFodaList('foda-amenazas', analisisFODA.amenazas);

  setText('zona-descripcion', analisisZona.descripcion);
  setList('zona-ventajas', analisisZona.ventajas);
  setList('zona-desventajas', analisisZona.desventajas);
  setText('zona-recomendacion', analisisZona.recomendaciones);

  setText('foda-modelo', data.modelo);
  showCardContent('foda');
}

function renderProductoEstrategia(data: ProductoEstrategiaResponse): void {
  const { analisisProducto, estrategiasClave } = data.analisis;

  setText('producto-propuesta', analisisProducto.propuestaValor);
  setText('producto-descripcion', analisisProducto.descripcion);
  setText('producto-publico', analisisProducto.publicoObjetivo);

  const difEl = document.getElementById('producto-diferenciadores');
  if (difEl) {
    difEl.innerHTML = analisisProducto.diferenciadores
      .map((d) => `<li>${escHtml(d)}</li>`)
      .join('');
  }

  setList('estrategia-corto', estrategiasClave.corto_plazo);
  setList('estrategia-mediano', estrategiasClave.mediano_plazo);
  setList('estrategia-largo', estrategiasClave.largo_plazo);

  setText('producto-modelo', data.modelo);
  showCardContent('producto');
}

function renderPasosPresupuesto(data: PasosPresupuestoResponse): void {
  const { pasos, rango_presupuesto_total } = data.analisis;

  setText('pasos-total', rango_presupuesto_total);
  setText('pasos-modelo', data.modelo);

  const listaEl = document.getElementById('pasos-lista');
  if (listaEl) {
    listaEl.innerHTML = pasos
      .map((paso, i) => {
        return `
        <li class="paso-item">
          <header class="paso-header-row">
            <span class="paso-number">PASO ${i + 1}</span>
            <div class="paso-phase">${escHtml(paso.fase)}</div>
            <h3 class="paso-nombre">${escHtml(paso.paso)}</h3>
            <div class="paso-divider" aria-hidden="true"></div>
          </header>

          <div class="paso-data-grid">
            <div class="data-row">
              <span class="data-key">Descripción detallada</span>
              <div class="data-value">${escHtml(paso.descripcionDetallada)}</div>
            </div>
            
            <div class="data-row highlight">
              <span class="data-key">Presupuesto Estimado</span>
              <div class="data-value">Costo: ${escHtml(paso.presupuestoEstimado)}</div>
            </div>
            
            <div class="data-row">
              <span class="data-key">Justificación</span>
              <div class="data-value">${escHtml(paso.justificacionCostos)}</div>
            </div>

            <div class="data-row">
              <span class="data-key">Contexto local y leyes</span>
              <div class="data-value">${escHtml(paso.contextoLocalYLeyes)}</div>
            </div>
          </div>

          <div class="paso-spacer" aria-hidden="true"></div>
        </li>`;
      })
      .join('');
  }

  showCardContent('pasos');
}

// ── Initialization ─────────────────────────────────────────────────────────

export function initFormHandler() {
  const form = document.getElementById('emprendimiento-form') as HTMLFormElement;
  if (!form) return;

  const inputView = document.getElementById('input-view')!;
  const btnLoader = document.getElementById('btn-loader')!;
  const btnText = document.getElementById('btn-text')!;
  const btnIcon = document.getElementById('btn-icon')!;
  const resultsSection = document.getElementById('results-section')!;
  const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;
  const backBtn = document.getElementById('back-to-form')!;

  // Character counters
  function setupCounter(inputId: string, counterId: string, max: number): void {
    const input = document.getElementById(inputId) as HTMLTextAreaElement | null;
    const counter = document.getElementById(counterId);
    if (!input || !counter) return;
    input.addEventListener('input', () => {
      const len = input.value.length;
      counter.textContent = `${len} / ${max}`;
      counter.dataset.warn = len > max * 0.85 ? 'true' : 'false';
    });
  }

  setupCounter('q-producto', 'q-producto-counter', 300);
  setupCounter('q-necesidad', 'q-necesidad-counter', 300);
  setupCounter('q-contexto', 'q-contexto-counter', 1000);

  // Blur validation
  const FIELDS = ['ubicacion', 'producto', 'necesidad', 'publico', 'pagos', 'contexto'] as const;
  FIELDS.forEach((name) => {
    const el = document.getElementById(`q-${name}`);
    el?.addEventListener('blur', (e) => {
      const val = (e.target as HTMLInputElement | HTMLTextAreaElement).value;
      if (name !== 'contexto') validateField(name, val);
    });
    el?.addEventListener('input', (e) => {
      const val = (e.target as HTMLInputElement | HTMLTextAreaElement).value;
      const group = document.querySelector<HTMLElement>(`[data-field="${name}"]`);
      if (group?.dataset.state === 'error') validateField(name, val);
    });
  });

  // Listen to captcha events
  document.addEventListener('captcha-solved', () => {
    submitBtn.disabled = false;
    btnText.textContent = 'Analizar mi idea ahora';
  });

  function validateAll(): boolean {
    let allValid = true;
    for (const name of FIELDS) {
      const el = document.getElementById(`q-${name}`) as HTMLInputElement | HTMLTextAreaElement | null;
      const val = el?.value ?? '';
      if (!validateField(name, val)) allValid = false;
    }
    
    const captcha = document.getElementById('main-captcha') as any;
    if (!captcha || !captcha.isSolved) {
      captcha?.showError?.();
      const wrapper = captcha?.querySelector('.captcha-wrapper');
      if (wrapper) {
        wrapper.classList.add('shake');
        wrapper.addEventListener('animationend', () => wrapper.classList.remove('shake'), { once: true });
      }
      allValid = false;
    }
    
    return allValid;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    if (isCooldownActive()) return;

    const getValue = (id: string) =>
      (document.getElementById(`q-${id}`) as HTMLInputElement | HTMLTextAreaElement).value.trim();

    const ubicacion = getValue('ubicacion');
    const producto  = getValue('producto');
    const necesidad = getValue('necesidad');
    const publico   = getValue('publico');
    const pagos     = getValue('pagos');
    const contexto  = getValue('contexto');

    const respuestasCliente: string[] = [
      `¿Cuál es el producto o servicio que vas a ofrecer?: ${producto}`,
      `¿Qué necesidad va a satisfacer o problema logra resolver?: ${necesidad}`,
      `¿A quién va dirigido?: ${publico}`,
      `Medios de pago de los clientes: ${pagos}`
    ];

    const req: PreguntasRequest = {
      ubicacion: ubicacion,
      respuestasCliente: respuestasCliente,
      contexto: contexto || undefined,
    };

    submitBtn.disabled = true;
    btnText.classList.add("hidden");
    btnIcon.classList.add("hidden");
    btnLoader.classList.remove("hidden");

    // Save timestamp on start of analysis
    localStorage.setItem('last_analysis_timestamp', Date.now().toString());

    // Switch views
    inputView.classList.add('hidden');
    resultsSection.classList.remove('hidden');
    
    showSkeleton('foda');
    showSkeleton('producto');
    showSkeleton('pasos');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    const [fodaResult, productoResult, pasosResult] = await Promise.allSettled([
      fetchFodaZona(req),
      fetchProductoEstrategia(req),
      fetchPasosPresupuesto(req),
    ]);

    if (fodaResult.status === 'fulfilled') {
      renderFodaZona(fodaResult.value);
    } else {
      showCardError('foda', fodaResult.reason instanceof ApiError ? fodaResult.reason.message : 'Error de conexión.');
    }

    if (productoResult.status === 'fulfilled') {
      renderProductoEstrategia(productoResult.value);
    } else {
      showCardError('producto', productoResult.reason instanceof ApiError ? productoResult.reason.message : 'Error de conexión.');
    }

    if (pasosResult.status === 'fulfilled') {
      renderPasosPresupuesto(pasosResult.value);
    } else {
      showCardError('pasos', pasosResult.reason instanceof ApiError ? pasosResult.reason.message : 'Error de conexión.');
    }

    submitBtn.disabled = false;
    btnText.classList.remove('hidden');
    btnIcon.classList.remove('hidden');
    btnLoader.classList.add('hidden');
  });

  backBtn.addEventListener("click", () => {

    form.reset();
    document.querySelectorAll('.q-group').forEach(group => {
      delete (group as HTMLElement).dataset.state;
    });
    
    document.getElementById('q-producto-counter')!.textContent = '0 / 300';
    document.getElementById('q-necesidad-counter')!.textContent = '0 / 300';
    document.getElementById('q-contexto-counter')!.textContent = '0 / 1000';

    resultsSection.classList.add('hidden');
    inputView.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateCooldownUI();
  });

  // ── Cooldown UI Logic ──────────────────────────────────────────────────
  const cooldownContainer = document.getElementById('cooldown-container');
  const cooldownMessage = document.getElementById('cooldown-message');
  const COOLDOWN_TIME = 3 * 60 * 1000;
  let cooldownInterval: number | null = null;

  function isCooldownActive(): boolean {
    if (import.meta.env.DEV) return false;
    const lastAnalysis = localStorage.getItem("last_analysis_timestamp");
    if (!lastAnalysis) return false;
    const elapsed = Date.now() - parseInt(lastAnalysis, 10);
    return elapsed < COOLDOWN_TIME;
  }

  function updateCooldownUI() {
    if (!cooldownContainer || !cooldownMessage) return;
    if (import.meta.env.DEV) {
      cooldownContainer.classList.add('hidden');
      return;
    }

    const lastAnalysis = localStorage.getItem("last_analysis_timestamp");
    if (!lastAnalysis) {
      cooldownContainer.classList.add('hidden');
      submitBtn.disabled = !document.getElementById('main-captcha')?.['isSolved'];
      return;
    }

    const elapsed = Date.now() - parseInt(lastAnalysis, 10);

    if (elapsed < COOLDOWN_TIME) {
      const remainingSeconds = Math.ceil((COOLDOWN_TIME - elapsed) / 1000);
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
      
      cooldownContainer.classList.remove('hidden');
      cooldownMessage.textContent = `Espera ${minutes}:${seconds.toString().padStart(2, "0")} minutos para realizar un nuevo análisis.`;
      submitBtn.disabled = true;

      if (!cooldownInterval) {
        cooldownInterval = window.setInterval(updateCooldownUI, 1000);
      }
    } else {
      cooldownContainer.classList.add('hidden');
      if (cooldownInterval) {
        clearInterval(cooldownInterval);
        cooldownInterval = null;
      }
      // Re-enable button if captcha is solved
      const captcha = document.getElementById('main-captcha') as any;
      if (captcha?.isSolved) {
        submitBtn.disabled = false;
        btnText.textContent = 'Analizar mi idea ahora';
      }
    }
  }

  // Initial check
  updateCooldownUI();
}
