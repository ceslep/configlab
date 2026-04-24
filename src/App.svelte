<script lang="ts">
  import { onMount } from 'svelte';
  import { Navbar, NavBrand, DarkMode, Button } from 'flowbite-svelte';
  import { CogOutline, FlaskOutline, EditOutline, InfoCircleOutline } from 'flowbite-svelte-icons';

  import ProcedimientosTable from './lib/components/ProcedimientosTable.svelte';
  import FirmasManager from './lib/components/FirmasManager.svelte';
  import Login from './lib/components/Login.svelte';
  import { checkAuth, logout, type Usuario } from './lib/service';

  const POPOVER_KEY = 'main_popover_v1';
  const POPOVER_EXPIRE_DATE = new Date('2026-05-04');
  const FIRMAS_HINT_KEY = 'firmas_hint_v1';

  let activeView = $state<'procedimientos' | 'firmas'>('procedimientos');
  let authenticated = $state(false);
  let usuario = $state<Usuario | null>(null);
  let checkingAuth = $state(true);
  let showPopover = $state(false);
  let showFirmasHint = $state(false);

  function shouldShowPopover(): boolean {
    const now = new Date();
    if (now > POPOVER_EXPIRE_DATE) return false;
    const closed = localStorage.getItem(POPOVER_KEY);
    if (closed === 'true') return false;
    return true;
  }

  function shouldShowFirmasHint(): boolean {
    const closed = localStorage.getItem(FIRMAS_HINT_KEY);
    if (closed === 'true') return false;
    return true;
  }

  function closePopover() {
    localStorage.setItem(POPOVER_KEY, 'true');
    showPopover = false;
  }

  function dismissFirmasHint() {
    localStorage.setItem(FIRMAS_HINT_KEY, 'true');
    showFirmasHint = false;
  }

  async function handleLogin(u: Usuario) {
    usuario = u;
    authenticated = true;
    showPopover = shouldShowPopover();
    showFirmasHint = shouldShowFirmasHint();
  }

  async function handleLogout() {
    await logout();
    usuario = null;
    authenticated = false;
    showPopover = false;
    showFirmasHint = false;
  }

  function handleViewChange(view: 'procedimientos' | 'firmas') {
    activeView = view;
    if (view === 'firmas') {
      dismissFirmasHint();
    }
  }

  onMount(async () => {
    try {
      const res = await checkAuth();
      if (res.success && res.usuario) {
        usuario = res.usuario;
        authenticated = true;
        showFirmasHint = shouldShowFirmasHint();
      }
    } catch (e) {
      console.error('Error checking auth:', e);
      authenticated = false;
    } finally {
      checkingAuth = false;
    }
});
</script>

{#if checkingAuth}
  <div class="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
  </div>
{:else if !authenticated}
  <Login onLogin={handleLogin} />
{:else}
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <Navbar>
      <NavBrand href="/">
        <CogOutline class="mr-2 h-6 w-6 text-blue-600 dark:text-blue-400" />
        <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          ConfigLab MyCar
        </span>
      </NavBrand>
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 rounded-lg bg-white/50 px-3 py-1.5 dark:bg-white/10">
          {#if usuario?.foto}
            <img
              src={usuario.foto}
              alt="Foto de perfil"
              class="size-8 rounded-full border-2 border-white dark:border-gray-700"
            />
          {:else if usuario?.nombre}
            <div class="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-bold text-white">
              {usuario.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          {/if}
          <div class="flex flex-col">
            <span class="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
              {usuario?.nombre || usuario?.email || ''}
            </span>
            <span class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
              {usuario?.email || ''}
            </span>
          </div>
        </div>
        <Button
          size="sm"
          color={activeView === 'procedimientos' ? 'blue' : 'alternative'}
          onclick={() => (activeView = 'procedimientos')}
        >
          <FlaskOutline class="mr-1 h-4 w-4" /> Procedimientos
        </Button>
        <Button
          size="sm"
          color={activeView === 'firmas' ? 'blue' : 'alternative'}
          onclick={() => handleViewChange('firmas')}
        >
          <EditOutline class="mr-1 h-4 w-4" />
          Firmas
          {#if activeView !== 'firmas' && showFirmasHint}
            <span class="relative flex h-2 w-2 ml-1">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span class="relative inline-flex h-2 w-2 rounded-full bg-cyan-500"></span>
            </span>
          {/if}
        </Button>
        <Button size="sm" color="red" outline onclick={handleLogout} title="Cerrar sesión">
          Salir
        </Button>
        <DarkMode />
      </div>
    </Navbar>

    <main class="mx-auto max-w-7xl px-4 py-6">
      <!-- Popover Informativo -->
      {#if showPopover}
        <div class="relative mb-6 overflow-hidden rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 backdrop-blur dark:border-cyan-500/30 dark:bg-cyan-500/10">
          <div class="absolute top-0 right-0 -mt-1 -mr-1 flex size-8 items-center justify-center rounded-full bg-cyan-500/20">
            <InfoCircleOutline class="size-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div class="pr-8">
            <h4 class="mb-1 text-sm font-semibold text-cyan-700 dark:text-cyan-400">
              Bienvenido a ConfigLab MyCar
            </h4>
            <p class="text-sm text-cyan-600 dark:text-cyan-300">
              Esta aplicación gestiona procedimientos de laboratorio y firmas para informes.En el menú superior puede navegar entre Procedimientos (configuración de exámenes) y Firmas (para informes PDF).
            </p>
          </div>
          <button
            onclick={closePopover}
            aria-label="Cerrar"
            class="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full text-cyan-500 transition-colors hover:bg-cyan-500/20 hover:text-cyan-700 dark:hover:text-cyan-300"
          >
            <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      {/if}

      {#if activeView === 'procedimientos'}
        <ProcedimientosTable />
      {:else}
        <FirmasManager />
      {/if}
    </main>
  </div>
{/if}