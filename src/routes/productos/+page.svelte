<script lang="ts">
    import { enhance } from '$app/forms';
    
    let { data, form } = $props();

    // Filtros de búsqueda superior
    let inputBusqueda = $state('');
    let selectCategoria = $state('');
    
    let filtroNombre = $state('');
    let filtroCat = $state('');

    let productosFiltrados = $derived(
        (data.productos as any[]).filter(p => {
            const matchNombre = filtroNombre === '' || p.nombre.toLowerCase().includes(filtroNombre.toLowerCase());
            const matchCat = filtroCat === '' || filtroCat === 'Todas las categorías' || p.categoria === filtroCat;
            return matchNombre && matchCat;
        })
    );

    function realizarFiltro() {
        filtroNombre = inputBusqueda.trim();
        filtroCat = selectCategoria;
        mostrandoRegistro = false;
        mostrandoActualizacion = false;
    }

    // Formularios desplegables
    let mostrandoRegistro = $state(false);
    let mostrandoActualizacion = $state(false);
    let productoActualizar: any = $state(null);

    function abrirRegistro() {
        mostrandoRegistro = true;
        mostrandoActualizacion = false;
    }

    function abrirActualizacion(producto: any) {
        productoActualizar = producto;
        mostrandoActualizacion = true;
        mostrandoRegistro = false;
    }

    // Modal de Modificación
    let editandoProducto = $state(false);
    let productoEditado: any = $state({ id_producto: 0, nombre: '', categoria: '', precio: '' });

    function iniciarEdicion(producto: any) {
        productoEditado = { ...producto };
        editandoProducto = true;
    }

    function cancelarEdicion() {
        editandoProducto = false;
    }

    // Vaciado automático de formularios
    function submitRegistro() {
        return async ({ update, result }: any) => {
            await update({ reset: true });
            if (result.type === 'success') mostrandoRegistro = false;
        };
    }

    function submitActualizacion() {
        return async ({ update, result }: any) => {
            await update({ reset: true });
            if (result.type === 'success') mostrandoActualizacion = false;
        };
    }
</script>

<svelte:head>
    <title>Gestión de productos - Fortaleza Veterinaria</title>
</svelte:head>

<main style="padding: 2rem;">
    <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 950px; margin: 0 auto; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        
        <h2 style="color: #111827; margin-top: 0; font-size: 1.5rem; margin-bottom: 0.25rem;">Gestión de productos e inventario</h2>

        <!-- Barra Superior de Búsqueda -->
        <div style="border: 1px dashed #d1d5db; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
                <input type="text" bind:value={inputBusqueda} placeholder="Buscar producto" style="flex: 2; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px;" autocomplete="off" />
                
                <select bind:value={selectCategoria} style="flex: 1; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; background: white;">
                    <option value="">Todas las categorías</option>
                    <option value="Alimento">Alimento</option>
                    <option value="Juguete">Juguete</option>
                    <option value="Medicamento">Medicamento</option>
                    <option value="Accesorio">Accesorio</option>
                    <option value="Higiene">Higiene</option>
                </select>

                <button type="button" onclick={realizarFiltro} style="background-color: white; color: #1e3a8a; border: 1px solid #1e3a8a; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">Filtrar</button>
                <button type="button" onclick={abrirRegistro} style="background-color: #1e3a8a; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">Registrar producto</button>
            </div>

            <!-- Tabla de Inventario -->
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="background-color: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                        <th style="padding: 0.75rem; color: #374151;">Producto</th>
                        <th style="padding: 0.75rem; color: #374151;">Categoría</th>
                        <th style="padding: 0.75rem; color: #374151;">Precio</th>
                        <th style="padding: 0.75rem; color: #374151;">Existencia</th>
                        <th style="padding: 0.75rem; color: #374151;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {#each productosFiltrados as p}
                        <tr style="border-bottom: 1px dashed #e5e7eb;">
                            <td style="padding: 0.75rem; color: #4b5563;">{p.nombre}</td>
                            <td style="padding: 0.75rem; color: #4b5563;">{p.categoria}</td>
                            <td style="padding: 0.75rem; color: #4b5563;">C${p.precio}</td>
                            <td style="padding: 0.75rem; color: #4b5563; font-weight: bold;">{p.existencia}</td>
                            <td style="padding: 0.75rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                <button type="button" onclick={() => iniciarEdicion(p)} style="background: none; border: none; color: #1e3a8a; cursor: pointer; padding: 0; font-weight: 500;">Modificar</button>
                                <span style="color: #9ca3af;">,</span>
                                <button type="button" onclick={() => abrirActualizacion(p)} style="background: none; border: none; color: #1e3a8a; cursor: pointer; padding: 0; font-weight: 500;">Actualizar existencia</button>
                            </td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="5" style="padding: 1rem; text-align: center; color: #6b7280;">No se encontraron productos.</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <!-- RECUADRO ROJO: Registrar Producto -->
        {#if mostrandoRegistro}
            <div style="border: 2px solid #ef4444; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                <h3 style="margin-top: 0; color: #111827; margin-bottom: 1.5rem;">Registrar producto</h3>
                
                {#if form?.errorRegistro}
                    <div style="background-color: #fee2e2; color: #b91c1c; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem;">{form.errorRegistro}</div>
                {/if}
                {#if form?.successRegistro}
                    <div style="background-color: #dcfce3; color: #166534; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem;">Producto registrado exitosamente.</div>
                {/if}

                <form method="POST" action="?/registrarProducto" use:enhance={submitRegistro}>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                        <div>
                            <label for="reg_nombre" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Nombre *</label>
                            <input type="text" id="reg_nombre" name="nombre" required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                        </div>
                        <div>
                            <label for="reg_cat" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Categoría *</label>
                            <select id="reg_cat" name="categoria" required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box; background: white;">
                                <option value="">Seleccione una categoría</option>
                                <option value="Alimento">Alimento</option>
                                <option value="Juguete">Juguete</option>
                                <option value="Medicamento">Medicamento</option>
                                <option value="Accesorio">Accesorio</option>
                                <option value="Higiene">Higiene</option>
                            </select>
                        </div>
                        <div>
                            <label for="reg_precio" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Precio *</label>
                            <input type="number" step="0.01" min="0" id="reg_precio" name="precio" required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                        </div>
                        <div>
                            <label for="reg_cant" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Cantidad disponible *</label>
                            <input type="number" step="0.01" min="0" id="reg_cant" name="existencia" required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button type="submit" style="background-color: #1e3a8a; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">Confirmar registro</button>
                        <button type="reset" onclick={() => mostrandoRegistro = false} style="background-color: white; color: #1e3a8a; border: 1px solid #1e3a8a; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">Cancelar</button>
                    </div>
                </form>
            </div>
        {/if}

        <!-- RECUADRO VERDE: Actualizar Existencia -->
        {#if mostrandoActualizacion && productoActualizar}
            <div style="border: 2px dashed #22c55e; padding: 1.5rem; border-radius: 8px;">
                <h3 style="margin-top: 0; color: #111827; margin-bottom: 1.5rem;">Actualizar existencia</h3>
                
                {#if form?.errorExistencia}
                    <div style="background-color: #fee2e2; color: #b91c1c; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem;">{form.errorExistencia}</div>
                {/if}
                {#if form?.successExistencia}
                    <div style="background-color: #dcfce3; color: #166534; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem;">Existencia actualizada exitosamente.</div>
                {/if}

                <form method="POST" action="?/actualizarExistencia" use:enhance={submitActualizacion}>
                    <input type="hidden" name="id_producto" value={productoActualizar.id_producto} />
                    <input type="hidden" name="existencia_actual" value={productoActualizar.existencia} />
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                        <div>
                            <!-- Input bloqueado para evitar que modifiquen accidentalmente el nombre -->
                            <label for="act_prod" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Producto *</label>
                            <input type="text" id="act_prod" value={productoActualizar.nombre} disabled style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; background-color: #f3f4f6; box-sizing: border-box;" />
                        </div>
                        <div>
                            <label for="act_mov" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Tipo de movimiento *</label>
                            <select id="act_mov" name="tipo_movimiento" required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box; background: white;">
                                <option value="Entrada">Reposición (entrada)</option>
                                <option value="Salida">Venta / Baja (salida)</option>
                            </select>
                        </div>
                        <div>
                            <label for="act_cant" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Cantidad *</label>
                            <input type="number" min="1" id="act_cant" name="cantidad" required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                        </div>
                        <div>
                            <label for="act_actual" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.5rem;">Existencia actual</label>
                            <input type="number" id="act_actual" value={productoActualizar.existencia} disabled style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; background-color: #f3f4f6; box-sizing: border-box;" />
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button type="submit" style="background-color: #1e3a8a; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">Confirmar actualización</button>
                        <button type="button" onclick={() => mostrandoActualizacion = false} style="background-color: white; color: #1e3a8a; border: 1px solid #1e3a8a; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer;">Cancelar</button>
                    </div>
                </form>
            </div>
        {/if}
    </div>

    <!-- MODAL DE EDICIÓN: Datos base del producto -->
    {#if editandoProducto}
        <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 50;">
            <div style="background: white; padding: 2rem; border-radius: 8px; width: 100%; max-width: 500px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h3 style="margin-top: 0; color: #1e3a8a; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; margin-bottom: 1.5rem;">Modificar Datos del Producto</h3>
                
                {#if form?.errorModificar}
                    <div style="background-color: #fee2e2; color: #b91c1c; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem;">{form.errorModificar}</div>
                {/if}

                <form method="POST" action="?/modificarProducto" use:enhance={() => { return async ({ update }) => { await update(); cancelarEdicion(); }; }}>
                    <input type="hidden" name="id_producto" value={productoEditado.id_producto} />
                    
                    <div style="display: grid; gap: 1rem; margin-bottom: 1.5rem;">
                        <div>
                            <label for="producto-nombre" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.4rem;">Nombre *</label>
                            <input id="producto-nombre" type="text" name="nombre" value={productoEditado.nombre} required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                        </div>
                        <div>
                            <label for="producto-categoria" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.4rem;">Categoría *</label>
                            <select id="producto-categoria" name="categoria" required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box; background: white;">
                                <option value="Alimento" selected={productoEditado.categoria === 'Alimento'}>Alimento</option>
                                <option value="Juguete" selected={productoEditado.categoria === 'Juguete'}>Juguete</option>
                                <option value="Medicamento" selected={productoEditado.categoria === 'Medicamento'}>Medicamento</option>
                                <option value="Accesorio" selected={productoEditado.categoria === 'Accesorio'}>Accesorio</option>
                                <option value="Higiene" selected={productoEditado.categoria === 'Higiene'}>Higiene</option>
                            </select>
                        </div>
                        <div>
                            <label for="producto-precio" style="display: block; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.4rem;">Precio *</label>
                            <input type="number" step="0.01" min="0" id="producto-precio" name="precio" value={productoEditado.precio} required style="width: 100%; padding: 0.5rem; border: 1px dashed #d1d5db; border-radius: 4px; box-sizing: border-box;" />
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