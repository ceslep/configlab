<script lang="ts">
  import { Button, Modal, Label, Input, Select, Textarea } from 'flowbite-svelte';
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

  const tablaOptions = TABLAS.map(t => ({ value: t, name: TABLAS_LABELS[t] ?? t }));
  const tipoOptions = TIPOS.map(t => ({ value: t, name: TIPOS_LABELS[t] ?? t }));

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
</script>

<Modal bind:open {title} size="lg" autoclose={false}>
  <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
    {#if errorMsg}
      <div class="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
        {errorMsg}
      </div>
    {/if}

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <Label for="codigo" class="mb-2">Código *</Label>
        <Input id="codigo" bind:value={form.codigo} required placeholder="0001" />
      </div>
      <div>
        <Label for="nombre" class="mb-2">Nombre *</Label>
        <Input id="nombre" bind:value={form.nombre} required placeholder="Nombre del procedimiento" />
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <Label for="tabla" class="mb-2">Tabla</Label>
        <Select id="tabla" bind:value={form.tabla} items={tablaOptions} placeholder="Seleccionar tabla" />
      </div>
      <div>
        <Label for="tipo" class="mb-2">Tipo</Label>
        <Select id="tipo" bind:value={form.tipo} items={tipoOptions} placeholder="Seleccionar tipo" />
      </div>
    </div>

    <div>
      <Label for="info" class="mb-2">Información</Label>
      <Input id="info" bind:value={form.info} placeholder="Descripción del procedimiento" />
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <Label for="tipoprocedimiento" class="mb-2">CUPS</Label>
        <Input id="tipoprocedimiento" bind:value={form.tipoprocedimiento} placeholder="903801" />
      </div>
      <div>
        <Label for="abreviatura" class="mb-2">Abreviatura</Label>
        <Input id="abreviatura" bind:value={form.abreviatura} placeholder="Abreviatura" />
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div>
        <Label for="unidades" class="mb-2">Unidades</Label>
        <Input id="unidades" bind:value={form.unidades} placeholder="mg/dl" />
      </div>
      <div>
        <Label for="constante" class="mb-2">Valores de referencia</Label>
        <Input id="constante" bind:value={form.constante} placeholder="1.5-7.0" />
      </div>
      <div>
        <Label for="color" class="mb-2">Color</Label>
        <div class="flex items-center gap-2">
          <input type="color" id="color" bind:value={colorHex} class="h-10 w-14 cursor-pointer rounded border" />
          <span class="text-sm text-gray-500 dark:text-gray-400">{hexToRgb(colorHex)}</span>
        </div>
      </div>
    </div>

    <div>
      <Label for="constante2" class="mb-2">Referencia extendida</Label>
      <Textarea id="constante2" bind:value={form.constante2} rows={8} placeholder="Valores de referencia extendidos" />
    </div>

    <div class="flex justify-end gap-3 pt-2">
      <Button color="alternative" onclick={() => (open = false)}>Cancelar</Button>
      <Button type="submit" disabled={saving}>
        <FloppyDiskOutline class="mr-1 h-4 w-4" />
        {saving ? 'Guardando...' : 'Guardar'}
      </Button>
    </div>
  </form>
</Modal>
