<script lang="ts">
    import { enhance } from '\$app/forms';
    
    let { data, form }: { data: any; form: any } = $props();

    let inputFecha = $state('');
    let inputMascota = $state('');
    let filtroFecha = '';
    let filtroMascota = '';
    let mascotaInput = $state('');

    let citasFiltradas = $derived((data?.citas || []).filter((c: any) => {
        const matchFecha = filtroFecha ? c.fecha.includes(filtroFecha) : true;
        // Cortamos el string en " (" para buscar solo el nombre de la mascota en la tabla
        const terminoMascota = filtroMascota ? filtroMascota.split(' (')[0].toLowerCase() : '';
        const matchMascota = filtroMascota ? String(c.nombre_mascota).toLowerCase().includes(terminoMascota) : true;
        return matchFecha && matchMascota;
    }));

    // Svelte buscará automáticamente el ID cuando el texto coincida
    let idMascotaSeleccionada = $derived.by(() => {
        // data.mascotas debe venir de tu +page.server.ts con el innerJoin del propietario
        if (!data.mascotas) return '';
        const encontrada = data.mascotas.find((m: any) => `${m.nombre} (${m.nombre_propietario})` === mascotaInput);
        return encontrada ? encontrada.id_mascota : '';
    });

    function realizarConsulta() {
        filtroFecha = inputFecha;
        filtroMascota = inputMascota;
    }

    let mostrandoRegistro = $state(false);

    let inputMascotaRegistro = $state('');
    // CORRECCIÓN: Ahora busca la coincidencia exacta de "Mascota (Dueño)"
    let idMascotaRegistro = $derived((data?.mascotas || []).find((m: any) => `${m.nombre} (${m.nombre_propietario})` === inputMascotaRegistro)?.id_mascota || '');

    let inputMascotaMod = $state('');
    let idMascotaMod = $derived((data?.mascotas || []).find((m: any) => `${m.nombre} (${m.nombre_propietario})` === inputMascotaMod)?.id_mascota || '');

    let editando = $state(false);
    let citaEditada = $state({ id_cita: 0, id_mascota: 0, motivo: '', fecha: '', hora: '' });

    let cancelando = $state(false);
    let citaCancelando = $state<any>(null);

    const fechaMinima = new Date().toISOString().split('T')[0];

    function iniciarEdicion(cita: any) {
        citaEditada = { ...cita };
        // CORRECCIÓN: Al modificar, cargamos el input con el formato combinado para no romper la llave foránea
        const mascotaAsociada = data.mascotas.find((m: any) => m.id_mascota === cita.id_mascota);
        inputMascotaMod = mascotaAsociada ? `${mascotaAsociada.nombre} (${mascotaAsociada.nombre_propietario})` : cita.nombre_mascota; 
        editando = true;
    }

    function cancelarEdicion() {
        editando = false;
    }

    function iniciarCancelacion(cita: any) {
        citaCancelando = cita;
        cancelando = true;
    }

    function formatearFecha(fechaStr: string) {
        if (!fechaStr) return '';
        const partes = fechaStr.split('-');
        if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
        return fechaStr;
    }
    
    function formatearHora(horaStr: string) {
        return horaStr ? horaStr.substring(0, 5) : '';
    }

    function submitRegistro() {
        return async ({ update, result }: any) => {
            await update();
            if (result.type === 'success') {
                mostrandoRegistro = false;
                inputMascotaRegistro = '';
            }
        };
    }

    function submitEdicion() {
        return async ({ update }: any) => {
            await update();
            cancelarEdicion();
        };
    }

    function submitCancelacion() {
        return async ({ update }: any) => {
            await update();
            cancelando = false;
        };
    }
</script>

<svelte:head>
    <title>Gestión de citas - Fortaleza Veterinaria</title>
</svelte:head>

<main style="padding: 2rem;">
    <!-- CORRECCIÓN: El datalist ahora imprime "Nombre Mascota (Nombre Dueño)" -->
    <datalist id="lista-mascotas">
        {#each data.mascotas as mascota}
            <option value="{mascota.nombre} ({mascota.nombre_propietario})"></option>
        {/each}
    </datalist>

    <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 900px; margin: 0 auto; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        
        <h2 style="color: #111827; margin-top: 0; font-size: 1.5rem; margin-bottom: 0.25rem;">Gestión de citas</h2>

        <div style="border: 1px dashed #d1d5db; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
            
            <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
                <input type="date" id="busqueda_fecha" aria-label="Fecha" bind:value={inputFecha} style="flex: 1; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px;" />
                <input type="text" id="busqueda_mascota" list="lista-mascotas" autocomplete="off" aria-label="Mascota" bind:value={inputMascota} placeholder="Mascota" style="flex: 1; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px;" />
                <button type="button" onclick={realizarConsulta} style="background-color: white; color: #1e3a8a; border: 1px solid #1e3a8a; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">Consultar</button>
                <button type="button" onclick={() => mostrandoRegistro = true} style="background-color: #1e3a8a; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">Registrar cita</button>
            </div>

            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="background-color: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                        <th style="padding: 0.75rem; color: #374151;">Fecha y hora</th>
                        <th style="padding: 0.75rem; color: #374151;">Mascota</th>
                        <th style="padding: 0.75rem; color: #374151;">Servicio o motivo</th>
                        <th style="padding: 0.75rem; color: #374151;">Estado</th>
                        <th style="padding: 0.75rem; color: #374151;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {#each citasFiltradas as cita}
                        <tr style="border-bottom: 1px dashed #e5e7eb;">
                            <td style="padding: 0.75rem; color: #4b5563;">{formatearFecha(cita.fecha)} {formatearHora(cita.hora)}</td>
                            <td style="padding: 0.75rem; color: #4b5563;">{cita.nombre_mascota}</td>
                            <td style="padding: 0.75rem; color: #4b5563;">{cita.motivo}</td>
                            <td style="padding: 0.75rem;">
                                <span style="background-color: {cita.estado === 'Activa' ? '#e0f2fe' : '#f3f4f6'}; color: {cita.estado === 'Activa' ? '#0369a1' : '#6b7280'}; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.85rem; font-weight: bold;">
                                    {cita.estado}
                                </span>
                            </td>
                            <td style="padding: 0.75rem;">
                                <a href="#!" onclick={() => iniciarEdicion(cita)} style="color: #4b5563; text-decoration: none;">Modificar</a>
                                {#if cita.estado === 'Activa'}
                                    , <a href="#!" onclick={() => iniciarCancelacion(cita)} style="color: #ef4444; text-decoration: none; margin-left: 0.25rem;">Cancelar</a>
                                {/if}
                            </td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="5" style="padding: 1rem; text-align: center; color: #6b7280;">No hay citas registradas.</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        {#if mostrandoRegistro}
            <div style="border: 2px solid #ef4444; padding: 1.5rem; border-radius: 8px;">
                <h3 style="margin-top: 0; color: #111827; margin-bottom: 1.5rem;">Registrar cita</h3>
                
                {#if form?.error && !form?.errorEditar}
                    <div style="background-color: #fee2e2; color: #b91c1c; padding: 0.75rem; border: 1px solid #f87171; border-radius: 4px; margin-bottom: 1rem;">{form.error}</div>
                {/if}

                {#if form?.success && !form?.successEditar && !form?.successCancelar}
                    <div style="background-color: #dcfce3; color: #166534; padding: 0.75rem; border: 1px solid #bbf7d0; border-radius: 4px; margin-bottom: 1rem;">Cita agendada exitosamente.</div>
                {/if}

                <form method="POST" action="?/registrar" use:enhance={submitRegistro}>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                        <div>
                            <label for="reg_mascota" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Mascota *</label>
                            <input type="text" id="reg_mascota" list="lista-mascotas" bind:value={inputMascotaRegistro} placeholder="Seleccione una mascota" required autocomplete="off" style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                            <input type="hidden" name="id_mascota" value={idMascotaRegistro} required />
                        </div>
                        <div>
                            <label for="reg_motivo" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Servicio o motivo *</label>
                            <select id="motivo" name="motivo" required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box; background-color: white;">
                                <option value="" disabled selected>Seleccione un motivo</option>
                                <option value="Cirugía">Cirugía</option>
                                <option value="Cita por valoración">Cita por valoración</option>
                                <option value="Consulta">Consulta</option>
                                <option value="Control / Seguimiento">Control / Seguimiento</option>
                                <option value="Desparasitación">Desparasitación</option>
                                <option value="Grooming">Grooming</option>
                                <option value="Resultado de exámenes de Laboratorio / Diagnóstico">Resultado de exámenes de Laboratorio / Diagnóstico</option>
                                <option value="Vacunación">Vacunación</option>
                            </select>
                        </div>
                        <div>
                            <label for="reg_fecha" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Fecha *</label>
                            <input type="date" id="reg_fecha" name="fecha" min={fechaMinima} required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                        </div>
                        <div>
                            <label for="reg_hora" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Hora *</label>
                            <input type="time" id="reg_hora" name="hora" required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
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

    {#if cancelando && citaCancelando}
        <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 50;">
            <div style="background: white; padding: 2rem; border-radius: 8px; width: 100%; max-width: 500px; border: 2px dashed #22c55e;">
                <h3 style="margin-top: 0; color: #111827;">Cancelar cita</h3>
                <p style="color: #4b5563; margin-top: 1rem; margin-bottom: 1.5rem;">
                    ¿Confirma la cancelación de la cita de <strong>{citaCancelando.nombre_mascota}</strong> del <strong>{formatearFecha(citaCancelando.fecha)}</strong> a las <strong>{formatearHora(citaCancelando.hora)}</strong>?
                </p>
                <form method="POST" action="?/cancelar" use:enhance={submitCancelacion}>
                    <input type="hidden" name="id_cita" value={citaCancelando.id_cita} />
                    <div style="display: flex; gap: 0.5rem;">
                        <button type="submit" style="background-color: #1e3a8a; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">Confirmar cancelación</button>
                        <button type="button" onclick={() => cancelando = false} style="background-color: white; color: #1e3a8a; border: 1px solid #1e3a8a; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">Volver</button>
                    </div>
                </form>
            </div>
        </div>
    {/if}

    {#if editando}
        <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 50;">
            <div style="background: white; padding: 2rem; border-radius: 8px; width: 100%; max-width: 500px;">
                <h3 style="margin-top: 0; color: #1e3a8a; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem;">Modificar Cita</h3>
                
                {#if form?.errorEditar}
                    <div style="background-color: #fee2e2; color: #b91c1c; padding: 0.75rem; border: 1px solid #f87171; border-radius: 4px; margin-bottom: 1rem;">{form.errorEditar}</div>
                {/if}

                <form method="POST" action="?/modificar" use:enhance={() => {
                    return async ({ update, result }) => {
                        await update();
                        // Solo cerramos el modal si la actualización fue exitosa
                        if (result.type === 'success') {
                            cancelarEdicion(); // Asegúrate de que este sea el nombre de tu función para cerrar el modal
                        }
                    };
                }}>
                    <input type="hidden" name="id_cita" value={citaEditada.id_cita} />
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
                        <div>
                            <label for="mod_mascota" style="display: block; font-size: 0.85rem; color: #4b5563;">Mascota *</label>
                            <input type="text" id="mod_mascota" list="lista-mascotas" bind:value={inputMascotaMod} required autocomplete="off" style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                            <input type="hidden" name="id_mascota" value={idMascotaMod} required />
                        </div>
                        <div>
                            <label for="mod_motivo" style="display: block; font-size: 0.85rem; color: #4b5563;">Motivo *</label>
                            <select id="mod_motivo" name="motivo" required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box; background: white;">
                                <option value="Cirugía" selected={citaEditada.motivo === 'Cirugía'}>Cirugía</option>
                                <option value="Cita por valoración" selected={citaEditada.motivo === 'Cita por valoración'}>Cita por valoración</option>
                                <option value="Consulta" selected={citaEditada.motivo === 'Consulta'}>Consulta</option>
                                <option value="Control / Seguimiento" selected={citaEditada.motivo === 'Control / Seguimiento'}>Control / Seguimiento</option>
                                <option value="Desparasitación" selected={citaEditada.motivo === 'Desparasitación'}>Desparasitación</option>
                                <option value="Grooming" selected={citaEditada.motivo === 'Grooming'}>Grooming</option>
                                <option value="Resultado de exámenes de Laboratorio / Diagnóstico" selected={citaEditada.motivo === 'Resultado de exámenes de Laboratorio / Diagnóstico'}>Resultado de exámenes de Laboratorio / Diagnóstico</option>
                                <option value="Vacunación" selected={citaEditada.motivo === 'Vacunación'}>Vacunación</option>
                            </select>
                        </div>
                        <div>
                            <label for="mod_fecha" style="display: block; font-size: 0.85rem; color: #4b5563;">Fecha *</label>
                            <input type="date" id="mod_fecha" name="fecha" value={citaEditada.fecha} min={fechaMinima} required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                        </div>
                        <div>
                            <label for="mod_hora" style="display: block; font-size: 0.85rem; color: #4b5563;">Hora *</label>
                            <input type="time" id="mod_hora" name="hora" value={formatearHora(citaEditada.hora)} required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
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