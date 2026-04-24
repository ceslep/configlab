<script lang="ts">
  import {
    Button, Input, Label, Card, Spinner, Badge,
  } from 'flowbite-svelte';
  import {
    PlusOutline, TrashBinOutline, FloppyDiskOutline,
    RefreshOutline, ExclamationCircleOutline, EditOutline,
    ArrowUpOutline, ArrowDownOutline, InfoCircleOutline,
  } from 'flowbite-svelte-icons';

  import type { Firma } from '../constants';
  import { getFirmas, guardarFirmas, getFirmaImageUrl } from '../service';
  import SignatureCanvas from './SignatureCanvas.svelte';

  const POPOVER_KEY = 'firmas_popover_v1';
  const POPOVER_EXPIRE_DATE = new Date('2026-05-04');

  let showPopover = $state(false);

  function shouldShowPopover(): boolean {
    const now = new Date();
    if (now > POPOVER_EXPIRE_DATE) return false;
    const closed = localStorage.getItem(POPOVER_KEY);
    if (closed === 'true') return false;
    return true;
  }

  function closePopover() {
    localStorage.setItem(POPOVER_KEY, 'true');
    showPopover = false;
  }

  $effect(() => {
    showPopover = shouldShowPopover();
  });

  function periodosSeSuperponen(
    p1: { desde: string; hasta: string | null },
    p2: { desde: string; hasta: string | null }
  ): boolean {
    const inicio1 = p1.desde ? new Date(p1.desde).getTime() : 0;
    const fin1 = p1.hasta ? new Date(p1.hasta).getTime() : Number.MAX_SAFE_INTEGER;
    const inicio2 = p2.desde ? new Date(p2.desde).getTime() : 0;
    const fin2 = p2.hasta ? new Date(p2.hasta).getTime() : Number.MAX_SAFE_INTEGER;
    return inicio1 <= fin2 && fin1 >= inicio2;
  }

  function validarPeriodos(firmasList: Firma[]): string {
    for (let i = 0; i < firmasList.length; i++) {
      const firma = firmasList[i];
      if (!firma.periodos || firma.periodos.length === 0) continue;

      for (let j = i + 1; j < firmasList.length; j++) {
        const otra = firmasList[j];
        if (!otra.periodos || otra.periodos.length === 0) continue;

        for (const p1 of firma.periodos) {
          if (!p1.desde) continue;
          for (const p2 of otra.periodos) {
            if (!p2.desde) continue;
            if (periodosSeSuperponen(p1, p2)) {
              const nombre1 = firma.nombre.split(':')[0] || `Firma ${i + 1}`;
              const nombre2 = otra.nombre.split(':')[0] || `Firma ${j + 1}`;
              return `Conflicto de fechas: "${nombre1}" y "${nombre2}" tienen períodos superpuestos`;
            }
          }
        }
      }
    }
    return '';
  }

  let firmas = $state<Firma[]>([]);
  let loading = $state(true);
  let saving = $state(false);
  let errorMsg = $state('');
  let successMsg = $state('');
  let editIndex = $state<number | null>(null);

  async function loadData() {
    loading = true;
    errorMsg = '';
    try {
      firmas = await getFirmas();
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : 'Error al cargar firmas';
    } finally {
      loading = false;
    }
  }

  function newFirma(): Firma {
    return { nombre: '', cargo: '', archivo: '', imagen_firma: '', periodos: [] };
  }

  function addFirma() {
    firmas = [...firmas, newFirma()];
    editIndex = firmas.length - 1;
  }

  function removeFirma(i: number) {
    firmas = firmas.filter((_, idx) => idx !== i);
    if (editIndex === i) editIndex = null;
    else if (editIndex !== null && editIndex > i) editIndex--;
  }

  function moveUp(i: number) {
    if (i <= 0) return;
    const arr = [...firmas];
    [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
    firmas = arr;
    if (editIndex === i) editIndex = i - 1;
    else if (editIndex === i - 1) editIndex = i;
  }

  function moveDown(i: number) {
    if (i >= firmas.length - 1) return;
    const arr = [...firmas];
    [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
    firmas = arr;
    if (editIndex === i) editIndex = i + 1;
    else if (editIndex === i + 1) editIndex = i;
  }

  function addPeriodo(i: number) {
    firmas[i].periodos = [...firmas[i].periodos, { desde: '', hasta: null }];
  }

  function removePeriodo(fi: number, pi: number) {
    firmas[fi].periodos = firmas[fi].periodos.filter((_, idx) => idx !== pi);
  }

  function generateFilename(nombre: string, index: number): string {
    const base = nombre
      .split(':')[0]
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '') || `firma_${index + 1}`;
    return `${base}.png`;
  }

  function handleFileUpload(e: Event, i: number) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const updated = [...firmas];
      updated[i] = {
        ...updated[i],
        imagen_firma: base64,
        archivo: updated[i].archivo || generateFilename(updated[i].nombre, i),
      };
      firmas = updated;
    };
    reader.readAsDataURL(file);
  }

  function handleCanvasChange(i: number, base64: string) {
    const updated = [...firmas];
    updated[i] = {
      ...updated[i],
      imagen_firma: base64,
      archivo: updated[i].archivo || (base64 ? generateFilename(updated[i].nombre, i) : ''),
    };
    firmas = updated;
  }

  async function save() {
    saving = true;
    errorMsg = '';
    successMsg = '';
    try {
      const conflicto = validarPeriodos(firmas);
      if (conflicto) {
        errorMsg = conflicto;
        saving = false;
        return;
      }
      const res = await guardarFirmas(firmas);
      if (res.msg) {
        successMsg = 'Firmas guardadas correctamente';
        editIndex = null;
        setTimeout(() => (successMsg = ''), 3000);
      } else {
        errorMsg = 'Error al guardar firmas';
      }
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : 'Error desconocido';
    } finally {
      saving = false;
    }
  }

  function getPreviewSrc(firma: Firma): string {
    if (firma.imagen_firma) return firma.imagen_firma;
    if (firma.archivo) return getFirmaImageUrl(firma.archivo);
    return '';
  }

  function formatDate(d: string | null): string {
    if (!d) return 'Actual';
    return d;
  }

  let uploadMode = $state<Record<number, 'canvas' | 'file'>>({});

  function getMode(i: number): 'canvas' | 'file' {
    return uploadMode[i] ?? 'file';
  }

  function setMode(i: number, mode: 'canvas' | 'file') {
    uploadMode = { ...uploadMode, [i]: mode };
  }

  loadData();
</script>

<div class="space-y-4">
  <!-- Popover Informativo -->
  {#if showPopover}
    <div class="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 backdrop-blur dark:border-cyan-500/30 dark:bg-cyan-500/10">
      <div class="absolute top-0 right-0 -mt-1 -mr-1 flex size-8 items-center justify-center rounded-full bg-cyan-500/20">
        <InfoCircleOutline class="size-4 text-cyan-600 dark:text-cyan-400" />
      </div>
      <div class="pr-8">
        <h4 class="mb-1 text-sm font-semibold text-cyan-700 dark:text-cyan-400">
          Gestión de Firmas
        </h4>
        <p class="text-sm text-cyan-600 dark:text-cyan-300">
          Las firmas se usan para generar informes PDF.Configure el nombre completo,cargo,T.P.y períodos de vigencia para cada firma.Puede agregar múltiples firmas y ordenarlas según sea necesario.
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

  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <h2 class="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
      <EditOutline class="h-6 w-6 text-blue-600 dark:text-blue-400" />
      Firmas
      {#if !loading}
        <Badge color="blue">{firmas.length}</Badge>
      {/if}
    </h2>
    <div class="flex gap-2">
      <Button color="alternative" onclick={loadData} title="Recargar">
        <RefreshOutline class="h-4 w-4" />
      </Button>
      <Button color="blue" onclick={addFirma}>
        <PlusOutline class="mr-1 h-4 w-4" /> Agregar firma
      </Button>
    </div>
  </div>

  {#if errorMsg}
    <div class="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
      <ExclamationCircleOutline class="h-5 w-5 shrink-0" />
      {errorMsg}
    </div>
  {/if}

  {#if successMsg}
    <div class="rounded-lg bg-green-50 p-3 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400">
      {successMsg}
    </div>
  {/if}

  {#if loading}
    <div class="flex justify-center py-12">
      <Spinner size="10" />
    </div>
  {:else}
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {#each firmas as firma, i (i)}
        <Card class="relative">
          <div class="space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <h3 class="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                Firma #{i + 1}
                {#if firma.nombre}
                  <span class="text-sm font-normal text-gray-500">— {firma.nombre.split(':')[0]}</span>
                {/if}
              </h3>
              <div class="flex gap-1">
                <Button size="xs" color="alternative" onclick={() => moveUp(i)} disabled={i === 0} title="Subir">
                  <ArrowUpOutline class="h-3 w-3" />
                </Button>
                <Button size="xs" color="alternative" onclick={() => moveDown(i)} disabled={i === firmas.length - 1} title="Bajar">
                  <ArrowDownOutline class="h-3 w-3" />
                </Button>
                <Button size="xs" color="alternative" onclick={() => (editIndex = editIndex === i ? null : i)}>
                  <EditOutline class="h-3 w-3" />
                </Button>
                <Button size="xs" color="red" outline onclick={() => removeFirma(i)}>
                  <TrashBinOutline class="h-3 w-3" />
                </Button>
              </div>
            </div>

            {#if getPreviewSrc(firma)}
              <div class="rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-600 dark:bg-gray-800">
                <img
                  src={getPreviewSrc(firma)}
                  alt="Firma de {firma.nombre || 'sin nombre'}"
                  class="mx-auto max-h-24 object-contain sm:max-h-32"
                />
                {#if firma.archivo}
                  <p class="mt-1 text-center text-xs text-gray-400">{firma.archivo}</p>
                {/if}
              </div>
            {:else}
              <div class="flex h-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-400 dark:border-gray-600 sm:h-24">
                Sin firma
              </div>
            {/if}

            <div class="text-sm text-gray-600 dark:text-gray-400">
              <p><strong>Cargo:</strong> {firma.cargo || '—'}</p>
              {#if firma.periodos.length > 0}
                <div class="mt-1 flex flex-wrap gap-1">
                  {#each firma.periodos as per}
                    <Badge color="green">{formatDate(per.desde)} → {formatDate(per.hasta)}</Badge>
                  {/each}
                </div>
              {/if}
            </div>

            {#if editIndex === i}
              <div class="space-y-3 border-t border-gray-200 pt-3 dark:border-gray-700">
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label for="nombre-{i}" class="mb-1">Nombre (con T.P.)</Label>
                    <Input id="nombre-{i}" bind:value={firma.nombre} placeholder="Nombre Completo:T.P. 123456" />
                  </div>
                  <div>
                    <Label for="cargo-{i}" class="mb-1">Cargo</Label>
                    <Input id="cargo-{i}" bind:value={firma.cargo} placeholder="Bacteriólogo" />
                  </div>
                </div>

                <div>
                  <Label for="archivo-{i}" class="mb-1">Nombre archivo</Label>
                  <Input id="archivo-{i}" bind:value={firma.archivo} placeholder="nombre.png" />
                </div>

                <div>
                  <Label class="mb-1">Periodos de vigencia</Label>
                  <div class="space-y-2">
                    {#each firma.periodos as per, pi}
                      <div class="flex flex-wrap items-center gap-2">
                        <div class="min-w-[120px] flex-1">
                          <Input type="date" bind:value={per.desde} class="!py-2 !text-sm" />
                        </div>
                        <span class="text-gray-400">→</span>
                        <div class="min-w-[120px] flex-1">
                          <Input type="date" value={per.hasta ?? ''} onchange={(e: Event) => { per.hasta = (e.target as HTMLInputElement).value || null; }} class="!py-2 !text-sm" />
                        </div>
                        <Button size="xs" color="red" outline onclick={() => removePeriodo(i, pi)}>
                          <TrashBinOutline class="h-3 w-3" />
                        </Button>
                      </div>
                    {/each}
                    <Button size="xs" color="alternative" onclick={() => addPeriodo(i)}>
                      <PlusOutline class="mr-1 h-3 w-3" /> Agregar periodo
                    </Button>
                  </div>
                </div>

                <div>
                  <Label class="mb-1">Imagen de firma</Label>
                  <div class="mb-2 flex flex-wrap gap-2">
                    <Button
                      size="xs"
                      color={getMode(i) === 'file' ? 'blue' : 'alternative'}
                      onclick={() => setMode(i, 'file')}
                    >
                      Subir imagen
                    </Button>
                    <Button
                      size="xs"
                      color={getMode(i) === 'canvas' ? 'blue' : 'alternative'}
                      onclick={() => setMode(i, 'canvas')}
                    >
                      Dibujar
                    </Button>
                  </div>

                  {#if getMode(i) === 'file'}
                    <label class="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onchange={(e) => handleFileUpload(e, i)}
                        class="hidden"
                      />
                      <ArrowUpOutline class="h-4 w-4" />
                      {firma.imagen_firma ? 'Cambiar imagen' : 'Subir imagen'}
                    </label>
                    {#if firma.imagen_firma}
                      <p class="mt-1 text-xs text-green-500">Imagen cargada ({Math.round(firma.imagen_firma.length / 1024)} KB)</p>
                    {/if}
                  {:else}
                    <SignatureCanvas
                      value={firma.imagen_firma}
                      onchange={(v: string) => handleCanvasChange(i, v)}
                      width={350}
                      height={150}
                    />
                  {/if}
                </div>
              </div>
            {/if}
          </div>
        </Card>
      {:else}
        <div class="col-span-full py-12 text-center text-gray-500">
          No hay firmas configuradas. Haga clic en "Agregar firma" para comenzar.
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Botón guardar flotante -->
{#if !loading && firmas.length > 0}
  <div class="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
    <Button color="green" size="md" onclick={save} disabled={saving} class="shadow-lg">
      <FloppyDiskOutline class="h-4 w-4 sm:mr-2" />
      <span class="hidden sm:inline">{saving ? 'Guardando...' : 'Guardar todo'}</span>
      <span class="sm:hidden">{saving ? '...' : 'Guardar'}</span>
    </Button>
  </div>
{/if}
