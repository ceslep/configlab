<script lang="ts">
  import { Button } from 'flowbite-svelte';
  import { TrashBinOutline } from 'flowbite-svelte-icons';

  let {
    value = '',
    onchange,
    width = 400,
    height = 200,
  }: {
    value: string;
    onchange: (base64: string) => void;
    width?: number;
    height?: number;
  } = $props();

  let canvas: HTMLCanvasElement;
  let drawing = $state(false);
  let hasContent = $state(false);

  function getCtx() {
    return canvas?.getContext('2d');
  }

  function getPos(e: MouseEvent | TouchEvent): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  function startDraw(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    drawing = true;
    const ctx = getCtx();
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(e: MouseEvent | TouchEvent) {
    if (!drawing) return;
    e.preventDefault();
    const ctx = getCtx();
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    hasContent = true;
  }

  function stopDraw() {
    if (!drawing) return;
    drawing = false;
    if (hasContent) {
      onchange(canvas.toDataURL('image/png'));
    }
  }

  function clear() {
    const ctx = getCtx();
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasContent = false;
    onchange('');
  }

  $effect(() => {
    if (!canvas) return;
    const ctx = getCtx();
    if (!ctx) return;
    if (value && !hasContent) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        hasContent = true;
      };
      img.src = value;
    }
  });
</script>

<div class="space-y-2">
  <canvas
    bind:this={canvas}
    {width}
    {height}
    class="w-full cursor-crosshair rounded-lg border-2 border-dashed border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
    style="touch-action: none; max-width: {width}px;"
    onmousedown={startDraw}
    onmousemove={draw}
    onmouseup={stopDraw}
    onmouseleave={stopDraw}
    ontouchstart={startDraw}
    ontouchmove={draw}
    ontouchend={stopDraw}
  ></canvas>
  <div class="flex items-center gap-2">
    <Button size="xs" color="alternative" onclick={clear} disabled={!hasContent}>
      <TrashBinOutline class="mr-1 h-3 w-3" /> Limpiar
    </Button>
    <span class="text-xs text-gray-400">Dibuje su firma con el mouse o toque</span>
  </div>
</div>
