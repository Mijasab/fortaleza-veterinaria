<script lang="ts">
    import { enhance } from '$app/forms';
    
    // Nueva sintaxis de Svelte 5 usando $props()
    let { form } = $props();
</script>

<svelte:head>
    <title>Iniciar sesión - Fortaleza Veterinaria</title>
</svelte:head>

<main style="display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f3f4f6; font-family: sans-serif;">
    
    <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; max-width: 400px;">
        
        <h2 style="margin-top: 0; color: #1e3a8a;">Iniciar sesión</h2>
        <p style="font-size: 0.85rem; color: #6b7280; margin-bottom: 1.5rem;">Pantalla IU-01, caso de uso CU-01, requisito FR-01</p>

        <!-- Alerta de credenciales no válidas -->
        {#if form?.error}
            <div style="background-color: #fee2e2; color: #b91c1c; padding: 0.75rem; border: 1px solid #f87171; border-radius: 4px; margin-bottom: 1rem; font-size: 0.9rem;">
                {form.error}
            </div>
        {/if}

        <form method="POST" use:enhance style="display: flex; flex-direction: column; gap: 1rem;">
            
            <!-- Campo Usuario -->
            <div>
                <label for="usuario" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.25rem;">Nombre de usuario</label>
                <input type="text" id="usuario" name="username" required style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; box-sizing: border-box;" />
            </div>

            <!-- Campo Contraseña -->
            <div>
                <label for="contrasena" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.25rem;">Contraseña</label>
                <input type="password" id="contrasena" name="password" required style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; box-sizing: border-box;" />
            </div>

            <!-- Botones -->
            <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                <button type="submit" style="background-color: #1e3a8a; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-weight: bold;">
                    Iniciar sesión
                </button>
                <button type="button" style="background-color: white; color: #1e3a8a; border: 1px solid #1e3a8a; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
                    Cancelar
                </button>
            </div>

        </form>
    </div>
</main>