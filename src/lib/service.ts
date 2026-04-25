import { BASE_URL, type Procedimiento, type Firma } from './constants';

const SESSION_KEY = 'configlab_session';
const SESSION_EXPIRY_DAYS = 7;

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  foto?: string;
}

export interface SessionData {
  usuario: Usuario;
  timestamp: number;
}

function getSession(): SessionData | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: SessionData = JSON.parse(raw);
    const expiryMs = SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    if (Date.now() - session.timestamp > expiryMs) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function setSession(usuario: Usuario): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    usuario,
    timestamp: Date.now(),
  }));
}

function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export { clearSession };

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

export async function getStoredUser(): Promise<Usuario | null> {
  const session = getSession();
  return session?.usuario ?? null;
}

export interface LoginResponse {
  success: boolean;
  usuario?: Usuario;
  mensaje?: string;
}

export async function login(id: string): Promise<LoginResponse> {
  const res = await request<LoginResponse>('login_configlab.php', { id });
  if (res.success && res.usuario) {
    setSession(res.usuario);
  }
  return res;
}

export async function loginGoogle(googleToken: string): Promise<LoginResponse> {
  const res = await request<LoginResponse>('login_configlab.php', { googleToken });
  if (res.success && res.usuario) {
    setSession(res.usuario);
  }
  return res;
}

export async function checkAuth(): Promise<LoginResponse> {
  const session = getSession();
  if (session?.usuario) {
    return { success: true, usuario: session.usuario };
  }
  try {
    const res = await request<LoginResponse>('login_configlab.php');
    if (res.success && res.usuario) {
      setSession(res.usuario);
    }
    return res;
  } catch {
    if (session) {
      clearSession();
    }
    return { success: false, mensaje: 'Sesión expirada' };
  }
}

export async function logout(): Promise<{ success: boolean }> {
  clearSession();
  try {
    await request('login_configlab.php?logout=1');
  } catch {
    // ignore backend errors on logout
  }
  return { success: true };
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
