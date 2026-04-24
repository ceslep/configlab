export const BASE_URL = 'https://mycar.iedeoccidente.com';

export interface Procedimiento {
  ind: string;
  codigo: string;
  uuid: string;
  nombre: string;
  tabla: string;
  info: string;
  color: string;
  constante: string;
  constante2: string;
  unidades: string;
  tipo: string;
  tipoprocedimiento: string;
  abreviatura: string;
}

export const TABLAS = [
  'examen_tipo_1',
  'examen_tipo_2',
  'perfilLipidico',
  'parcialOrina',
  'coprologico',
  'hemogramaRayto',
] as const;

export const TABLAS_LABELS: Record<string, string> = {
  examen_tipo_1: 'Examen Tipo 1',
  examen_tipo_2: 'Examen Tipo 2',
  perfilLipidico: 'Perfil Lipídico',
  parcialOrina: 'Parcial de Orina',
  coprologico: 'Coprológico',
  hemogramaRayto: 'Hemograma Rayto',
};

export const TIPOS = ['1', '2', '3', '4', '5', '6', '8'] as const;

export const TIPOS_LABELS: Record<string, string> = {
  '1': 'Tipo 1',
  '2': 'Tipo 2',
  '3': 'Tipo 3',
  '4': 'Tipo 4',
  '5': 'Tipo 5',
  '6': 'Tipo 6',
  '8': 'Tipo 8',
};

export interface FirmaPeriodo {
  desde: string;
  hasta: string | null;
}

export interface Firma {
  nombre: string;
  cargo: string;
  archivo: string;
  imagen_firma: string;
  periodos: FirmaPeriodo[];
}
