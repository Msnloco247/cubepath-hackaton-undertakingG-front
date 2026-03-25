// src/services/apiService.ts
// Cliente HTTP tipado para la API

import type {
  PreguntasRequest,
  FodaZonaResponse,
  ProductoEstrategiaResponse,
  PasosPresupuestoResponse,
  ApiErrorResponse,
} from '../types/api';
import { ApiError } from '../types/api';

const BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000/api/preguntas';

/** Realiza un POST tipado con reintentos y lanza ApiError si fallan todos */
async function post<T>(endpoint: string, body: PreguntasRequest, retries = 3): Promise<T> {
  let lastError: any;

  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = (await res.json()) as T | ApiErrorResponse;

      if (!res.ok || (data as ApiErrorResponse).exito === false) {
        const err = data as ApiErrorResponse;
        throw new ApiError(
          err.error ?? 'ERROR_DESCONOCIDO',
          err.mensaje ?? `Error HTTP ${res.status}`,
          res.status,
        );
      }

      return data as T;
    } catch (err) {
      lastError = err;
      // Si es un ApiError de negocio (4xx), no reintentamos
      if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
        throw err;
      }
      
      // Espera antes del próximo reintento (exponencial: 1s, 2s, 4s)
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }

  throw lastError;
}

export function fetchFodaZona(req: PreguntasRequest): Promise<FodaZonaResponse> {
  return post<FodaZonaResponse>('/foda-zona', req);
}

export function fetchProductoEstrategia(
  req: PreguntasRequest,
): Promise<ProductoEstrategiaResponse> {
  return post<ProductoEstrategiaResponse>('/producto-estrategia', req);
}

export function fetchPasosPresupuesto(
  req: PreguntasRequest,
): Promise<PasosPresupuestoResponse> {
  return post<PasosPresupuestoResponse>('/pasos-presupuesto', req);
}
