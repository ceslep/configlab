<script lang="ts">
  import { Button, Modal } from 'flowbite-svelte';
  import { ExclamationCircleOutline, TrashBinOutline } from 'flowbite-svelte-icons';

  import type { Procedimiento } from '../constants';
  import { eliminarProcedimiento } from '../service';

  let {
    open = $bindable(false),
    procedimiento = null,
    ondelete,
  }: {
    open: boolean;
    procedimiento: Procedimiento | null;
    ondelete: () => void;
  } = $props();

  let deleting = $state(false);
  let errorMsg = $state('');

  async function handleDelete() {
    if (!procedimiento) return;
    deleting = true;
    errorMsg = '';
    try {
      const res = await eliminarProcedimiento(Number(procedimiento.ind));
      if (res.msg) {
        open = false;
        ondelete();
      } else {
        errorMsg = 'Error al eliminar el procedimiento';
      }
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : 'Error desconocido';
    } finally {
      deleting = false;
    }
  }
</script>

<Modal bind:open title="Confirmar eliminación" size="sm" autoclose={false}>
  <div class="space-y-4">
    {#if errorMsg}
      <div class="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
        {errorMsg}
      </div>
    {/if}

    <div class="flex justify-center">
      <ExclamationCircleOutline class="h-12 w-12 text-red-500" />
    </div>
    <p class="text-center text-gray-600 dark:text-gray-300">
      ¿Está seguro de eliminar el procedimiento
      <strong class="text-gray-900 dark:text-white">{procedimiento?.nombre}</strong>?
    </p>
    <p class="text-sm text-gray-500 dark:text-gray-400">
      Esta acción no se puede deshacer.
    </p>

    <div class="flex justify-end gap-3 pt-2">
      <Button color="alternative" onclick={() => (open = false)}>Cancelar</Button>
      <Button color="red" onclick={handleDelete} disabled={deleting}>
        <TrashBinOutline class="mr-1 h-4 w-4" />
        {deleting ? 'Eliminando...' : 'Eliminar'}
      </Button>
    </div>
  </div>
</Modal>
