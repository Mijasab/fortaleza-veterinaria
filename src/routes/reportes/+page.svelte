<script lang="ts">
    let { data } = $props();

    // 1. Estados de los filtros
    let filtroTipoReporte = $state('Ventas');
    let filtroFechaDesde = $state('');
    let filtroFechaHasta = $state('');
    
    // 2. Estado visual
    let reporteGenerado = $state(false);

    // 3. Lógica de Filtrado Derivada según el Tipo de Reporte
    let resultadosActuales = $derived.by(() => {
        if (!reporteGenerado) return [];

        let filtrados: any[] = [];

        if (filtroTipoReporte === 'Ventas') {
            filtrados = data.datosVentas;
            if (filtroFechaDesde) filtrados = filtrados.filter((v: any) => v.fecha >= filtroFechaDesde);
            if (filtroFechaHasta) filtrados = filtrados.filter((v: any) => v.fecha <= filtroFechaHasta);
        } 
        else if (filtroTipoReporte === 'Inventario') {
            // Inventario crítico: Menos de 10 unidades
            filtrados = (data.productos as any[]).filter(p => p.existencia <= 10).sort((a, b) => a.existencia - b.existencia);
        }
        else if (filtroTipoReporte === 'Citas') {
            filtrados = data.datosCitas;
            if (filtroFechaDesde) filtrados = filtrados.filter((c: any) => c.fecha >= filtroFechaDesde);
            if (filtroFechaHasta) filtrados = filtrados.filter((c: any) => c.fecha <= filtroFechaHasta);
        }
        else if (filtroTipoReporte === 'Servicios') {
            filtrados = data.datosServiciosRealizados;
            if (filtroFechaDesde) filtrados = filtrados.filter((s: any) => s.fecha >= filtroFechaDesde);
            if (filtroFechaHasta) filtrados = filtrados.filter((s: any) => s.fecha <= filtroFechaHasta);
        }

        return filtrados;
    });

    // 4. Métricas Visuales Dinámicas
    let metricas = $derived.by(() => {
        if (filtroTipoReporte === 'Ventas') {
            const total = resultadosActuales.reduce((acc, v) => acc + parseFloat(v.total || 0), 0);
            return `Ingresos totales: $${total.toFixed(2)}`;
        }
        if (filtroTipoReporte === 'Inventario') {
            return `Productos en riesgo de agotarse: ${resultadosActuales.length}`;
        }
        if (filtroTipoReporte === 'Citas') {
            const activas = resultadosActuales.filter(c => c.estado === 'Activa').length;
            const canceladas = resultadosActuales.filter(c => c.estado === 'Cancelada').length;
            return `Atendidas/Activas: ${activas} | Canceladas: ${canceladas}`;
        }
        if (filtroTipoReporte === 'Servicios') {
            return `Total de servicios realizados en el período: ${resultadosActuales.length}`;
        }
        return '';
    });

    function generarReporte() {
        reporteGenerado = true;
    }

    function limpiarFiltros() {
        filtroTipoReporte = 'Ventas';
        filtroFechaDesde = '';
        filtroFechaHasta = '';
        reporteGenerado = false;
    }

    function formatearFecha(fechaStr: string) {
        if (!fechaStr) return '';
        const partes = fechaStr.split('-');
        if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
        return fechaStr;
    }

    // EL TOQUE ENTERPRISE: Función para exportar a Excel (CSV)
    function exportarCSV() {
        if (resultadosActuales.length === 0) return;

        let csvContent = "data:text/csv;charset=utf-8,";
        let encabezados: string[] = [];

        if (filtroTipoReporte === 'Ventas') encabezados = ["Fecha", "Venta", "Elementos", "Total"];
        if (filtroTipoReporte === 'Inventario') encabezados = ["Producto", "Categoria", "Precio", "Existencia"];
        if (filtroTipoReporte === 'Citas') encabezados = ["Fecha", "Mascota", "Motivo", "Estado"];
        if (filtroTipoReporte === 'Servicios') encabezados = ["Fecha", "Servicio", "Tipo", "Mascota"];

        csvContent += encabezados.join(",") + "\r\n";

        resultadosActuales.forEach(row => {
            let fila: (string | number)[] = [];
            if (filtroTipoReporte === 'Ventas') fila = [formatearFecha(row.fecha), `V-000${row.id_venta}`, row.elementos, row.total];
            if (filtroTipoReporte === 'Inventario') fila = [row.nombre, row.categoria, row.precio, row.existencia];
            if (filtroTipoReporte === 'Citas') fila = [formatearFecha(row.fecha), row.nombre_mascota, row.motivo, row.estado];
            if (filtroTipoReporte === 'Servicios') fila = [formatearFecha(row.fecha), row.nombre_servicio, row.tipo_servicio, row.nombre_mascota];
            
            csvContent += fila.join(",") + "\r\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Reporte_${filtroTipoReporte}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
</script>

<svelte:head>
    <title>Reportes - Fortaleza Veterinaria</title>
</svelte:head>

<main style="padding: 2rem;">
    <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 950px; margin: 0 auto; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        
        <h2 style="color: #111827; margin-top: 0; font-size: 1.5rem; margin-bottom: 0.25rem;">Reportes y Análisis</h2>
        <p style="font-size: 0.85rem; color: #6b7280; margin-top: 0; margin-bottom: 1.5rem;">Inteligencia de negocio para la gestión veterinaria</p>

        <!-- SECCIÓN 1: Filtros Dinámicos -->
        <div style="border: 1px dashed #d1d5db; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
            <h3 style="margin-top: 0; color: #111827; font-size: 1.1rem; margin-bottom: 1.5rem;">Generar reporte</h3>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                <div>
                    <label for="tipo-reporte" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.4rem;">Tipo de reporte *</label>
                    <select id="tipo-reporte" bind:value={filtroTipoReporte} onchange={() => reporteGenerado = false} style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box; background: white;">
                        <option value="Ventas">Ventas y Contabilidad</option>
                        <option value="Inventario">Inventario Crítico (Bajo Stock)</option>
                        <option value="Servicios">Servicios Realizados</option>
                        <option value="Citas">Efectividad de Citas</option>
                    </select>
                </div>
                
                <!-- Ocultamos las fechas si es el reporte de inventario (que es en tiempo real) -->
                {#if filtroTipoReporte !== 'Inventario'}
                    <div>
                        <label for="fecha-desde" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.4rem;">Fecha desde</label>
                        <input id="fecha-desde" type="date" bind:value={filtroFechaDesde} style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                    </div>
                    <div>
                        <label for="fecha-hasta" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.4rem;">Fecha hasta</label>
                        <input id="fecha-hasta" type="date" bind:value={filtroFechaHasta} style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                    </div>
                {/if}
            </div>

            <div style="display: flex; gap: 0.5rem;">
                <button type="button" onclick={generarReporte} style="background-color: #1e3a8a; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">Generar reporte</button>
                <button type="button" onclick={limpiarFiltros} style="background-color: white; color: #1e3a8a; border: 1px solid #1e3a8a; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">Limpiar filtros</button>
                
                {#if reporteGenerado && resultadosActuales.length > 0}
                    <!-- BOTÓN DE EXPORTACIÓN (El Toque Enterprise) -->
                    <button type="button" onclick={exportarCSV} style="background-color: #059669; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer; margin-left: auto;">↓ Descargar Excel (CSV)</button>
                {/if}
            </div>
        </div>

        <!-- SECCIÓN 2: Tablas Dinámicas según el Reporte -->
        {#if reporteGenerado}
            <div style="border: 2px solid #ef4444; padding: 1.5rem; border-radius: 8px;">
                <h3 style="margin-top: 0; color: #111827; font-size: 1.1rem; margin-bottom: 1.5rem;">
                    Reporte de {filtroTipoReporte}
                    {#if filtroFechaDesde && filtroFechaHasta && filtroTipoReporte !== 'Inventario'}
                        <span style="font-weight: normal; font-size: 0.9rem; color: #6b7280;">, del {formatearFecha(filtroFechaDesde)} al {formatearFecha(filtroFechaHasta)}</span>
                    {/if}
                </h3>

                <table style="width: 100%; border-collapse: collapse; text-align: left; margin-bottom: 1.5rem;">
                    <thead>
                        <tr style="background-color: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                            {#if filtroTipoReporte === 'Ventas'}
                                <th style="padding: 0.75rem; color: #374151;">Fecha</th>
                                <th style="padding: 0.75rem; color: #374151;">Venta</th>
                                <th style="padding: 0.75rem; color: #374151;">Elementos</th>
                                <th style="padding: 0.75rem; color: #374151;">Total</th>
                            {:else if filtroTipoReporte === 'Inventario'}
                                <th style="padding: 0.75rem; color: #374151;">Producto</th>
                                <th style="padding: 0.75rem; color: #374151;">Categoría</th>
                                <th style="padding: 0.75rem; color: #374151;">Precio</th>
                                <th style="padding: 0.75rem; color: #374151;">Existencia Restante</th>
                            {:else if filtroTipoReporte === 'Citas'}
                                <th style="padding: 0.75rem; color: #374151;">Fecha</th>
                                <th style="padding: 0.75rem; color: #374151;">Mascota</th>
                                <th style="padding: 0.75rem; color: #374151;">Motivo</th>
                                <th style="padding: 0.75rem; color: #374151;">Estado</th>
                            {:else if filtroTipoReporte === 'Servicios'}
                                <th style="padding: 0.75rem; color: #374151;">Fecha</th>
                                <th style="padding: 0.75rem; color: #374151;">Servicio</th>
                                <th style="padding: 0.75rem; color: #374151;">Tipo</th>
                                <th style="padding: 0.75rem; color: #374151;">Mascota</th>
                            {/if}
                        </tr>
                    </thead>
                    <tbody>
                        {#each resultadosActuales as r}
                            <tr style="border-bottom: 1px dashed #e5e7eb;">
                                {#if filtroTipoReporte === 'Ventas'}
                                    <td style="padding: 0.75rem; color: #4b5563;">{formatearFecha(r.fecha)}</td>
                                    <td style="padding: 0.75rem; color: #4b5563;">V-000{r.id_venta}</td>
                                    <td style="padding: 0.75rem; color: #4b5563;">{r.elementos}</td>
                                    <td style="padding: 0.75rem; color: #4b5563; font-weight: bold;">\${parseFloat(r.total).toFixed(2)}</td>
                                {:else if filtroTipoReporte === 'Inventario'}
                                    <td style="padding: 0.75rem; color: #4b5563;">{r.nombre}</td>
                                    <td style="padding: 0.75rem; color: #4b5563;">{r.categoria}</td>
                                    <td style="padding: 0.75rem; color: #4b5563;">\${r.precio}</td>
                                    <td style="padding: 0.75rem; color: {r.existencia <= 5 ? '#dc2626' : '#d97706'}; font-weight: bold;">{r.existencia} u.</td>
                                {:else if filtroTipoReporte === 'Citas'}
                                    <td style="padding: 0.75rem; color: #4b5563;">{formatearFecha(r.fecha)}</td>
                                    <td style="padding: 0.75rem; color: #4b5563;">{r.nombre_mascota}</td>
                                    <td style="padding: 0.75rem; color: #4b5563;">{r.motivo}</td>
                                    <td style="padding: 0.75rem; color: {r.estado === 'Activa' ? '#059669' : '#dc2626'}; font-weight: bold;">{r.estado}</td>
                                {:else if filtroTipoReporte === 'Servicios'}
                                    <td style="padding: 0.75rem; color: #4b5563;">{formatearFecha(r.fecha)}</td>
                                    <td style="padding: 0.75rem; color: #4b5563;">{r.nombre_servicio}</td>
                                    <td style="padding: 0.75rem; color: #4b5563;">{r.tipo_servicio}</td>
                                    <td style="padding: 0.75rem; color: #4b5563;">{r.nombre_mascota}</td>
                                {/if}
                            </tr>
                        {:else}
                            <tr>
                                <td colspan="4" style="padding: 1rem; text-align: center; color: #6b7280;">No hay datos para el período o filtro seleccionado.</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
                
                <!-- MÉTRICA DE RESUMEN FINAL -->
                <div style="background-color: #f8fafc; padding: 1rem; border-radius: 4px; border: 1px solid #e2e8f0;">
                    <h3 style="color: #1e40af; margin: 0; font-size: 1.1rem; text-align: right;">{metricas}</h3>
                </div>
            </div>
        {/if}

    </div>
</main>