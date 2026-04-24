<script lang="ts">
  import { onMount } from 'svelte';

  import { login, loginGoogle, type Usuario } from '../service';

  interface Props {
    onLogin: (usuario: Usuario) => void;
  }

  let { onLogin }: Props = $props();

  let loading = $state(false);
  let errorMsg = $state('');
  let idInput = $state('');

  async function handleLogin() {
    if (!idInput.trim()) {
      errorMsg = 'Ingrese su ID';
      return;
    }
    loading = true;
    errorMsg = '';
    try {
      const res = await login(idInput.trim());
      if (res.success && res.usuario) {
        onLogin(res.usuario);
      } else {
        errorMsg = res.mensaje || 'ID no autorizado';
      }
    } catch (e) {
      errorMsg = 'Error de conexión';
    } finally {
      loading = false;
    }
  }

  function handleCredentialResponse(response: { credential: string }) {
    loading = true;
    errorMsg = '';
    loginGoogle(response.credential).then(res => {
      if (res.success && res.usuario) {
        onLogin(res.usuario);
      } else {
        errorMsg = res.mensaje || 'Email no autorizado';
      }
    }).catch(() => {
      errorMsg = 'Error con Google';
    }).finally(() => {
      loading = false;
    });
  }

  function triggerGoogleSignIn() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (window as any).google;
    if (g?.accounts?.id) {
      loading = true;
      g.accounts.id.prompt((notification: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((notification as any)?.getNotificationType() === 'resuming') {
          loading = false;
        }
      });
    }
  }

  onMount(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (window as any).google;
    if (g?.accounts?.id) {
      g.accounts.id.initialize({
        client_id: '162861936617-aato9lpla08g5edots6fegvbkq7d6rti.apps.googleusercontent.com',
        callback: handleCredentialResponse,
        auto_prompt: false
      });
    }
  });

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      handleLogin();
    }
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
</svelte:head>

<!-- Animated Background -->
<div class="fixed inset-0 z-0 overflow-hidden bg-gray-900">
  <!-- Orbit 1 -->
  <div class="absolute -left-32 -top-32 size-96 rounded-full bg-cyan-500/20 blur-[120px] animate-pulse"></div>
  <!-- Orbit 2 -->
  <div class="absolute -right-32 top-1/3 size-80 rounded-full bg-purple-500/15 blur-[100px] animate-pulse" style="animation-delay: 1s;"></div>
  <!-- Orbit 3 -->
  <div class="absolute bottom-0 left-1/3 size-[500px] rounded-full bg-blue-600/10 blur-[120px] animate-pulse" style="animation-delay: 2s;"></div>
  <!-- Grid pattern -->
  <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
</div>

<!-- Login Card -->
<div class="relative z-10 flex min-h-screen items-center justify-center px-4">
  <div class="w-full max-w-md animate-in fade-in zoom-in-95 duration-500 ease-out">
    
    <!-- Glass Card -->
    <div class="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      
      <!-- Inner glow -->
      <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
      
      <!-- Content -->
      <div class="relative space-y-6 p-8">
        
        <!-- Header -->
        <div class="text-center space-y-2">
          <!-- Logo Icon -->
          <div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
            <svg class="size-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          
          <h1 class="text-3xl font-bold tracking-tight text-white">
            ConfigLab <span class="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">MyCar</span>
          </h1>
          
          <p class="text-sm text-gray-400">
            Inicie sesión para continuar
          </p>
        </div>

        <!-- Error Alert -->
        {#if errorMsg}
          <div class="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400 backdrop-blur">
            <svg class="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errorMsg}
          </div>
        {/if}

        <!-- ID Input -->
        <div class="space-y-2">
          <label for="user-id" class="text-sm font-medium text-gray-300">
            ID de usuario
          </label>
          <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <svg class="size-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              id="user-id"
              type="text"
              bind:value={idInput}
              onkeydown={handleKeydown}
              disabled={loading}
              placeholder="Ingrese su ID"
              class="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-white placeholder-gray-500 backdrop-blur transition-all duration-300 focus:border-cyan-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <!-- Login Button -->
        <button
          onclick={handleLogin}
          disabled={loading}
          class="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 py-3.5 font-semibold text-gray-900 shadow-lg shadow-amber-500/25 transition-all duration-300 hover:from-amber-400 hover:to-yellow-400 hover:shadow-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span class="flex items-center justify-center gap-2">
            {#if loading}
              <svg class="size-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verificando...
            {:else}
              <svg class="size-5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l4-4m0 0l-4-4m4 4H7m4 0v4m0-4V7" />
              </svg>
              Iniciar sesión
            {/if}
          </span>
        </button>

        <!-- Divider -->
        <div class="relative flex items-center py-2">
          <div class="flex-1 border-t border-white/10"></div>
          <span class="px-4 text-sm text-gray-500">o</span>
          <div class="flex-1 border-t border-white/10"></div>
        </div>

        <!-- Google Button -->
        <button
          onclick={triggerGoogleSignIn}
          disabled={loading}
          class="group relative w-full overflow-hidden rounded-xl border border-white/20 bg-white/5 py-3.5 font-medium text-white backdrop-blur transition-all duration-300 hover:bg-white/10 hover:border-white/30 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white/20 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span class="flex items-center justify-center gap-3">
            {#if loading}
              <svg class="size-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Conectando...
            {:else}
              <!-- Google Icon -->
              <svg class="size-5" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.96 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.38-1.36-.38-2.09s.16-1.43.38-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.96 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuar con Google
            {/if}
          </span>
        </button>

      </div>
    </div>

    <!-- Footer -->
    <p class="mt-6 text-center text-xs text-gray-600">
      Sistema de gestión de laboratorio
    </p>
  </div>
</div>

<style>
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @keyframes zoom-in-95 {
    from {
      transform: scale(0.95);
    }
    to {
      transform: scale(1);
    }
  }

  .animate-in {
    animation: fade-in 0.5s ease-out, zoom-in-95 0.5s ease-out;
  }

  @media (prefers-reduced-motion: reduce) {
    .animate-in {
      animation: none;
    }
  }
</style>