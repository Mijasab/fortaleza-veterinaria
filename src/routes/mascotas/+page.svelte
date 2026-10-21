<script lang="ts">
    import { enhance } from '$app/forms';
    let { data, form } = $props();

    // 1. Estados para el Buscador de Mascotas
    let inputBusqueda = $state(''); 
    let terminoBusqueda = $state(''); 
    let mascotasFiltradas = $derived(
        data.mascotas.filter((m: { nombre: string }) => m.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()))
    );

    function realizarBusqueda() {
        terminoBusqueda = inputBusqueda;
    }

    // 2. Estado del formulario de Registro
    let mostrandoRegistro = $state(false);

    // --- SOLUCIÓN DE ESCALABILIDAD (Autocompletado de Propietarios) ---
    // Variables para buscar y enlazar el ID del dueño sin usar un <select> gigante
    let inputPropRegistro = $state('');
    let idPropRegistro = $derived(data.propietarios.find((p: { nombre_completo: string; id_propietario: number }) => p.nombre_completo === inputPropRegistro)?.id_propietario || '');

    let inputPropMod = $state('');
    let idPropMod = $derived(data.propietarios.find((p: { nombre_completo: string; id_propietario: number }) => p.nombre_completo === inputPropMod)?.id_propietario || '');
    // -------------------------------------------------------------------

    // 3. Estados para Ver y Modificar
    let viendoDetalle = $state(false);
    let mascotaViendo = $state({ nombre: '', especie: '', raza: '', nombre_propietario: '' });

    let editando = $state(false);
    let mascotaEditada = $state({ id_mascota: 0, nombre: '', especie: '', raza: '', id_propietario: 0 });

    let mostrarExitoRegistro = $state(false);

    function verDetalle(mascota: any) {
        mascotaViendo = { ...mascota };
        viendoDetalle = true;
    }

    function cerrarDetalle() {
        viendoDetalle = false;
    }

    function iniciarEdicion(mascota: any) {
        mascotaEditada = { ...mascota };
        inputPropMod = mascota.nombre_propietario; // Carga el nombre actual en el buscador
        editando = true;
    }

    function cancelarEdicion() {
        editando = false;
    }
</script>

<svelte:head>
    <title>Gestión de mascotas - Fortaleza Veterinaria</title>
</svelte:head>

<main style="padding: 2rem;">
    <!-- Lista de datos invisible compartida para el autocompletado -->
    <datalist id="lista-propietarios">
        {#each data.propietarios as prop}
            <option value={prop.nombre_completo}></option>
        {/each}
    </datalist>

    <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 900px; margin: 0 auto; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        
        <h2 style="color: #111827; margin-top: 0; font-size: 1.5rem; margin-bottom: 0.25rem;">Gestión de mascotas</h2>

        <!-- Bloque 1: Búsqueda y Tabla -->
        <div style="border: 1px dashed #d1d5db; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
            
            <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
                <input type="text" bind:value={inputBusqueda} placeholder="Buscar mascota" style="flex: 1; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px;" />
                <button type="button" onclick={realizarBusqueda} style="background-color: white; color: #1e3a8a; border: 1px solid #1e3a8a; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">Buscar</button>
                <button type="button" onclick={() => { mostrandoRegistro = true; mostrarExitoRegistro = false; }} style="background-color: #1e3a8a; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">
                    Registrar mascota
                </button>            
                </div>

            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="background-color: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                        <th style="padding: 0.75rem; color: #374151;">Mascota</th>
                        <th style="padding: 0.75rem; color: #374151;">Especie</th>
                        <th style="padding: 0.75rem; color: #374151;">Raza</th> <!-- Columna Nueva -->
                        <th style="padding: 0.75rem; color: #374151;">Propietario</th>
                        <th style="padding: 0.75rem; color: #374151;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {#each mascotasFiltradas as mascota}
                        <tr style="border-bottom: 1px dashed #e5e7eb;">
                            <td style="padding: 0.75rem; color: #4b5563;">{mascota.nombre}</td>
                            <td style="padding: 0.75rem; color: #4b5563;">{mascota.especie}</td>
                            <td style="padding: 0.75rem; color: #4b5563;">{mascota.raza || 'N/A'}</td> <!-- Dato de Raza -->
                            <td style="padding: 0.75rem; color: #4b5563;">{mascota.nombre_propietario}</td>
                            <td style="padding: 0.75rem;">
                                <a href="#!" onclick={() => verDetalle(mascota)} style="color: #4b5563; text-decoration: none;">Ver</a>,
                                <a href="#!" onclick={() => iniciarEdicion(mascota)} style="color: #4b5563; text-decoration: none; margin-left: 0.25rem;">Modificar</a>
                            </td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="5" style="padding: 1rem; text-align: center; color: #6b7280;">
                                {terminoBusqueda ? 'No se encontraron coincidencias.' : 'No hay mascotas registradas.'}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <!-- Bloque 2: Formulario de Registro (Desplegable) -->
        {#if mostrandoRegistro}
            <div style="border: 1px solid #ef4444; padding: 1.5rem; border-radius: 8px;">
                <h3 style="margin-top: 0; color: #111827; margin-bottom: 1.5rem;">Registrar mascota</h3>
                
                {#if form?.error && !form?.errorEditar}
                    <div style="background-color: #fee2e2; color: #b91c1c; padding: 0.75rem; border: 1px solid #f87171; border-radius: 4px; margin-bottom: 1rem; font-size: 0.9rem;">{form.error}</div>
                {/if}

                {#if mostrarExitoRegistro}
                    <div style="background-color: #dcfce3; color: #166534; padding: 0.75rem; border: 1px solid #bbf7d0; border-radius: 4px; margin-bottom: 1rem; font-size: 0.9rem;">
                        Mascota registrada exitosamente.
                    </div>
                {/if}

                <form method="POST" action="?/registrar" use:enhance={() => {
                return async ({ update, result }) => {
                    await update(); // Actualiza la tabla por debajo
                    
                    if (result.type === 'success') {
                        mostrarExitoRegistro = true; // 1. Mostramos el mensaje verde
                        
                        // 2. Esperamos 2 segundos para que el usuario lo lea, y luego cerramos el formulario
                        setTimeout(() => {
                            mostrarExitoRegistro = false;
                            mostrandoRegistro = false;
                        }, 2000);
                    }
                };
            }}>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                        <div>
                            <label for="nombre" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Nombre *</label>
                            <input type="text" id="nombre" name="nombre" required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                        </div>
                        <div>
                            <label for="especie" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Especie *</label>
                            <input type="text" id="especie" name="especie" required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                        </div>
                        <div>
                            <label for="raza" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Raza</label>
                            <input type="text" id="raza" name="raza" style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                        </div>
                        <div>
                            <label for="inputPropRegistro" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Propietario *</label>
                            <!-- Input autocompletable -->
                            <input type="text" id="inputPropRegistro" list="lista-propietarios" bind:value={inputPropRegistro} required placeholder="Escriba o seleccione..." autocomplete="off" style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                            <!-- Input oculto para la base de datos -->
                            <input type="hidden" name="id_propietario" value={idPropRegistro} required />
                        </div>
                    </div>

                    <div style="display: flex; gap: 0.5rem;">
                        <button type="submit" style="background-color: #1e3a8a; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">Confirmar registro</button>
                        <button type="button" onclick={() => mostrandoRegistro = false} style="background-color: white; color: #1e3a8a; border: 1px solid #1e3a8a; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">Cancelar</button>
                    </div>
                </form>
            </div>
        {/if}
    </div>

    <!-- Modal para VER -->
    {#if viendoDetalle}
        <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 50;">
            <div style="background: white; padding: 2rem; border-radius: 8px; width: 100%; max-width: 400px;">
                <h3 style="margin-top: 0; color: #1e3a8a; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem;">Detalles de la Mascota</h3>
                <div style="margin-top: 1rem;">
                    <p><strong>Nombre:</strong> {mascotaViendo.nombre}</p>
                    <p><strong>Especie:</strong> {mascotaViendo.especie}</p>
                    <p><strong>Raza:</strong> {mascotaViendo.raza || 'No especificada'}</p>
                    <p><strong>Propietario:</strong> {mascotaViendo.nombre_propietario}</p>
                </div>
                <div style="margin-top: 1.5rem; text-align: right;">
                    <button type="button" onclick={cerrarDetalle} style="background-color: #1e3a8a; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">Cerrar</button>
                </div>
            </div>
        </div>
    {/if}

    <!-- Modal para MODIFICAR -->
    {#if editando}
        <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 50;">
            <div style="background: white; padding: 2rem; border-radius: 8px; width: 100%; max-width: 500px;">
                <h3 style="margin-top: 0; color: #1e3a8a; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem;">Modificar Mascota</h3>
                
                {#if form?.errorEditar}
                    <div style="background-color: #fee2e2; color: #b91c1c; padding: 0.75rem; border: 1px solid #f87171; border-radius: 4px; margin-bottom: 1rem;">{form.errorEditar}</div>
                {/if}

                <form method="POST" action="?/modificar" use:enhance={() => { return async ({ update }) => { await update(); cancelarEdicion(); }; }}>
                    <input type="hidden" name="id_mascota" value={mascotaEditada.id_mascota} />
                    <div style="display: grid; gap: 1rem; margin-top: 1rem;">
                        <div>
                            <label for="mod_nombre" style="display: block; font-size: 0.85rem; color: #4b5563;">Nombre *</label>
                            <input type="text" id="mod_nombre" name="nombre" value={mascotaEditada.nombre} required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                        </div>
                        <div>
                            <label for="mod_especie" style="display: block; font-size: 0.85rem; color: #4b5563;">Especie *</label>
                            <input type="text" id="mod_especie" name="especie" value={mascotaEditada.especie} required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                        </div>
                        <div>
                            <label for="mod_raza" style="display: block; font-size: 0.85rem; color: #4b5563;">Raza</label>
                            <input type="text" id="mod_raza" name="raza" value={mascotaEditada.raza} style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                        </div>
                        <div>
                            <label for="inputPropMod" style="display: block; font-size: 0.85rem; color: #4b5563;">Propietario *</label>
                            <!-- Input autocompletable de edición -->
                            <input type="text" id="inputPropMod" list="lista-propietarios" bind:value={inputPropMod} required placeholder="Escriba o seleccione..." autocomplete="off" style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                            <!-- Input oculto para la base de datos -->
                            <input type="hidden" name="id_propietario" value={idPropMod} required />
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem; justify-content: flex-end;">
                        <button type="button" onclick={cancelarEdicion} style="background-color: white; color: #1e3a8a; border: 1px solid #1e3a8a; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">Cancelar</button>
                        <button type="submit" style="background-color: #1e3a8a; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">Guardar cambios</button>
                    </div>
                </form>
            </div>
        </div>
    {/if}
</main>