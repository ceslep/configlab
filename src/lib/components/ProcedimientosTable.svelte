<script lang="ts">
  import {
    Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell,
    Button, Input, Select, Badge, Spinner,
  } from 'flowbite-svelte';
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

  const tablaFilterOptions = [
    { value: '', name: 'Todas las tablas' },
    ...TABLAS.map(t => ({ value: t, name: TABLAS_LABELS[t] ?? t })),
  ];

  const tipoFilterOptions = [
    { value: '', name: 'Todos los tipos' },
    ...Object.entries(TIPOS_LABELS).map(([v, n]) => ({ value: v, name: n })),
  ];

  loadData();
</script>

<div class="space-y-4">
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <h2 class="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
      <FlaskOutline class="h-7 w-7 text-blue-600 dark:text-blue-400" />
      Procedimientos
      {#if !loading}
        <span class="text-base font-normal text-gray-500">({filtered.length})</span>
      {/if}
    </h2>
    <div class="flex gap-2">
      <Button color="alternative" onclick={loadData} title="Recargar">
        <RefreshOutline class="h-4 w-4" />
      </Button>
      <Button onclick={openNew}>
        <PlusOutline class="mr-1 h-4 w-4" /> Nuevo
      </Button>
    </div>
  </div>

  <div class="flex flex-col gap-3 sm:flex-row">
    <div class="relative flex-1">
      <SearchOutline class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <Input bind:value={search} placeholder="Buscar por nombre, código, CUPS..." class="pl-10" />
    </div>
    <div class="w-full sm:w-48">
      <Select bind:value={filterTabla} items={tablaFilterOptions} placeholder="Todas las tablas" />
    </div>
    <div class="w-full sm:w-36">
      <Select bind:value={filterTipo} items={tipoFilterOptions} placeholder="Todos los tipos" />
    </div>
  </div>

  {#if loading}
    <div class="flex justify-center py-12">
      <Spinner size="10" />
    </div>
  {:else if errorMsg}
    <div class="rounded-lg bg-red-50 p-4 text-center text-red-600 dark:bg-red-900/20 dark:text-red-400">
      <ExclamationCircleOutline class="mx-auto mb-2 h-6 w-6" />
      {errorMsg}
      <Button size="xs" color="alternative" class="ml-2" onclick={loadData}>
        <RefreshOutline class="mr-1 h-3 w-3" /> Reintentar
      </Button>
    </div>
  {:else}
    <div class="overflow-x-auto">
      <Table striped hoverable>
        <TableHead>
          <TableHeadCell>Código</TableHeadCell>
          <TableHeadCell>Nombre</TableHeadCell>
          <TableHeadCell>Tabla</TableHeadCell>
          <TableHeadCell>Tipo</TableHeadCell>
          <TableHeadCell>CUPS</TableHeadCell>
          <TableHeadCell>Unidades</TableHeadCell>
          <TableHeadCell>Color</TableHeadCell>
          <TableHeadCell>Acciones</TableHeadCell>
        </TableHead>
        <TableBody>
          {#each paginated as p (p.ind)}
            <TableBodyRow>
              <TableBodyCell>
                <span class="font-mono text-sm">{p.codigo}</span>
              </TableBodyCell>
              <TableBodyCell>
                <div class="max-w-xs truncate font-medium" title={p.nombre}>{p.nombre}</div>
                {#if p.abreviatura && p.abreviatura !== p.nombre}
                  <div class="text-xs text-gray-500 dark:text-gray-400">{p.abreviatura}</div>
                {/if}
              </TableBodyCell>
              <TableBodyCell>
                <Badge color="blue">{TABLAS_LABELS[p.tabla] ?? p.tabla}</Badge>
              </TableBodyCell>
              <TableBodyCell>
                <Badge color="gray">{TIPOS_LABELS[p.tipo] ?? p.tipo ?? '—'}</Badge>
              </TableBodyCell>
              <TableBodyCell>
                <span class="font-mono text-xs">{p.tipoprocedimiento || '—'}</span>
              </TableBodyCell>
              <TableBodyCell>{p.unidades || '—'}</TableBodyCell>
              <TableBodyCell>
                {#if p.color}
                  <div class="flex items-center gap-2">
                    <span
                      class="inline-block h-5 w-5 rounded border border-gray-300 dark:border-gray-600"
                      style="background-color: {rgbStyle(p.color)}"
                    ></span>
                  </div>
                {:else}
                  —
                {/if}
              </TableBodyCell>
              <TableBodyCell>
                <div class="flex gap-1">
                  <Button size="xs" color="alternative" onclick={() => openEdit(p)}>
                    <EditOutline class="mr-1 h-3 w-3" /> Editar
                  </Button>
                  <Button size="xs" color="red" outline onclick={() => openDelete(p)}>
                    <TrashBinOutline class="mr-1 h-3 w-3" /> Eliminar
                  </Button>
                </div>
              </TableBodyCell>
            </TableBodyRow>
          {:else}
            <TableBodyRow>
              <TableBodyCell colspan={8}>
                <p class="py-4 text-center text-gray-500">No se encontraron procedimientos</p>
              </TableBodyCell>
            </TableBodyRow>
          {/each}
        </TableBody>
      </Table>
    </div>

    {#if totalPages > 1}
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-500 dark:text-gray-400">
          Página {currentPage} de {totalPages}
        </span>
        <div class="flex gap-2">
          <Button
            size="xs"
            color="alternative"
            disabled={currentPage <= 1}
            onclick={() => (currentPage = Math.max(1, currentPage - 1))}
          >
            <ArrowLeftOutline class="mr-1 h-3 w-3" /> Anterior
          </Button>
          <Button
            size="xs"
            color="alternative"
            disabled={currentPage >= totalPages}
            onclick={() => (currentPage = Math.min(totalPages, currentPage + 1))}
          >
            Siguiente <ArrowRightOutline class="ml-1 h-3 w-3" />
          </Button>
        </div>
      </div>
    {/if}
  {/if}
</div>

<ProcedimientoForm bind:open={formOpen} procedimiento={selected} onsave={loadData} />
<DeleteConfirm bind:open={deleteOpen} procedimiento={selected} ondelete={loadData} />
