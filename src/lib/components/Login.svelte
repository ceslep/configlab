<script lang="ts">
  import { onMount } from 'svelte';
  import { Button, Input, Alert } from 'flowbite-svelte';

  import { login, loginGoogle, type Usuario } from '../service';

  interface Props {
    onLogin: (usuario: Usuario) => void;
  }

  let { onLogin }: Props = $props();

  let loading = $state(false);
  let errorMsg = $state('');
  let idInput = $state('');

  let googleToken = $state('');

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
    loginGoogle(response.credential).then(res => {
      if (res.success && res.usuario) {
        onLogin(res.usuario);
      } else {
        errorMsg = res.mensaje || 'Email no autorizado';
      }
    }).catch(() => {
      errorMsg = 'Error con Google';
    });
  }

  onMount(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (window as any).google;
    if (g?.accounts?.id) {
      g.accounts.id.initialize({
        client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
        callback: handleCredentialResponse
      });
      
      g.accounts.id.renderButton(
        document.getElementById('g_id_onlogin'),
        { theme: 'outline', size: 'large', text: 'continue_with' }
      );
    }
  });

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      handleLogin();
    }
  }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
  <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
    <h2 class="mb-4 text-center text-2xl font-bold text-gray-900 dark:text-white">
      ConfigLab MyCar
    </h2>
    <p class="mb-6 text-center text-gray-600 dark:text-gray-400">
      Ingrese su ID o inicie sesión con Google
    </p>

    {#if errorMsg}
      <Alert color="red" class="mb-4">
        {errorMsg}
      </Alert>
    {/if}

    <div class="space-y-4">
      <div>
        <Input
          type="text"
          placeholder="ID de usuario"
          bind:value={idInput}
          onkeydown={handleKeydown}
          disabled={loading}
        />
      </div>

      <Button
        color="blue"
        onclick={handleLogin}
        disabled={loading}
        class="w-full"
      >
        {loading ? 'Verificando...' : 'Iniciar sesión'}
      </Button>

      <div class="relative my-4">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="bg-white px-2 text-gray-500 dark:bg-gray-800">o</span>
        </div>
      </div>

      <div id="g_id_onlogin"></div>
    </div>
  </div>
</div>

<style>
  div :global(.g_id_signin) {
    display: flex;
    justify-content: center;
  }
</style>