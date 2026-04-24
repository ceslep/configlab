<script lang="ts">
  import { Button, Modal, Label, Input, Textarea } from 'flowbite-svelte';
  import { FloppyDiskOutline } from 'flowbite-svelte-icons';

  import { TABLAS, TABLAS_LABELS, TIPOS, TIPOS_LABELS, type Procedimiento } from '../constants';
  import { guardarProcedimiento } from '../service';

  let {
    open = $bindable(false),
    procedimiento = null,
    onsave,
  }: {
    open: boolean;
    procedimiento: Procedimiento | null;
    onsave: () => void;
  } = $props();

  let saving = $state(false);
  let errorMsg = $state('');

  let form = $state<Partial<Procedimiento>>({});

  let isEdit = $derived(!!procedimiento?.ind);
  let title = $derived(isEdit ? 'Editar Procedimiento' : 'Nuevo Procedimiento');

  let colorHex = $state('#000000');

  function rgbToHex(rgb: string): string {
    if (!rgb) return '#000000';
    const parts = rgb.split(';').map(Number);
    if (parts.length !== 3) return '#000000';
    return '#' + parts.map(p => p.toString(16).padStart(2, '0')).join('');
  }

  function hexToRgb(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r};${g};${b}`;
  }

  $effect(() => {
    if (open) {
      if (procedimiento) {
        form = { ...procedimiento };
        colorHex = rgbToHex(procedimiento.color);
      } else {
        form = { tabla: 'examen_tipo_1', tipo: '1' };
        colorHex = '#000000';
      }
      errorMsg = '';
    }
  });

  const tablaOptions = TABLAS.map(t => ({ value: t, label: TABLAS_LABELS[t] ?? t }));
  const tipoOptions = TIPOS.map(t => ({ value: t, label: TIPOS_LABELS[t] ?? t }));

  async function handleSubmit() {
    if (!form.nombre?.trim()) {
      errorMsg = 'El nombre es requerido';
      return;
    }
    if (!form.codigo?.trim()) {
      errorMsg = 'El código es requerido';
      return;
    }

    saving = true;
    errorMsg = '';
    try {
      form.color = hexToRgb(colorHex);
      const res = await guardarProcedimiento(form);
      if (res.msg) {
        open = false;
        onsave();
      } else {
        errorMsg = 'Error al guardar el procedimiento';
      }
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : 'Error desconocido';
    } finally {
      saving = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
</svelte:head>

<Modal bind:open {title} size="md" autoclose={false} class="max-h-[90vh] overflow-y-auto">
  <div class="glass-modal px-2 py-4 sm:px-4">
    <!-- Error Alert -->
    {#if errorMsg}
      <div class="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 backdrop-blur">
        <svg class="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {errorMsg}
      </div>
    {/if}

    <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-6">
      <!-- Sección: Información Principal -->
      <div class="space-y-4">
        <h3 class="flex items-center gap-2 text-sm font-semibold text-gray-300">
          <svg class="size-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          Información Principal
        </h3>
        
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="group relative">
            <label for="codigo" class="mb-1.5 block text-sm font-medium text-gray-400 transition-colors group-focus-within:text-cyan-400">
              Código *
            </label>
            <input
              id="codigo"
              type="text"
              bind:value={form.codigo}
              required
              placeholder="0001"
              class="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-white placeholder-gray-600 backdrop-blur transition-all duration-300 focus:border-cyan-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <div class="group relative">
            <label for="nombre" class="mb-1.5 block text-sm font-medium text-gray-400 transition-colors group-focus-within:text-cyan-400">
              Nombre *
            </label>
            <input
              id="nombre"
              type="text"
              bind:value={form.nombre}
              required
              placeholder="Nombre del procedimiento"
              class="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-white placeholder-gray-600 backdrop-blur transition-all duration-300 focus:border-cyan-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
        </div>
      </div>

      <!-- Sección: Clasificación -->
      <div class="space-y-4">
        <h3 class="flex items-center gap-2 text-sm font-semibold text-gray-300">
          <svg class="size-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          Clasificación
        </h3>
        
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="group relative">
            <label for="tabla" class="mb-1.5 block text-sm font-medium text-gray-400 transition-colors group-focus-within:text-cyan-400">
              Tabla
            </label>
            <select
              id="tabla"
              bind:value={form.tabla}
              class="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-white backdrop-blur transition-all duration-300 focus:border-cyan-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            >
              {#each tablaOptions as opt}
                <option value={opt.value} class="bg-gray-900">{opt.label}</option>
              {/each}
            </select>
          </div>
          <div class="group relative">
            <label for="tipo" class="mb-1.5 block text-sm font-medium text-gray-400 transition-colors group-focus-within:text-cyan-400">
              Tipo
            </label>
            <select
              id="tipo"
              bind:value={form.tipo}
              class="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-white backdrop-blur transition-all duration-300 focus:border-cyan-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            >
              {#each tipoOptions as opt}
                <option value={opt.value} class="bg-gray-900">{opt.label}</option>
              {/each}
            </select>
          </div>
        </div>
      </div>

      <!-- Sección: Detalles -->
      <div class="space-y-4">
        <h3 class="flex items-center gap-2 text-sm font-semibold text-gray-300">
          <svg class="size-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Detalles
        </h3>
        
        <div class="group relative">
          <label for="info" class="mb-1.5 block text-sm font-medium text-gray-400 transition-colors group-focus-within:text-cyan-400">
            Información
          </label>
          <input
            id="info"
            type="text"
            bind:value={form.info}
            placeholder="Descripción del procedimiento"
            class="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-white placeholder-gray-600 backdrop-blur transition-all duration-300 focus:border-cyan-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="group relative">
            <label for="tipoprocedimiento" class="mb-1.5 block text-sm font-medium text-gray-400 transition-colors group-focus-within:text-cyan-400">
              CUPS
            </label>
            <input
              id="tipoprocedimiento"
              type="text"
              bind:value={form.tipoprocedimiento}
              placeholder="903801"
              class="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-white placeholder-gray-600 backdrop-blur transition-all duration-300 focus:border-cyan-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <div class="group relative">
            <label for="abreviatura" class="mb-1.5 block text-sm font-medium text-gray-400 transition-colors group-focus-within:text-cyan-400">
              Abreviatura
            </label>
            <input
              id="abreviatura"
              type="text"
              bind:value={form.abreviatura}
              placeholder="Abreviatura"
              class="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-white placeholder-gray-600 backdrop-blur transition-all duration-300 focus:border-cyan-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
        </div>
      </div>

      <!-- Sección: Valores de Referencia -->
      <div class="space-y-4">
        <h3 class="flex items-center gap-2 text-sm font-semibold text-gray-300">
          <svg class="size-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Valores de Referencia
        </h3>
        
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div class="group relative">
            <label for="unidades" class="mb-1.5 block text-sm font-medium text-gray-400 transition-colors group-focus-within:text-cyan-400">
              Unidades
            </label>
            <input
              id="unidades"
              type="text"
              bind:value={form.unidades}
              placeholder="mg/dl"
              class="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-white placeholder-gray-600 backdrop-blur transition-all duration-300 focus:border-cyan-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <div class="group relative">
            <label for="constante" class="mb-1.5 block text-sm font-medium text-gray-400 transition-colors group-focus-within:text-cyan-400">
              Valores de referencia
            </label>
            <input
              id="constante"
              type="text"
              bind:value={form.constante}
              placeholder="1.5-7.0"
              class="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-white placeholder-gray-600 backdrop-blur transition-all duration-300 focus:border-cyan-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <div class="group relative">
            <label for="color" class="mb-1.5 block text-sm font-medium text-gray-400 transition-colors group-focus-within:text-cyan-400">
              Color
            </label>
            <div class="flex items-center gap-2 sm:gap-3">
              <div class="relative flex-1">
                <input
                  type="color"
                  id="color"
                  bind:value={colorHex}
                  class="h-10 w-full cursor-pointer rounded-xl border border-white/20 bg-white/5 p-1 transition-all duration-300 hover:border-white/30 sm:h-12"
                />
              </div>
              <span class="hidden rounded-lg bg-white/10 px-2 py-2 text-xs font-mono text-gray-300 sm:inline sm:px-3 sm:text-sm">
                {hexToRgb(colorHex)}
              </span>
            </div>
          </div>
        </div>

        <div class="group relative">
          <label for="constante2" class="mb-1.5 block text-sm font-medium text-gray-400 transition-colors group-focus-within:text-cyan-400">
            Referencia extendida
          </label>
          <textarea
            id="constante2"
            bind:value={form.constante2}
            rows={6}
            placeholder="Valores de referencia extendidos"
            class="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white placeholder-gray-600 backdrop-blur transition-all duration-300 focus:border-cyan-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 resize-none"
          ></textarea>
        </div>
      </div>

      <!-- Botones -->
      <div class="sticky bottom-0 flex flex-col gap-3 bg-gray-900 pt-4 sm:relative sm:flex-row sm:justify-end sm:bg-transparent">
        <button
          type="button"
          onclick={() => (open = false)}
          class="w-full rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-gray-300 backdrop-blur transition-all duration-300 hover:bg-white/10 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 sm:w-auto"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          class="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 text-sm font-semibold text-gray-900 shadow-lg shadow-amber-500/25 transition-all duration-300 hover:from-amber-400 hover:to-yellow-400 hover:shadow-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          <span class="flex items-center justify-center gap-2">
            {#if saving}
              <svg class="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            {:else}
              <FloppyDiskOutline class="size-4" />
              Guardar
            {/if}
          </span>
        </button>
      </div>
    </form>
  </div>
</Modal>

<style>
  :global(.glass-modal) {
    position: relative;
    padding: 1.5rem;
  }

  :global(.glass-modal::before) {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 1rem;
    background: linear-gradient(to bottom right, rgba(255,255,255,0.05), transparent);
    pointer-events: none;
    z-index: -1;
  }

  :global(select option) {
    background-color: #111827;
    color: white;
  }
</style>