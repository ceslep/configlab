<script lang="ts">
  import { Navbar, NavBrand, DarkMode, Button } from 'flowbite-svelte';
  import { CogOutline, FlaskOutline, EditOutline } from 'flowbite-svelte-icons';

  import ProcedimientosTable from './lib/components/ProcedimientosTable.svelte';
  import FirmasManager from './lib/components/FirmasManager.svelte';

  let activeView = $state<'procedimientos' | 'firmas'>('procedimientos');
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <Navbar>
    <NavBrand href="/">
      <CogOutline class="mr-2 h-6 w-6 text-blue-600 dark:text-blue-400" />
      <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
        ConfigLab MyCar
      </span>
    </NavBrand>
    <div class="flex items-center gap-3">
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
