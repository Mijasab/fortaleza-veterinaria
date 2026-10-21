<script lang="ts">
    import { enhance } from '\$app/forms';
    
    let { data, form } = $props();

    // 1. Buscador de Servicios Realizados
    let inputMascotaFiltro = $state('');
    let filtroMascota = $state('');

    let serviciosFiltrados = $derived(
        (data.realizados as any[]).filter(r => {
            if (!filtroMascota) return true;
            const textoBusqueda = `${r.nombre_mascota} (${r.nombre_propietario})`.toLowerCase();
            return textoBusqueda.includes(filtroMascota.toLowerCase());
        })
    );

    function consultarServicios() {
        filtroMascota = inputMascotaFiltro.trim();
    }

    // 2. Autocompletados para Registro de Servicio Realizado
    let inputMascotaRealizado = $state('');
    let idMascotaRealizado = $derived(
        (data.mascotas as any[]).find(m => `${m.nombre} (${m.nombre_propietario})` === inputMascotaRealizado)?.id_mascota || ''
    );

    // 3. Modificación de Servicio del Catálogo
    let editandoServicio = $state(false);
    let servicioEditado: any = $state({ id_servicio: 0, nombre: '', tipo: '', precio: '', estado: 'Activo' });

    function iniciarEdicion(s: any) {
        servicioEditado = { ...s };
        editandoServicio = true;
    }

    function cancelarEdicion() {
        editandoServicio = false;
    }

    function formatearFecha(fechaStr: string) {
        if (!fechaStr) return '';
        const partes = fechaStr.split('-');
        if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
        return fechaStr;
    }

    const fechaMaxima = new Date().toISOString().split('T')[0];
</script>

<svelte:head>
    <title>Gestión de servicios - Fortaleza Veterinaria</title>
</svelte:head>

<main style="padding: 2rem;">
    <!-- Datalist compartido para mascotas -->
    <datalist id="lista-mascotas-servicios">
        {#each data.mascotas as mascota}
            <option value="{mascota.nombre} ({mascota.nombre_propietario})"></option>
        {/each}
    </datalist>

    <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 950px; margin: 0 auto; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        
        <h2 style="color: #111827; margin-top: 0; font-size: 1.5rem; margin-bottom: 0.25rem;">Gestión de servicios</h2>
        <p style="font-size: 0.85rem; color: #6b7280; margin-top: 0; margin-bottom: 1.5rem;">Pantalla IU-06, casos de uso CU-08 y CU-09, requisito FR-06</p>

        <!-- SECCIÓN 1: Catálogo de Servicios -->
        <div style="border: 1px dashed #d1d5db; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
            <h3 style="margin-top: 0; color: #111827; font-size: 1.1rem; margin-bottom: 1rem;">Catálogo de servicios</h3>

            {#if form?.errorServicio}
                <div style="background-color: #fee2e2; color: #b91c1c; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem;">{form.errorServicio}</div>
            {/if}

            <!-- NUEVO: Mensaje de éxito -->
            {#if form?.successServicio}
                <div style="background-color: #dcfce3; color: #166534; padding: 0.75rem; border: 1px solid #bbf7d0; border-radius: 4px; margin-bottom: 1rem;">Servicio guardado exitosamente en el catálogo.</div>
            {/if}

            <table style="width: 100%; border-collapse: collapse; text-align: left; margin-bottom: 1.5rem;">
                <thead>
                    <tr style="background-color: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                        <th style="padding: 0.75rem; color: #374151;">Servicio</th>
                        <th style="padding: 0.75rem; color: #374151;">Tipo</th>
                        <th style="padding: 0.75rem; color: #374151;">Precio</th>
                        <th style="padding: 0.75rem; color: #374151;">Estado</th>
                        <th style="padding: 0.75rem; color: #374151;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data.servicios as s}
                        <tr style="border-bottom: 1px dashed #e5e7eb;">
                            <td style="padding: 0.75rem; color: #4b5563;">{s.nombre}</td>
                            <td style="padding: 0.75rem; color: #4b5563;">{s.tipo}</td>
                            <td style="padding: 0.75rem; color: #4b5563;">{s.precio}</td>
                            <td style="padding: 0.75rem;">
                                <span style="background-color: {s.estado === 'Activo' ? '#e0f2fe' : '#f3f4f6'}; color: {s.estado === 'Activo' ? '#0369a1' : '#6b7280'}; padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 0.8rem; font-weight: bold;">
                                    {s.estado}
                                </span>
                            </td>
                            <td style="padding: 0.75rem;">
                                <button type="button" onclick={() => iniciarEdicion(s)} style="background: none; border: none; color: #1e3a8a; cursor: pointer; padding: 0; font-weight: 500;">Modificar</button>
                            </td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="5" style="padding: 1rem; text-align: center; color: #6b7280;">No hay servicios en el catálogo.</td>
                        </tr>
                    {/each}
                </tbody>
            </table>

            <!-- Formulario para Guardar Nuevo Servicio -->
            <form method="POST" action="?/guardarServicio" use:enhance>
                <div style="display: grid; grid-template-columns: 2fr 2fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div>
                        <label for="reg_serv_nombre" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.4rem;">Nombre *</label>
                        <input type="text" id="reg_serv_nombre" name="nombre" placeholder="Nombre" required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                    </div>
                    <div>
                        <label for="reg_serv_tipo" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.4rem;">Tipo *</label>
                        <input type="text" id="reg_serv_tipo" name="tipo" placeholder="Tipo" required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                    </div>
                    <div>
                        <label for="reg_serv_precio" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.4rem;">Precio *</label>
                        <input type="text" id="reg_serv_precio" name="precio" placeholder="Precio" required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                    </div>
                </div>
                <button type="submit" style="background-color: #1e3a8a; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">Guardar servicio</button>
            </form>
        </div>

        <!-- SECCIÓN 2: Servicios Realizados -->
        <div style="border: 1px dashed #d1d5db; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
            <h3 style="margin-top: 0; color: #111827; font-size: 1.1rem; margin-bottom: 1rem;">Servicios realizados</h3>

            <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
                <input type="text" list="lista-mascotas-servicios" bind:value={inputMascotaFiltro} placeholder="Mascota" style="flex: 1; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px;" autocomplete="off" />
                <button type="button" onclick={consultarServicios} style="background-color: white; color: #1e3a8a; border: 1px solid #1e3a8a; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">Consultar</button>
            </div>

            <table style="width: 100%; border-collapse: collapse; text-align: left; margin-bottom: 1.5rem;">
                <thead>
                    <tr style="background-color: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                        <th style="padding: 0.75rem; color: #374151;">Fecha</th>
                        <th style="padding: 0.75rem; color: #374151;">Mascota</th>
                        <th style="padding: 0.75rem; color: #374151;">Servicio</th>
                        <th style="padding: 0.75rem; color: #374151;">Tipo</th>
                        <th style="padding: 0.75rem; color: #374151;">Información adicional</th>
                    </tr>
                </thead>
                <tbody>
                    {#each serviciosFiltrados as r}
                        <tr style="border-bottom: 1px dashed #e5e7eb;">
                            <td style="padding: 0.75rem; color: #4b5563;">{formatearFecha(r.fecha)}</td>
                            <td style="padding: 0.75rem; color: #4b5563;">{r.nombre_mascota}</td>
                            <td style="padding: 0.75rem; color: #4b5563;">{r.nombre_servicio}</td>
                            <td style="padding: 0.75rem; color: #4b5563;">{r.tipo_servicio}</td>
                            <td style="padding: 0.75rem; color: #4b5563;">{r.informacion_adicional}</td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="5" style="padding: 1rem; text-align: center; color: #6b7280;">No hay servicios realizados registrados para esta búsqueda.</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <!-- SECCIÓN 3: Registrar Servicio Realizado -->
        <div style="border: 2px solid #ef4444; padding: 1.5rem; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #111827; font-size: 1.1rem; margin-bottom: 1rem;">Registrar servicio realizado</h3>

            {#if form?.errorRealizado}
                <div style="background-color: #fee2e2; color: #b91c1c; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem;">{form.errorRealizado}</div>
            {/if}

            <!-- NUEVO: Mensaje de éxito -->
            {#if form?.successRealizado}
                <div style="background-color: #dcfce3; color: #166534; padding: 0.75rem; border: 1px solid #bbf7d0; border-radius: 4px; margin-bottom: 1rem;">Servicio realizado registrado exitosamente.</div>
            {/if}

            <form method="POST" action="?/registrarRealizado" use:enhance>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                    <div>
                        <label for="reg_real_mascota" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.4rem;">Mascota *</label>
                        <input type="text" id="reg_real_mascota" list="lista-mascotas-servicios" bind:value={inputMascotaRealizado} placeholder="Seleccione una mascota" required autocomplete="off" style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                        <input type="hidden" name="id_mascota" value={idMascotaRealizado} required />
                    </div>
                    <div>
                        <label for="reg_real_serv" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.4rem;">Servicio *</label>
                        <select id="reg_real_serv" name="id_servicio" required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box; background: white;">
                            <option value="">Seleccione un servicio activo</option>
                            {#each data.servicios.filter((s: any) => s.estado === 'Activo') as servActivo}
                                <option value={servActivo.id_servicio}>{servActivo.nombre} ({servActivo.tipo})</option>
                            {/each}
                        </select>
                    </div>
                    <div>
                        <label for="reg_real_fecha" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.4rem;">Fecha *</label>
                        <input type="date" id="reg_real_fecha" name="fecha" max={fechaMaxima} required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                    </div>
                    <div>
                        <label for="reg_real_info" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.4rem;">Información adicional</label>
                        <input type="text" id="reg_real_info" name="informacion_adicional" placeholder="Información adicional" style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                    </div>
                </div>

                <div style="display: flex; gap: 0.5rem;">
                    <button type="submit" style="background-color: #1e3a8a; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">Confirmar registro</button>
                    <button type="button" onclick={() => inputMascotaRealizado = ''} style="background-color: white; color: #1e3a8a; border: 1px solid #1e3a8a; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">Cancelar</button>
                </div>
            </form>
        </div>
    </div>

    <!-- MODAL PARA MODIFICAR SERVICIO -->
    {#if editandoServicio}
        <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 50;">
            <div style="background: white; padding: 2rem; border-radius: 8px; width: 100%; max-width: 500px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h3 style="margin-top: 0; color: #1e3a8a; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; margin-bottom: 1.5rem;">Modificar Servicio</h3>
                
                <form method="POST" action="?/modificarServicio" use:enhance={() => { return async ({ update }) => { await update(); cancelarEdicion(); }; }}>
                    <input type="hidden" name="id_servicio" value={servicioEditado.id_servicio} />
                    
                    <div style="display: grid; gap: 1rem; margin-bottom: 1.5rem;">
                        <div>
                            <label for="mod_serv_nombre" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.4rem;">Nombre *</label>
                            <input id="mod_serv_nombre" type="text" name="nombre" value={servicioEditado.nombre} required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                        </div>
                        <div>
                            <label for="mod_serv_tipo" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.4rem;">Tipo *</label>
                            <input id="mod_serv_tipo" type="text" name="tipo" value={servicioEditado.tipo} required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                        </div>
                        <div>
                            <label for="mod_serv_precio" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.4rem;">Precio *</label>
                            <input id="mod_serv_precio" type="text" name="precio" value={servicioEditado.precio} required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                        </div>
                        <div>
                            <label for="mod_serv_estado" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.4rem;">Estado *</label>
                            <select id="mod_serv_estado" name="estado" required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box; background: white;">
                                <option value="Activo" selected={servicioEditado.estado === 'Activo'}>Activo</option>
                                <option value="Inactivo" selected={servicioEditado.estado === 'Inactivo'}>Inactivo</option>
                            </select>
                        </div>
                    </div>

                    <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                        <button type="button" onclick={cancelarEdicion} style="background-color: white; color: #1e3a8a; border: 1px solid #1e3a8a; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">Cancelar</button>
                        <button type="submit" style="background-color: #1e3a8a; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">Guardar cambios</button>
                    </div>
                </form>
            </div>
        </div>
    {/if}
</main>