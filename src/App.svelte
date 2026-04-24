<script lang="ts">
  import { onMount } from 'svelte';
  import { Navbar, NavBrand, DarkMode, Button } from 'flowbite-svelte';
  import { CogOutline, FlaskOutline, EditOutline } from 'flowbite-svelte-icons';

  import ProcedimientosTable from './lib/components/ProcedimientosTable.svelte';
  import FirmasManager from './lib/components/FirmasManager.svelte';
  import Login from './lib/components/Login.svelte';
  import { checkAuth, logout, type Usuario } from './lib/service';

  let activeView = $state<'procedimientos' | 'firmas'>('procedimientos');
  let authenticated = $state(false);
  let usuario = $state<Usuario | null>(null);
  let checkingAuth = $state(true);

  async function handleLogin(u: Usuario) {
    usuario = u;
    authenticated = true;
  }

  async function handleLogout() {
    await logout();
    usuario = null;
    authenticated = false;
  }

  onMount(async () => {
    try {
      const res = await checkAuth();
      if (res.success && res.usuario) {
        usuario = res.usuario;
        authenticated = true;
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
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {usuario?.email || usuario?.id}
        </span>
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
          onclick={() => (activeView = 'firmas')}
        >
          <EditOutline class="mr-1 h-4 w-4" /> Firmas
        </Button>
        <Button size="sm" color="red" outline onclick={handleLogout} title="Cerrar sesión">
          Salir
        </Button>
        <DarkMode />
      </div>
    </Navbar>

    <main class="mx-auto max-w-7xl px-4 py-6">
      {#if activeView === 'procedimientos'}
        <ProcedimientosTable />
      {:else}
        <FirmasManager />
      {/if}
    </main>
  </div>
{/if}