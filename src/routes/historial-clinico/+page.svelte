<script lang="ts">
    import { enhance } from '\$app/forms';
    
    let { data, form } = $props();

    let inputBusqueda = $state('');
    let busquedaActiva = $state('');

    let mascotaSeleccionada = $derived(
        (data.mascotas as any[]).find(m => 
            `${m.nombre} (${m.nombre_propietario})`.toLowerCase() === busquedaActiva.toLowerCase()
        )
    );
    
    let registrosFiltrados = $derived(
        mascotaSeleccionada 
            ? (data.historial as any[]).filter(h => h.id_mascota === mascotaSeleccionada.id_mascota)
            : []
    );

    let mostrandoRegistroConsulta = $state(false);
    let mostrandoRegistroAtencion = $state(false);

    // Estados para el Modal de "Ver Detalle"
    let viendoDetalle = $state(false);
    let registroActual: any = $state(null);

    function verDetalle(registro: any) {
        registroActual = registro;
        viendoDetalle = true;
    }

    function cerrarDetalle() {
        viendoDetalle = false;
        registroActual = null;
    }

    function realizarBusqueda() {
        busquedaActiva = inputBusqueda.trim(); 
        mostrandoRegistroConsulta = false;
        mostrandoRegistroAtencion = false;
    }

    function abrirConsulta() {
        mostrandoRegistroConsulta = true;
        mostrandoRegistroAtencion = false;
    }

    function abrirAtencion() {
        mostrandoRegistroAtencion = true;
        mostrandoRegistroConsulta = false;
    }

    function formatearFecha(fechaStr: string) {
        if (!fechaStr) return '';
        const partes = fechaStr.split('-');
        if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
        return fechaStr;
    }

    function submitConsulta() {
        return async ({ update, result }: any) => {
            await update();
            if (result.type === 'success') mostrandoRegistroConsulta = false;
        };
    }

    function submitAtencion() {
        return async ({ update, result }: any) => {
            await update();
            if (result.type === 'success') mostrandoRegistroAtencion = false;
        };
    }

    const fechaMaxima = new Date().toISOString().split('T')[0];
</script>

<svelte:head>
    <title>Historial Clínico - Fortaleza Veterinaria</title>
</svelte:head>

<main style="padding: 2rem;">
    <datalist id="lista-mascotas-historial">
        {#each data.mascotas as mascota}
            <option value="{mascota.nombre} ({mascota.nombre_propietario})"></option>
        {/each}
    </datalist>

    <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 900px; margin: 0 auto; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        
        <h2 style="color: #111827; margin-top: 0; font-size: 1.5rem; margin-bottom: 0.25rem;">Historial clínico</h2>
        <p style="font-size: 0.85rem; color: #6b7280; margin-top: 0; margin-bottom: 1.5rem;">Pantalla IU-05, casos de uso CU-05, CU-06 y CU-07, requisito FR-05</p>

        <div style="border: 1px dashed #d1d5db; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
            
            <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
                <input type="text" list="lista-mascotas-historial" bind:value={inputBusqueda} placeholder="Buscar mascota" style="flex: 1; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px;" autocomplete="off" />
                <button type="button" onclick={realizarBusqueda} style="background-color: white; color: #1e3a8a; border: 1px solid #1e3a8a; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">Buscar</button>
            </div>

            {#if mascotaSeleccionada}
                
                <p style="color: #111827; margin-bottom: 1.5rem;">
                    <strong>{mascotaSeleccionada.nombre}</strong>, {mascotaSeleccionada.especie}. Propietario: {mascotaSeleccionada.nombre_propietario}
                </p>

                <table style="width: 100%; border-collapse: collapse; text-align: left; margin-bottom: 1.5rem;">
                    <thead>
                        <tr style="background-color: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                            <th style="padding: 0.75rem; color: #374151;">Fecha</th>
                            <th style="padding: 0.75rem; color: #374151;">Tipo de registro</th>
                            <th style="padding: 0.75rem; color: #374151;">Resumen</th>
                            <th style="padding: 0.75rem; color: #374151;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each registrosFiltrados as registro}
                            <tr style="border-bottom: 1px dashed #e5e7eb;">
                                <td style="padding: 0.75rem; color: #4b5563;">{formatearFecha(registro.fecha)}</td>
                                <td style="padding: 0.75rem; color: #4b5563;">{registro.tipo_registro}</td>
                                <td style="padding: 0.75rem; color: #4b5563;">{registro.resumen}</td>
                                <td style="padding: 0.75rem;">
                                    <a href="#!" onclick={() => verDetalle(registro)} style="color: #1e3a8a; text-decoration: none; font-weight: 500;">Ver detalle</a>
                                </td>
                            </tr>
                        {:else}
                            <tr>
                                <td colspan="4" style="padding: 1rem; text-align: center; color: #6b7280;">No hay historial clínico registrado para esta mascota.</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>

                <div style="display: flex; gap: 0.5rem;">
                    <button type="button" onclick={abrirConsulta} style="background-color: #1e3a8a; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">Registrar consulta médica</button>
                    <button type="button" onclick={abrirAtencion} style="background-color: #1e3a8a; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">Registrar atención médica</button>
                </div>

            {:else if busquedaActiva !== ''}
                <div style="text-align: center; color: #b91c1c; padding: 2rem 0; background-color: #fee2e2; border-radius: 8px;">
                    No se encontró a la mascota "<strong>{busquedaActiva}</strong>". Por favor, selecciónela de la lista desplegable.
                </div>
            {:else}
                <div style="text-align: center; color: #6b7280; padding: 2rem 0;">
                    Escriba y seleccione una mascota para visualizar su historial clínico.
                </div>
            {/if}
        </div>

        <!-- FORMULARIO 1: Consulta Médica -->
        {#if mostrandoRegistroConsulta && mascotaSeleccionada}
            <div style="border: 2px solid #ef4444; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                <h3 style="margin-top: 0; color: #111827; margin-bottom: 1.5rem;">Registrar consulta médica</h3>
                
                {#if form?.errorConsulta}
                    <div style="background-color: #fee2e2; color: #b91c1c; padding: 0.75rem; border: 1px solid #f87171; border-radius: 4px; margin-bottom: 1rem;">{form.errorConsulta}</div>
                {/if}

                <form method="POST" action="?/registrarConsulta" use:enhance={submitConsulta}>
                    <input type="hidden" name="id_mascota" value={mascotaSeleccionada.id_mascota} />
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                        <div>
                            <label for="cons_fecha" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Fecha *</label>
                            <input type="date" id="cons_fecha" name="fecha" max={fechaMaxima} required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                        </div>
                        <div>
                            <label for="cons_motivo" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Motivo *</label>
                            <input type="text" id="cons_motivo" name="motivo" required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                        </div>
                    </div>

                    <div style="margin-bottom: 1.5rem;">
                        <label for="cons_eval" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Evaluación realizada</label>
                        <textarea id="cons_eval" name="evaluacion" rows="2" style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box; resize: vertical;"></textarea>
                    </div>

                    <div style="margin-bottom: 1.5rem;">
                        <label for="cons_obs" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Observaciones y resultados</label>
                        <textarea id="cons_obs" name="observaciones" rows="2" style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box; resize: vertical;"></textarea>
                    </div>

                    <div style="margin-bottom: 1.5rem;">
                        <label for="cons_tratamiento" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Indicaciones o tratamiento (cuando aplique)</label>
                        <textarea id="cons_tratamiento" name="tratamiento" rows="2" style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box; resize: vertical;"></textarea>
                    </div>

                    <div style="display: flex; gap: 0.5rem;">
                        <button type="submit" style="background-color: #1e3a8a; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">Confirmar registro</button>
                        <button type="button" onclick={() => mostrandoRegistroConsulta = false} style="background-color: white; color: #1e3a8a; border: 1px solid #1e3a8a; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">Cancelar</button>
                    </div>
                </form>
            </div>
        {/if}

        <!-- FORMULARIO 2: Atención Médica -->
        {#if mostrandoRegistroAtencion && mascotaSeleccionada}
            <div style="border: 2px dashed #22c55e; padding: 1.5rem; border-radius: 8px;">
                <h3 style="margin-top: 0; color: #111827; margin-bottom: 1.5rem;">Registrar atención médica</h3>
                
                {#if form?.errorAtencion}
                    <div style="background-color: #fee2e2; color: #b91c1c; padding: 0.75rem; border: 1px solid #f87171; border-radius: 4px; margin-bottom: 1rem;">{form.errorAtencion}</div>
                {/if}

                <form method="POST" action="?/registrarAtencion" use:enhance={submitAtencion}>
                    <input type="hidden" name="id_mascota" value={mascotaSeleccionada.id_mascota} />
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                        <div>
                            <label for="aten_tipo" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Tipo de atención *</label>
                            <select id="aten_tipo" name="tipo_atencion" required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box; background: white;">
                                <option value="">Seleccione un tipo</option>
                                <option value="Vacuna">Vacuna</option>
                                <option value="Examen de laboratorio">Examen de laboratorio</option>
                                <option value="Desparasitación">Desparasitación</option>
                                <option value="Cirugía">Cirugía</option>
                            </select>
                        </div>
                        <div>
                            <label for="aten_fecha" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Fecha *</label>
                            <input type="date" id="aten_fecha" name="fecha" max={fechaMaxima} required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                        </div>
                    </div>

                    <div style="margin-bottom: 1.5rem;">
                        <label for="aten_info" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Información de la atención</label>
                        <textarea id="aten_info" name="informacion" rows="3" style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box; resize: vertical;"></textarea>
                    </div>

                    <div style="display: flex; gap: 0.5rem;">
                        <button type="submit" style="background-color: #1e3a8a; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">Confirmar registro</button>
                        <button type="button" onclick={() => mostrandoRegistroAtencion = false} style="background-color: white; color: #1e3a8a; border: 1px solid #1e3a8a; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">Cancelar</button>
                    </div>
                </form>
            </div>
        {/if}
    </div>

    <!-- MODAL DINÁMICO: Replica exactamente la estructura visual de los formularios de registro -->
    {#if viendoDetalle && registroActual}
        <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 50;">
            <div style="background: white; padding: 2rem; border-radius: 8px; width: 100%; max-width: 650px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-height: 90vh; overflow-y: auto;">
                
                {#if registroActual.tipo_registro === 'Consulta'}
                    <!-- MODAL ESTILO: Registrar consulta médica -->
                    <h3 style="margin-top: 0; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.75rem; margin-bottom: 1.5rem;">Detalle de consulta médica</h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                        <div>
                            <label for="detalle-fecha" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Fecha</label>
                            <input id="detalle-fecha" type="date" value={registroActual.fecha} disabled style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; background-color: #f3f4f6; box-sizing: border-box;" />
                        </div>
                        <div>
                            <label for="detalle-motivo" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Motivo</label>
                            <input id="detalle-motivo" type="text" value={registroActual.resumen} disabled style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; background-color: #f3f4f6; box-sizing: border-box;" />
                        </div>
                    </div>

                    <div style="margin-bottom: 1.5rem;">
                        <label for="detalle-evaluacion" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Evaluación realizada</label>
                        <textarea id="detalle-evaluacion" rows="2" disabled style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; background-color: #f3f4f6; box-sizing: border-box; resize: vertical;">{registroActual.evaluacion || ''}</textarea>
                    </div>

                    <div style="margin-bottom: 1.5rem;">
                        <label for="detalle-observaciones" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Observaciones y resultados</label>
                        <textarea id="detalle-observaciones" rows="2" disabled style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; background-color: #f3f4f6; box-sizing: border-box; resize: vertical;">{registroActual.observaciones || ''}</textarea>
                    </div>

                    <div style="margin-bottom: 1.5rem;">
                        <label for="detalle-tratamiento" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Indicaciones o tratamiento (cuando aplique)</label>
                        <textarea id="detalle-tratamiento" rows="2" disabled style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; background-color: #f3f4f6; box-sizing: border-box; resize: vertical;">{registroActual.tratamiento || ''}</textarea>
                    </div>

                {:else}
                    <!-- MODAL ESTILO: Registrar atención médica -->
                    <h3 style="margin-top: 0; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.75rem; margin-bottom: 1.5rem;">Detalle de atención médica</h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                        <div>
                            <label for="detalle-tipo-atencion" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Tipo de atención</label>
                            <input id="detalle-tipo-atencion" type="text" value={registroActual.tipo_registro} disabled style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; background-color: #f3f4f6; box-sizing: border-box;" />
                        </div>
                        <div>
                            <label for="detalle-fecha" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Fecha</label>
                            <input id="detalle-fecha" type="date" value={registroActual.fecha} disabled style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; background-color: #f3f4f6; box-sizing: border-box;" />
                        </div>
                    </div>

                    <div style="margin-bottom: 1.5rem;">
                        <div style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Información de la atención</div>
                        <textarea rows="3" disabled style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; background-color: #f3f4f6; box-sizing: border-box; resize: vertical;">{registroActual.observaciones || ''}</textarea>
                    </div>
                {/if}

                <div style="text-align: right;">
                    <button type="button" onclick={cerrarDetalle} style="background-color: #1e3a8a; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">Cerrar</button>
                </div>
            </div>
        </div>
    {/if}
</main>