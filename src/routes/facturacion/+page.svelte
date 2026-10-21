<script lang="ts">
    import { enhance } from '\$app/forms';
    
    let { data, form } = $props();

    // Movemos esta función arriba para poder usarla en los filtros
    function formatearFecha(fechaStr: string) {
        if (!fechaStr) return '';
        const partes = fechaStr.split('-');
        if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
        return fechaStr;
    }

    // --- SECCIÓN 1: Buscador de Facturas Registradas ---
    let inputBusqueda = $state('');
    let filtroActivo = $state('');

    let facturasFiltradas = $derived(
        (data.facturas as any[]).filter(f => {
            if (!filtroActivo) return true;
            const termino = filtroActivo.toLowerCase();
            
            // Creamos una cadena con toda la info junta para que la búsqueda sea infalible
            const textoCompleto = `${f.numero_factura} v-000${f.id_venta} ${formatearFecha(f.fecha_emision)}`.toLowerCase();
            
            // Compara si lo escrito coincide con la cadena, o si la selección del datalist incluye la factura
            return textoCompleto.includes(termino) || termino.includes(f.numero_factura.toLowerCase());
        })
    );

    function buscarFactura() {
        filtroActivo = inputBusqueda.trim();
        viendoDetalle = false;
    }

    // --- SECCIÓN 2: Detalles de la Factura ---
    let viendoDetalle = $state(false);
    let facturaActual: any = $state(null);
    let detallesFacturaActual = $derived(
        facturaActual ? (data.detalles as any[]).filter(d => d.id_venta === facturaActual.id_venta) : []
    );

    function verDetalle(factura: any) {
        facturaActual = factura;
        viendoDetalle = true;
    }

    // --- SECCIÓN 3: Generar Nueva Factura ---
    let inputVentaGenerar = $state('');
    
    // Búsqueda a prueba de balas: solo con detectar el "V-000X" funciona, sin importar símbolos
    let idVentaSeleccionada = $derived(
        (data.ventasPendientes as any[]).find(v => inputVentaGenerar.includes(`V-000${v.id_venta}`))?.id_venta || ''
    );

    function submitGenerarFactura() {
        return async ({ update, result }: any) => {
            await update({ reset: true });
            if (result.type === 'success') {
                inputVentaGenerar = '';
            }
        };
    }
</script>

<svelte:head>
    <title>Facturación - Fortaleza Veterinaria</title>
</svelte:head>

<main style="padding: 2rem;">
    <!-- NUEVO: Datalist para el buscador principal con Fecha incluida -->
    <datalist id="lista-facturas-registradas">
        {#each data.facturas as f}
            <option value="{f.numero_factura} - {formatearFecha(f.fecha_emision)} (Venta V-000{f.id_venta})"></option>
        {/each}
    </datalist>

    <!-- MEJORA: Datalist de ventas pendientes ahora muestra la Fecha también -->
    <datalist id="lista-ventas-pendientes">
        {#each data.ventasPendientes as v}
            <option value="Venta V-000{v.id_venta} - {formatearFecha(v.fecha)} - {v.nombre_propietario} (\${v.total})"></option>
        {/each}
    </datalist>

    <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 950px; margin: 0 auto; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        
        <h2 style="color: #111827; margin-top: 0; font-size: 1.5rem; margin-bottom: 0.25rem;">Facturación</h2>
        <p style="font-size: 0.85rem; color: #6b7280; margin-top: 0; margin-bottom: 1.5rem;">Pantalla IU-09, casos de uso CU-12 y CU-13, requisito FR-10</p>

        <!-- SECCIÓN 1: Tabla de Facturas Registradas -->
        <div style="border: 1px dashed #d1d5db; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
            <h3 style="margin-top: 0; color: #111827; font-size: 1.1rem; margin-bottom: 1.5rem;">Facturas registradas</h3>

            <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
                <!-- MEJORA: Input principal ahora usa Datalist y muestra sugerencias -->
                <input type="text" list="lista-facturas-registradas" bind:value={inputBusqueda} placeholder="Buscar por factura, venta o fecha (ej. 28/09/2026)" style="flex: 1; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px;" autocomplete="off" />
                <button type="button" onclick={buscarFactura} style="background-color: white; color: #1e3a8a; border: 1px solid #1e3a8a; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">Buscar</button>
            </div>

            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="background-color: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                        <th style="padding: 0.75rem; color: #374151;">Factura</th>
                        <th style="padding: 0.75rem; color: #374151;">Fecha</th>
                        <th style="padding: 0.75rem; color: #374151;">Venta</th>
                        <th style="padding: 0.75rem; color: #374151;">Total</th>
                        <th style="padding: 0.75rem; color: #374151;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {#each facturasFiltradas as f}
                        <tr style="border-bottom: 1px dashed #e5e7eb;">
                            <td style="padding: 0.75rem; color: #4b5563;">{f.numero_factura}</td>
                            <td style="padding: 0.75rem; color: #4b5563;">{formatearFecha(f.fecha_emision)}</td>
                            <td style="padding: 0.75rem; color: #4b5563;">V-000{f.id_venta}</td>
                            <td style="padding: 0.75rem; color: #4b5563; font-weight: bold;">{f.total}</td>
                            <td style="padding: 0.75rem;">
                                <button type="button" onclick={() => verDetalle(f)} style="background: none; border: none; color: #1e3a8a; cursor: pointer; padding: 0; font-weight: 500;">Ver</button>
                            </td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="5" style="padding: 1rem; text-align: center; color: #6b7280;">No hay facturas registradas.</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <!-- RECUADRO ROJO: Detalles de la Factura -->
        {#if viendoDetalle && facturaActual}
            <div style="border: 2px solid #ef4444; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
                <h3 style="margin-top: 0; color: #111827; font-size: 1.1rem; margin-bottom: 1.5rem;">
                    Factura {facturaActual.numero_factura} <span style="font-weight: normal; font-size: 0.9rem; color: #6b7280;">(venta V-000{facturaActual.id_venta}, {facturaActual.nombre_propietario})</span>
                </h3>

                <table style="width: 100%; border-collapse: collapse; text-align: left; margin-bottom: 1.5rem;">
                    <thead>
                        <tr style="background-color: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                            <th style="padding: 0.75rem; color: #374151;">Concepto</th>
                            <th style="padding: 0.75rem; color: #374151;">Tipo</th>
                            <th style="padding: 0.75rem; color: #374151;">Cantidad</th>
                            <th style="padding: 0.75rem; color: #374151;">Precio</th>
                            <th style="padding: 0.75rem; color: #374151;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each detallesFacturaActual as d}
                            <tr style="border-bottom: 1px dashed #e5e7eb;">
                                <td style="padding: 0.75rem; color: #4b5563;">{d.nombre_elemento}</td>
                                <td style="padding: 0.75rem; color: #4b5563;">{d.tipo_elemento}</td>
                                <td style="padding: 0.75rem; color: #4b5563;">{d.cantidad}</td>
                                <td style="padding: 0.75rem; color: #4b5563;">{d.precio_unitario}</td>
                                <td style="padding: 0.75rem; color: #4b5563;">{d.subtotal}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
                <h3 style="color: #111827; margin: 0; font-size: 1.1rem;">Total: {facturaActual.total}</h3>
            </div>
        {/if}

        <!-- RECUADRO VERDE: Generar factura desde venta existente -->
        <div style="border: 2px dashed #22c55e; padding: 1.5rem; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #111827; font-size: 1.1rem; margin-bottom: 1.5rem;">Generar factura desde una venta existente</h3>

            {#if form?.errorFactura}
                <div style="background-color: #fee2e2; color: #b91c1c; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem;">{form.errorFactura}</div>
            {/if}
            {#if form?.successFactura}
                <div style="background-color: #dcfce3; color: #166534; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem;">Factura generada exitosamente.</div>
            {/if}

            <form method="POST" action="?/generarFactura" use:enhance={submitGenerarFactura}>
                <div style="margin-bottom: 1.5rem; max-width: 600px;">
                    <label for="gen_venta" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.4rem;">Venta *</label>
                    <input type="text" id="gen_venta" list="lista-ventas-pendientes" bind:value={inputVentaGenerar} required placeholder="Buscar venta sin facturar..." style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" autocomplete="off" />
                    <input type="hidden" name="id_venta" value={idVentaSeleccionada} required />
                </div>

                <div style="display: flex; gap: 0.5rem;">
                    <button type="submit" disabled={!idVentaSeleccionada} style="background-color: {!idVentaSeleccionada ? '#9ca3af' : '#1e3a8a'}; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: {!idVentaSeleccionada ? 'not-allowed' : 'pointer'};">Generar factura</button>
                    <button type="button" onclick={() => inputVentaGenerar = ''} style="background-color: white; color: #1e3a8a; border: 1px solid #1e3a8a; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">Cancelar</button>
                </div>
            </form>
        </div>

    </div>
</main>