// src/types/api.ts
// Contratos de tipos compartidos con el backend

// ─── Request ──────────────────────────────────────────────────────────────────

export interface PreguntasRequest {
  /** Respuestas del emprendedor al cuestionario (mín 1, máx 10) */
  respuestasCliente: string[];
  /** Contexto adicional del emprendimiento (opcional) */
  contexto?: string;
  /** Ubicación geográfica (opcional) */
  ubicacion?: string;
}

// ─── FODA ─────────────────────────────────────────────────────────────────────

export interface FODAItem {
  keyword: string;
  descripcion: string;
}

export interface AnalisisFODA {
  fortalezas: FODAItem[];
  oportunidades: FODAItem[];
  debilidades: FODAItem[];
  amenazas: FODAItem[];
}

// ─── Zona ─────────────────────────────────────────────────────────────────────

export interface AnalisisZona {
  descripcion: string;
  ventajas: string[];
  desventajas: string[];
  recomendaciones: string;
}

// ─── Producto ─────────────────────────────────────────────────────────────────

export interface AnalisisProducto {
  descripcion: string;
  propuestaValor: string;
  publicoObjetivo: string;
  diferenciadores: string[];
}

// ─── Estrategias ──────────────────────────────────────────────────────────────

export interface EstrategiasClave {
  corto_plazo: string[];
  mediano_plazo: string[];
  largo_plazo: string[];
}

// ─── Pasos ────────────────────────────────────────────────────────────────────

export interface PasoEmprendimiento {
  paso: string;
  fase: string;
  descripcionDetallada: string;
  presupuestoEstimado: string;
  justificacionCostos: string;
  contextoLocalYLeyes: string;
}

export interface AnalisisPasos {
  pasos: PasoEmprendimiento[];
  rango_presupuesto_total: string;
}

// ─── Responses específicas ────────────────────────────────────────────────────

export interface FodaZonaResponse {
  exito: true;
  analisis: {
    analisisFODA: AnalisisFODA;
    analisisZona: AnalisisZona;
  };
  modelo: string;
  timestamp: string;
}

export interface ProductoEstrategiaResponse {
  exito: true;
  analisis: {
    analisisProducto: AnalisisProducto;
    estrategiasClave: EstrategiasClave;
  };
  modelo: string;
  timestamp: string;
}

export interface PasosPresupuestoResponse {
  exito: true;
  analisis: AnalisisPasos;
  modelo: string;
  timestamp: string;
}

// ─── Error ────────────────────────────────────────────────────────────────────

export const GENERIC_ERROR_MESSAGES = {
  DEFAULT: 'Se ha producido un error al procesar la solicitud. Por favor, inténtalo de nuevo.',
  VALIDATION: 'Los datos proporcionados no son válidos. Por favor, revisa tus respuestas.',
  SECURITY: 'Se ha detectado un problema con la solicitud. Por favor, asegúrate de que el contenido sea apropiado.',
  OFF_TOPIC: 'El contenido proporcionado no parece estar relacionado con un emprendimiento o negocio.',
  UNAVAILABLE: 'El servicio de análisis no está disponible en este momento. Inténtalo más tarde.',
};

/** 
 * Detecta si un mensaje de error contiene términos sensibles de seguridad o técnicos 
 * y devuelve una versión genérica.
 */
export function getGenericMessage(originalMessage: string): string {
  const normalized = originalMessage.toLowerCase();
  
  // Palabras clave de seguridad / prompt injection (English & Spanish)
  if (
    normalized.includes('injection') || 
    normalized.includes('inyección') || 
    normalized.includes('prompt') || 
    normalized.includes('security') || 
    normalized.includes('seguridad') || 
    normalized.includes('threat') ||
    normalized.includes('amenaza') ||
    normalized.includes('sanitization') ||
    normalized.includes('sanitización') ||
    normalized.includes('exploit') ||
    normalized.includes('sql') ||
    normalized.includes('intento') ||
    normalized.includes('manipulación')
  ) {
    return GENERIC_ERROR_MESSAGES.SECURITY;
  }

  // Si el mensaje es muy técnico o vacío, dar el default
  if (!originalMessage || originalMessage.includes('Error HTTP') || originalMessage.includes('failed to fetch')) {
    return GENERIC_ERROR_MESSAGES.DEFAULT;
  }

  return originalMessage;
}

export interface ApiErrorResponse {
  exito: false;
  error: string;
  mensaje: string;
  timestamp: string;
}

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(getGenericMessage(message)); // Aplicamos la máscara aquí también por seguridad
    this.name = 'ApiError';
  }
}
