import { BASE_URL, type Procedimiento, type Firma } from './constants';

async function request<T>(endpoint: string, body?: unknown): Promise<T> {
  const opts: RequestInit = {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  };
  try {
    const res = await fetch(`${BASE_URL}/${endpoint}`, opts);
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    return res.json();
  } catch (e) {
    throw new Error('No se puede conectar al servidor');
  }
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  foto?: string;
}

export interface LoginResponse {
  success: boolean;
  usuario?: Usuario;
  mensaje?: string;
}

export async function login(id: string): Promise<LoginResponse> {
  return request('login_configlab.php', { id });
}

export async function loginGoogle(googleToken: string): Promise<LoginResponse> {
  return request('login_configlab.php', { googleToken });
}

export async function checkAuth(): Promise<LoginResponse> {
  return request('login_configlab.php');
}

export async function logout(): Promise<{ success: boolean }> {
  return request('login_configlab.php?logout=1');
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
