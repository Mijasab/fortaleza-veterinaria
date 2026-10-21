<script lang="ts">
    import { enhance } from '$app/forms';
    let { data, form } = $props();

    // 1. Estados para el Buscador (Activado por botón)
    let inputBusqueda = $state(''); // Lo que el usuario escribe en la caja
    let terminoBusqueda = $state(''); // Lo que realmente filtra la tabla

    // Filtra basándose solo cuando terminoBusqueda se actualiza al dar clic
    let propietariosFiltrados = $derived(
        data.propietarios.filter(p => p.nombre_completo.toLowerCase().includes(terminoBusqueda.toLowerCase()))
    );

    // Función que se dispara al presionar el botón "Buscar"
    function realizarBusqueda() {
        terminoBusqueda = inputBusqueda;
    }

    // 2. Estado para mostrar/ocultar el formulario de Registro
    let mostrandoRegistro = $state(false);

    // 3. Estados para Ver
    let viendoDetalle = $state(false);
    let propViendo = $state({ nombre_completo: '', telefono: '', mascotasAsociadas: [] as any[] });

    // 4. Estados para Modificar
    let editando = $state(false);
    let propEditado = $state({ id_propietario: 0, nombre_completo: '', telefono: '' });

    function verDetalle(prop: any) {
        propViendo = { ...prop };
        viendoDetalle = true;
    }

    function cerrarDetalle() {
        viendoDetalle = false;
    }

    function iniciarEdicion(prop: any) {
        propEditado = { ...prop };
        editando = true;
    }

    function cancelarEdicion() {
        editando = false;
    }
</script>

<svelte:head>
    <title>Gestión de propietarios - Fortaleza Veterinaria</title>
</svelte:head>

<main style="padding: 2rem;">
    <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 900px; margin: 0 auto; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        
        <h2 style="color: #111827; margin-top: 0; font-size: 1.5rem; margin-bottom: 0.25rem;">Gestión de propietarios</h2>
        <p style="font-size: 0.85rem; color: #6b7280; margin-top: 0; margin-bottom: 1.5rem;">Pantalla IU-02, caso de uso CU-02, requisito FR-02</p>

        <!-- Bloque 1: Búsqueda y Tabla -->
        <div style="border: 1px dashed #d1d5db; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
            
            <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
                <!-- Caja de texto bindeada a inputBusqueda -->
                <input type="text" bind:value={inputBusqueda} placeholder="Buscar propietario" style="flex: 1; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px;" />
                
                <!-- Botón Buscar que ejecuta la función -->
                <button type="button" onclick={realizarBusqueda} style="background-color: white; color: #1e3a8a; border: 1px solid #1e3a8a; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">
                    Buscar
                </button>
                
                <button type="button" onclick={() => mostrandoRegistro = true} style="background-color: #1e3a8a; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">
                    Registrar propietario
                </button>
            </div>

            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="background-color: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                        <th style="padding: 0.75rem; color: #374151;">Propietario</th>
                        <th style="padding: 0.75rem; color: #374151;">Teléfono</th>
                        <th style="padding: 0.75rem; color: #374151;">Mascotas</th>
                        <th style="padding: 0.75rem; color: #374151;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {#each propietariosFiltrados as prop}
                        <tr style="border-bottom: 1px dashed #e5e7eb;">
                            <td style="padding: 0.75rem; color: #4b5563;">{prop.nombre_completo}</td>
                            <td style="padding: 0.75rem; color: #4b5563;">{prop.telefono}</td>
                            <td style="padding: 0.75rem; color: #4b5563; font-weight: bold;">{prop.cantidad_mascotas}</td>
                            <td style="padding: 0.75rem;">
                                <a href="#!" onclick={() => verDetalle(prop)} style="color: #4b5563; text-decoration: none;">Ver</a>,
                                <a href="#!" onclick={() => iniciarEdicion(prop)} style="color: #4b5563; text-decoration: none; margin-left: 0.25rem;">Modificar</a>
                            </td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="4" style="padding: 1rem; text-align: center; color: #6b7280;">
                                {terminoBusqueda ? 'No se encontraron coincidencias.' : 'No hay propietarios registrados.'}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <!-- Bloque 2: Formulario de Registro (Desplegable) -->
        {#if mostrandoRegistro}
            <div style="border: 1px solid #ef4444; padding: 1.5rem; border-radius: 8px;">
                <h3 style="margin-top: 0; color: #111827; margin-bottom: 1.5rem;">Registrar propietario</h3>
                
                {#if form?.error && !form?.errorEditar}
                    <div style="background-color: #fee2e2; color: #b91c1c; padding: 0.75rem; border: 1px solid #f87171; border-radius: 4px; margin-bottom: 1rem; font-size: 0.9rem;">
                        {form.error}
                    </div>
                {/if}

                {#if form?.success && !form?.successEditar}
                    <div style="background-color: #dcfce3; color: #166534; padding: 0.75rem; border: 1px solid #bbf7d0; border-radius: 4px; margin-bottom: 1rem; font-size: 0.9rem;">
                        Propietario registrado exitosamente.
                    </div>
                {/if}

                <form method="POST" action="?/registrar" use:enhance={() => {
                    return async ({ update }) => {
                        await update();
                        if (!form?.error) mostrandoRegistro = false; 
                    };
                }}>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                        <div>
                            <label for="nombre_completo" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Nombre completo *</label>
                            <input type="text" id="nombre_completo" name="nombre_completo" required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                        </div>
                        <div>
                            <label for="telefono" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Teléfono *</label>
                            <input type="text" id="telefono" name="telefono" required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
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

    <!-- Modales de Ver y Modificar se mantienen exactamente igual... -->
    {#if viendoDetalle}
        <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 50;">
            <div style="background: white; padding: 2rem; border-radius: 8px; width: 100%; max-width: 450px;">
                <h3 style="margin-top: 0; color: #1e3a8a; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem;">Detalles del Propietario</h3>
                <div style="margin-top: 1rem;">
                    <p><strong>Nombre:</strong> {propViendo.nombre_completo}</p>
                    <p><strong>Teléfono:</strong> {propViendo.telefono}</p>
                </div>

                <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
                    <h4 style="margin-top: 0; color: #374151;">Mascotas asociadas:</h4>
                    {#if propViendo.mascotasAsociadas && propViendo.mascotasAsociadas.length > 0}
                        <ul style="padding-left: 1.5rem; color: #4b5563; margin-bottom: 0;">
                            {#each propViendo.mascotasAsociadas as mascota}
                                <li style="margin-bottom: 0.25rem;"><strong>{mascota.nombre}</strong> - {mascota.especie} ({mascota.raza || 'N/A'})</li>
                            {/each}
                        </ul>
                    {:else}
                        <p style="margin: 0; color: #6b7280; font-size: 0.85rem; font-style: italic;">No tiene mascotas registradas.</p>
                    {/if}
                </div>

                <div style="margin-top: 1.5rem; text-align: right;">
                    <button type="button" onclick={cerrarDetalle} style="background-color: #1e3a8a; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">Cerrar</button>
                </div>
            </div>
        </div>
    {/if}

    {#if editando}
        <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 50;">
            <div style="background: white; padding: 2rem; border-radius: 8px; width: 100%; max-width: 500px;">
                <h3 style="margin-top: 0; color: #1e3a8a; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem;">Modificar Propietario</h3>
                
                {#if form?.errorEditar}
                    <div style="background-color: #fee2e2; color: #b91c1c; padding: 0.75rem; border: 1px solid #f87171; border-radius: 4px; margin-bottom: 1rem;">{form.errorEditar}</div>
                {/if}

                <form method="POST" action="?/modificar" use:enhance={() => { return async ({ update }) => { await update(); cancelarEdicion(); }; }}>
                    <input type="hidden" name="id_propietario" value={propEditado.id_propietario} />
                    <div style="display: grid; gap: 1rem; margin-top: 1rem;">
                        <div>
                            <label for="mod_nombre" style="display: block; font-size: 0.85rem; color: #4b5563;">Nombre completo *</label>
                            <input type="text" id="mod_nombre" name="nombre_completo" value={propEditado.nombre_completo} required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                        </div>
                        <div>
                            <label for="mod_telefono" style="display: block; font-size: 0.85rem; color: #4b5563;">Teléfono *</label>
                            <input type="text" id="mod_telefono" name="telefono" value={propEditado.telefono} required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
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