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
    super(message);
    this.name = 'ApiError';
  }
}
