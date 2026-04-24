<script lang="ts">
  import { Badge, Spinner } from 'flowbite-svelte';
  import {
    PlusOutline, EditOutline, TrashBinOutline, SearchOutline,
    RefreshOutline, ArrowLeftOutline, ArrowRightOutline,
    FlaskOutline, ExclamationCircleOutline,
  } from 'flowbite-svelte-icons';

  import { TABLAS, TABLAS_LABELS, TIPOS_LABELS, type Procedimiento } from '../constants';
  import { getProcedimientos } from '../service';

  import ProcedimientoForm from './ProcedimientoForm.svelte';
  import DeleteConfirm from './DeleteConfirm.svelte';

  let procedimientos = $state.raw<Procedimiento[]>([]);
  let loading = $state(true);
  let errorMsg = $state('');

  let search = $state('');
  let filterTabla = $state('');
  let filterTipo = $state('');
  let showFilters = $state(false);

  let currentPage = $state(1);
  const PAGE_SIZE = 15;

  let formOpen = $state(false);
  let deleteOpen = $state(false);
  let selected = $state<Procedimiento | null>(null);

  let filtered = $derived.by(() => {
    let items = procedimientos;
    const q = search.toLowerCase().trim();
    if (q) {
      items = items.filter(p =>
        p.nombre.toLowerCase().includes(q) ||
        p.codigo.toLowerCase().includes(q) ||
        p.abreviatura?.toLowerCase().includes(q) ||
        p.tipoprocedimiento?.toLowerCase().includes(q)
      );
    }
    if (filterTabla) items = items.filter(p => p.tabla === filterTabla);
    if (filterTipo) items = items.filter(p => p.tipo === filterTipo);
    return items;
  });

  let totalPages = $derived(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));

  let paginated = $derived(
    filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  );

  $effect(() => {
    if (filtered) currentPage = 1;
  });

  async function loadData() {
    loading = true;
    errorMsg = '';
    try {
      procedimientos = await getProcedimientos();
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : 'Error al cargar datos';
    } finally {
      loading = false;
    }
  }

  function openNew() {
    selected = null;
    formOpen = true;
  }

  function openEdit(p: Procedimiento) {
    selected = p;
    formOpen = true;
  }

  function openDelete(p: Procedimiento) {
    selected = p;
    deleteOpen = true;
  }

  function rgbStyle(color: string): string {
    if (!color) return '';
    const parts = color.split(';');
    if (parts.length !== 3) return '';
    return `rgb(${parts[0]}, ${parts[1]}, ${parts[2]})`;
  }

  function clearFilters() {
    search = '';
    filterTabla = '';
    filterTipo = '';
  }

  const tablaFilterOptions = [
    { value: '', label: 'Todas las tablas' },
    ...TABLAS.map(t => ({ value: t, label: TABLAS_LABELS[t] ?? t })),
  ];

  const tipoFilterOptions = [
    { value: '', label: 'Todos los tipos' },
    ...Object.entries(TIPOS_LABELS).map(([v, n]) => ({ value: v, label: n })),
  ];

  let hasActiveFilters = $derived(!!search || !!filterTabla || !!filterTipo);

  loadData();
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div class="flex items-center gap-3">
      <div class="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
        <FlaskOutline class="size-6 text-white" />
      </div>
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          Procedimientos
        </h2>
        {#if !loading}
          <p class="text-sm text-gray-500 dark:text-gray-400">{filtered.length} resultados</p>
        {/if}
      </div>
    </div>
    <div class="flex gap-2">
      <button
        onclick={loadData}
        class="flex size-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition-all duration-300 hover:bg-gray-50 hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white backdrop-blur focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
        title="Recargar"
      >
        <RefreshOutline class="size-5" />
      </button>
      <button
        onclick={openNew}
        class="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-lg shadow-amber-500/25 transition-all duration-300 hover:from-amber-400 hover:to-yellow-400 hover:shadow-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
      >
        <PlusOutline class="size-5" />
        Nuevo
      </button>
    </div>
  </div>

  <!-- Search & Filters -->
  <div class="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:bg-gray-900/50 p-4">
    <div class="flex flex-col gap-4">
      <!-- Search Bar -->
      <div class="relative">
        <div class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
          <SearchOutline class="size-5 text-gray-400 dark:text-gray-500" />
        </div>
        <input
          type="text"
          bind:value={search}
          placeholder="Buscar por nombre, código, CUPS, abreviatura..."
          class="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300 focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 dark:focus:bg-white/10"
        />
        {#if search}
          <button
            onclick={() => search = ''}
            aria-label="Limpiar búsqueda"
            class="absolute right-3 top-1/2 -translate-y-1/2 flex size-6 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        {/if}
      </div>

      <!-- Filter Toggle -->
      <div class="flex items-center justify-between">
        <button
          onclick={() => showFilters = !showFilters}
          class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-white"
        >
          <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtros avanzados
          {#if hasActiveFilters}
            <span class="flex size-5 items-center justify-center rounded-full bg-cyan-500/20 text-xs text-cyan-600 dark:text-cyan-400">
              {(!!search ? 1 : 0) + (!!filterTabla ? 1 : 0) + (!!filterTipo ? 1 : 0)}
            </span>
          {/if}
        </button>
        {#if hasActiveFilters}
          <button
            onclick={clearFilters}
            class="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
          >
            Limpiar filtros
          </button>
        {/if}
      </div>

      <!-- Advanced Filters -->
      {#if showFilters}
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
          <div class="group relative">
            <label for="filter-tabla" class="mb-1.5 block text-sm font-medium text-gray-600 dark:text-gray-400">
              Tabla
            </label>
            <select
              id="filter-tabla"
              bind:value={filterTabla}
              class="w-full rounded-xl border border-gray-200 bg-white py-3 px-4 text-gray-900 shadow-sm transition-all duration-300 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              {#each tablaFilterOptions as opt}
                <option value={opt.value}>{opt.label}</option>
              {/each}
            </select>
          </div>
          <div class="group relative">
            <label for="filter-tipo" class="mb-1.5 block text-sm font-medium text-gray-600 dark:text-gray-400">
              Tipo
            </label>
            <select
              id="filter-tipo"
              bind:value={filterTipo}
              class="w-full rounded-xl border border-gray-200 bg-white py-3 px-4 text-gray-900 shadow-sm transition-all duration-300 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              {#each tipoFilterOptions as opt}
                <option value={opt.value}>{opt.label}</option>
              {/each}
            </select>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Loading State -->
  {#if loading}
    <div class="flex flex-col items-center justify-center gap-4 py-20">
      <Spinner size="10" />
      <p class="text-gray-500 dark:text-gray-400">Cargando procedimientos...</p>
    </div>
  {:else if errorMsg}
    <!-- Error State -->
    <div class="flex flex-col items-center justify-center gap-4 rounded-xl border border-red-200 bg-red-50 p-8 dark:border-red-500/20 dark:bg-red-500/10">
      <div class="flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
        <ExclamationCircleOutline class="size-8 text-red-500 dark:text-red-400" />
      </div>
      <p class="text-center text-red-600 dark:text-red-400">{errorMsg}</p>
      <button
        onclick={loadData}
        class="flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-600 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30"
      >
        <RefreshOutline class="size-4" />
        Reintentar
      </button>
    </div>
  {:else}
    <!-- Mobile Cards View -->
    <div class="mb-4 grid grid-cols-1 gap-3 sm:hidden">
      {#each paginated as p, i (p.ind)}
        <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-gray-900/50 {i % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-white/[2%]'}">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <h3 class="truncate text-base font-semibold text-gray-900 dark:text-white" title={p.nombre}>
                {p.nombre}
              </h3>
              {#if p.abreviatura && p.abreviatura !== p.nombre}
                <p class="text-xs text-gray-500 dark:text-gray-500">{p.abreviatura}</p>
              {/if}
              <div class="mt-2 flex flex-wrap gap-2">
                <span class="inline-flex items-center rounded-lg bg-cyan-100 px-2 py-1 text-xs text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400">
                  {TABLAS_LABELS[p.tabla] ?? p.tabla}
                </span>
                <span class="inline-flex items-center rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-500/20 dark:text-gray-300">
                  {TIPOS_LABELS[p.tipo] ?? p.tipo ?? '—'}
                </span>
              </div>
            </div>
            {#if p.color}
              <span
                class="size-8 shrink-0 rounded-lg border border-gray-200 dark:border-white/20"
                style="background-color: {rgbStyle(p.color)}"
              ></span>
            {/if}
          </div>
          
          <div class="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span class="text-gray-500 dark:text-gray-400">Código:</span>
              <span class="ml-1 font-mono text-gray-700 dark:text-gray-300">{p.codigo}</span>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400">CUPS:</span>
              <span class="ml-1 font-mono text-gray-700 dark:text-gray-300">{p.tipoprocedimiento || '—'}</span>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400">Unidades:</span>
              <span class="ml-1 text-gray-700 dark:text-gray-300">{p.unidades || '—'}</span>
            </div>
          </div>
          
          <div class="mt-3 flex gap-2">
            <button
              onclick={() => openEdit(p)}
              class="flex flex-1 items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 shadow-sm transition-all duration-300 hover:bg-gray-50 hover:border-gray-300 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
            >
              <EditOutline class="size-3.5" />
              Editar
            </button>
            <button
              onclick={() => openDelete(p)}
              class="flex flex-1 items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-500 transition-all duration-300 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
            >
              <TrashBinOutline class="size-3.5" />
              Eliminar
            </button>
          </div>
        </div>
      {:else}
        <div class="col-span-full rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-white/10 dark:bg-gray-900/50">
          <div class="flex flex-col items-center gap-2 text-gray-400">
            <FlaskOutline class="size-8 opacity-50" />
            <p>No se encontraron procedimientos</p>
          </div>
        </div>
      {/each}
    </div>

    <!-- Desktop Table View -->
    <div class="hidden rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-white/10 dark:bg-gray-900/50 sm:block">
      <!-- Table Header -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200 bg-gray-50 dark:border-white/5 dark:bg-white/5">
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Código</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Nombre</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Tabla</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Tipo</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">CUPS</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Unid.</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Color</th>
              <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {#each paginated as p, i (p.ind)}
              <tr class="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-white/5 dark:hover:bg-white/5 {i % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-white/[2%]'}">
                <td class="px-4 py-3">
                  <span class="font-mono text-sm text-gray-700 dark:text-gray-300">{p.codigo}</span>
                </td>
                <td class="px-4 py-3">
                  <div class="max-w-xs truncate font-medium text-gray-900 dark:text-white" title={p.nombre}>
                    {p.nombre}
                  </div>
                  {#if p.abreviatura && p.abreviatura !== p.nombre}
                    <div class="text-xs text-gray-500 dark:text-gray-500">{p.abreviatura}</div>
                  {/if}
                </td>
                <td class="px-4 py-3">
                  <span class="rounded-lg bg-cyan-100 px-2 py-1 text-xs text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400">
                    {TABLAS_LABELS[p.tabla] ?? p.tabla}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span class="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-500/20 dark:text-gray-300">
                    {TIPOS_LABELS[p.tipo] ?? p.tipo ?? '—'}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span class="font-mono text-xs text-gray-500 dark:text-gray-400">{p.tipoprocedimiento || '—'}</span>
                </td>
                <td class="px-4 py-3 text-gray-700 dark:text-gray-300">{p.unidades || '—'}</td>
                <td class="px-4 py-3">
                  {#if p.color}
                    <div class="flex items-center gap-2">
                      <span
                        class="size-6 rounded-lg border border-gray-200 dark:border-white/20"
                        style="background-color: {rgbStyle(p.color)}"
                      ></span>
                    </div>
                  {:else}
                    <span class="text-gray-400">—</span>
                  {/if}
                </td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-2">
                    <button
                      onclick={() => openEdit(p)}
                      class="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 shadow-sm transition-all duration-300 hover:bg-gray-50 hover:border-gray-300 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                    >
                      <EditOutline class="size-3.5" />
                      Editar
                    </button>
                    <button
                      onclick={() => openDelete(p)}
                      class="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-500 transition-all duration-300 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                    >
                      <TrashBinOutline class="size-3.5" />
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            {:else}
              <tr>
                <td colspan={8} class="px-4 py-12 text-center">
                  <div class="flex flex-col items-center gap-2 text-gray-400">
                    <FlaskOutline class="size-8 opacity-50" />
                    <p>No se encontraron procedimientos</p>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      {#if totalPages > 1}
        <div class="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-white/5">
          <span class="text-sm text-gray-500 dark:text-gray-400">
            Página <span class="text-gray-900 dark:text-white">{currentPage}</span> de <span class="text-gray-900 dark:text-white">{totalPages}</span>
          </span>
          <div class="flex gap-2">
            <button
              onclick={() => currentPage = Math.max(1, currentPage - 1)}
              disabled={currentPage <= 1}
              class="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm transition-all duration-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
            >
              <ArrowLeftOutline class="size-4" />
              Anterior
            </button>
            <button
              onclick={() => currentPage = Math.min(totalPages, currentPage + 1)}
              disabled={currentPage >= totalPages}
              class="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm transition-all duration-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
            >
              Siguiente
              <ArrowRightOutline class="size-4" />
            </button>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<ProcedimientoForm bind:open={formOpen} procedimiento={selected} onsave={loadData} />
<DeleteConfirm bind:open={deleteOpen} procedimiento={selected} ondelete={loadData} />

<style>
  :global(select option) {
    background-color: #111827;
    color: white;
  }
</style>