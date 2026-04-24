import { BASE_URL, type Procedimiento, type Firma } from './constants';

async function request<T>(endpoint: string, body?: unknown): Promise<T> {
  const opts: RequestInit = {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  };
  const res = await fetch(`${BASE_URL}/${endpoint}`, opts);
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return res.json();
}

export function getProcedimientos(): Promise<Procedimiento[]> {
  return request('getProcedimientos.php');
}

export function guardarProcedimiento(
  data: Partial<Procedimiento>
): Promise<{ msg: boolean }> {
  return request('guardarProcedimiento.php', data);
}

export function eliminarProcedimiento(
  ind: number
): Promise<{ msg: boolean }> {
  return request('eliminarProcedimiento.php', { ind });
}

export function getFirmas(): Promise<Firma[]> {
  return request('printphp/getFirmas.php');
}

export function guardarFirmas(firmas: Firma[]): Promise<{ msg: boolean }> {
  return request('printphp/guardarFirmas.php', firmas);
}

export function subirFirmaImagen(
  filename: string, data: string
): Promise<{ msg: boolean; archivo?: string }> {
  return request('printphp/subirFirma.php', { filename, data });
}

export function getFirmaImageUrl(archivo: string): string {
  if (!archivo) return '';
  return `${BASE_URL}/printphp/${archivo}`;
}
