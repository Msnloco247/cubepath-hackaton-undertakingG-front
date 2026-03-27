import type { 
  FodaZonaResponse, 
  ProductoEstrategiaResponse, 
  PasosPresupuestoResponse 
} from './api';

export interface UserInputs {
  ubicacion: string;
  producto: string;
  necesidad: string;
  publico: string;
  pagos: string;
  contexto?: string;
}

export interface AnalysisData {
  inputs: UserInputs;
  fodaZona: FodaZonaResponse;
  productoEstrategia: ProductoEstrategiaResponse;
  pasosPresupuesto: PasosPresupuestoResponse;
  generatedAt: Date;
}
