<script lang="ts">
    import { enhance } from '\$app/forms';
    
    let { data, form } = $props();

    // 1. Estados de "Nueva Venta" (Carrito)
    let tipoElemento = $state('Producto');
    let inputBusquedaElemento = $state('');
    let cantidadIngresada = $state(1);

    // 2. Arreglo reactivo para almacenar los elementos agregados a la tabla
    let elementosVenta: any[] = $state([]);
    
    // 3. Cálculo dinámico del total
    let importeTotal = $derived(
        elementosVenta.reduce((acc, el) => acc + parseFloat(el.subtotal), 0).toFixed(2)
    );

    // Estados del formulario final
    let inputPropietario = $state('');
    let idPropietarioSeleccionado = $derived(
        data.propietarios.find((p: any) => p.nombre_completo === inputPropietario)?.id_propietario || ''
    );
    
    let mensajeErrorLocal = $state('');

    function agregarElemento() {
        mensajeErrorLocal = '';
        const textoBusqueda = inputBusquedaElemento.trim();
        let elementoEncontrado = null;
        let id_item = 0;
        let precio_item = 0;

        if (tipoElemento === 'Producto') {
            elementoEncontrado = data.productos.find((p: any) => p.nombre === textoBusqueda);
            if (!elementoEncontrado) {
                mensajeErrorLocal = 'Producto no encontrado en el catálogo.';
                return;
            }
            if (cantidadIngresada > elementoEncontrado.existencia) {
                mensajeErrorLocal = `Solo hay ${elementoEncontrado.existencia} unidades disponibles.`;
                return;
            }
            id_item = elementoEncontrado.id_producto;
            precio_item = parseFloat(elementoEncontrado.precio);
        } else {
            elementoEncontrado = data.servicios.find((s: any) => s.nombre === textoBusqueda);
            if (!elementoEncontrado) {
                mensajeErrorLocal = 'Servicio no encontrado en el catálogo.';
                return;
            }
            id_item = elementoEncontrado.id_servicio;
            precio_item = parseFloat(elementoEncontrado.precio);
        }

        // Verificamos si ya está en el carrito para no duplicarlo, solo sumamos cantidad
        const indexExistente = elementosVenta.findIndex(e => e.id === id_item && e.tipo === tipoElemento);
        if (indexExistente !== -1) {
            mensajeErrorLocal = 'El elemento ya está en la lista. Quítelo y vuelva a agregarlo con la cantidad total.';
            return;
        }

        // Agregamos al carrito
        elementosVenta = [...elementosVenta, {
            id: id_item,
            tipo: tipoElemento,
            nombre: elementoEncontrado.nombre,
            cantidad: cantidadIngresada,
            precio: precio_item.toFixed(2),
            subtotal: (precio_item * cantidadIngresada).toFixed(2)
        }];

        // Limpiamos los inputs
        inputBusquedaElemento = '';
        cantidadIngresada = 1;
    }

    function quitarElemento(index: number) {
        elementosVenta = elementosVenta.filter((_, i) => i !== index);
    }

    function cancelarVenta() {
        elementosVenta = [];
        inputPropietario = '';
        mensajeErrorLocal = '';
    }

    function submitVenta() {
        return async ({ update, result }: any) => {
            await update({ reset: true });
            if (result.type === 'success') {
                cancelarVenta(); // Limpiamos todo al tener éxito
            }
        };
    }

    const fechaMaxima = new Date().toISOString().split('T')[0];
</script>

<svelte:head>
    <title>Registro de ventas - Fortaleza Veterinaria</title>
</svelte:head>

<main style="padding: 2rem;">
    <!-- Datalists invisibles para autocompletado escalable -->
    <datalist id="lista-productos">
        {#each data.productos as p}
            <option value={p.nombre}></option>
        {/each}
    </datalist>

    <datalist id="lista-servicios">
        {#each data.servicios as s}
            <option value={s.nombre}></option>
        {/each}
    </datalist>

    <datalist id="lista-propietarios-venta">
        {#each data.propietarios as p}
            <option value={p.nombre_completo}></option>
        {/each}
    </datalist>

    <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 950px; margin: 0 auto; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        
        <h2 style="color: #111827; margin-top: 0; font-size: 1.5rem; margin-bottom: 0.25rem;">Registro de ventas</h2>
        <p style="font-size: 0.85rem; color: #6b7280; margin-top: 0; margin-bottom: 1.5rem;">Pantalla IU-08, caso de uso CU-12, requisito FR-09</p>

        <!-- SECCIÓN 1: Agregar a la Venta -->
        <div style="border: 1px dashed #d1d5db; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <h3 style="margin-top: 0; color: #111827; font-size: 1.1rem; margin-bottom: 1.5rem;">Nueva venta</h3>

            {#if mensajeErrorLocal}
                <div style="background-color: #fee2e2; color: #b91c1c; padding: 0.75rem; border: 1px solid #f87171; border-radius: 4px; margin-bottom: 1rem;">{mensajeErrorLocal}</div>
            {/if}

            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                <div>
                    <label for="tipo-elemento" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.4rem;">Tipo de elemento *</label>
                    <select id="tipo-elemento" bind:value={tipoElemento} style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box; background: white;">
                        <option value="Producto">Producto</option>
                        <option value="Servicio">Servicio</option>
                    </select>
                </div>
                <div>
                    <label for="elemento-busqueda" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.4rem;">Producto o servicio *</label>
                    <input id="elemento-busqueda" type="text" list={tipoElemento === 'Producto' ? 'lista-productos' : 'lista-servicios'} bind:value={inputBusquedaElemento} placeholder={`Buscar ${tipoElemento.toLowerCase()}`} style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" autocomplete="off" />
                </div>
            </div>
            
            <div style="display: flex; gap: 1.5rem; align-items: flex-end;">
                <div style="flex: 1;">
                    <label for="cantidad-venta" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.4rem;">Cantidad *</label>
                    <input id="cantidad-venta" type="number" min="1" bind:value={cantidadIngresada} style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                </div>
                <div style="flex: 2;">
                    <button type="button" onclick={agregarElemento} style="background-color: white; color: #1e3a8a; border: 1px solid #1e3a8a; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">Agregar a la venta</button>
                </div>
            </div>
        </div>

        <!-- SECCIÓN 2: Elementos de la Venta (Carrito) y Formulario de Confirmación -->
        <div style="border: 1px dashed #d1d5db; padding: 1.5rem; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #111827; font-size: 1.1rem; margin-bottom: 1rem;">Elementos de la venta</h3>

            {#if form?.errorVenta}
                <div style="background-color: #fee2e2; color: #b91c1c; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem;">{form.errorVenta}</div>
            {/if}
            {#if form?.successVenta}
                <div style="background-color: #dcfce3; color: #166534; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem;">Venta registrada exitosamente. El inventario ha sido actualizado.</div>
            {/if}

            <table style="width: 100%; border-collapse: collapse; text-align: left; margin-bottom: 1.5rem;">
                <thead>
                    <tr style="background-color: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                        <th style="padding: 0.75rem; color: #374151;">Elemento</th>
                        <th style="padding: 0.75rem; color: #374151;">Tipo</th>
                        <th style="padding: 0.75rem; color: #374151;">Cantidad</th>
                        <th style="padding: 0.75rem; color: #374151;">Precio</th>
                        <th style="padding: 0.75rem; color: #374151;">Subtotal</th>
                        <th style="padding: 0.75rem; color: #374151;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {#each elementosVenta as item, i}
                        <tr style="border-bottom: 1px dashed #e5e7eb;">
                            <td style="padding: 0.75rem; color: #4b5563;">{item.nombre}</td>
                            <td style="padding: 0.75rem; color: #4b5563;">{item.tipo}</td>
                            <td style="padding: 0.75rem; color: #4b5563;">{item.cantidad}</td>
                            <td style="padding: 0.75rem; color: #4b5563;">{item.precio}</td>
                            <td style="padding: 0.75rem; color: #4b5563;">{item.subtotal}</td>
                            <td style="padding: 0.75rem;">
                                <button type="button" onclick={() => quitarElemento(i)} style="background: none; border: none; color: #1e3a8a; cursor: pointer; padding: 0; font-weight: 500;">Quitar</button>
                            </td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="6" style="padding: 1rem; text-align: center; color: #6b7280;">No hay elementos en la venta.</td>
                        </tr>
                    {/each}
                </tbody>
            </table>

            <h3 style="color: #111827; margin-bottom: 2rem; font-size: 1.1rem;">Importe total: {importeTotal}</h3>

            <!-- Formulario Final que envía todo al backend -->
            <form method="POST" action="?/confirmarVenta" use:enhance={submitVenta}>
                <!-- Campo oculto para mandar el carrito completo como texto (JSON) -->
                <input type="hidden" name="carrito" value={JSON.stringify(elementosVenta)} />
                <input type="hidden" name="total" value={importeTotal} />
                
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                    <div>
                        <label for="venta_prop" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.4rem;">Propietario *</label>
                        <!-- Datalist para buscar Propietario -->
                        <input type="text" id="venta_prop" list="lista-propietarios-venta" bind:value={inputPropietario} required placeholder="Buscar propietario" style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" autocomplete="off" />
                        <input type="hidden" name="id_propietario" value={idPropietarioSeleccionado} required />
                    </div>
                    <div>
                        <label for="venta_fecha" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.4rem;">Fecha *</label>
                        <!-- Bloqueamos fechas futuras -->
                        <input type="date" id="venta_fecha" name="fecha" max={fechaMaxima} required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                    </div>
                </div>

                <div style="display: flex; gap: 0.5rem;">
                    <!-- Se deshabilita si el carrito está vacío o si no seleccionó un dueño válido -->
                    <button type="submit" disabled={elementosVenta.length === 0 || !idPropietarioSeleccionado} style="background-color: {elementosVenta.length === 0 || !idPropietarioSeleccionado ? '#9ca3af' : '#1e3a8a'}; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: {elementosVenta.length === 0 || !idPropietarioSeleccionado ? 'not-allowed' : 'pointer'};">Confirmar venta y generar factura</button>
                    
                    <button type="button" onclick={cancelarVenta} style="background-color: white; color: #1e3a8a; border: 1px solid #1e3a8a; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">Cancelar venta</button>
                </div>
            </form>
        </div>
    </div>
</main>