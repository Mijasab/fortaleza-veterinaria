import { fail } from '@sveltejs/kit';
import { db } from '../../lib/db';
import { productos } from '../../lib/db/schema';
import { eq, asc } from 'drizzle-orm';

export const load = async () => {
    const listaProductos = await db.select().from(productos).orderBy(asc(productos.nombre));
    return { productos: listaProductos };
};

export const actions = {
    registrarProducto: async ({ request }) => {
        const data = await request.formData();
        const nombre = data.get('nombre')?.toString();
        const categoria = data.get('categoria')?.toString();
        const precio = data.get('precio')?.toString();
        const existencia = Number(data.get('existencia'));

        // NUEVA VALIDACIÓN: Convertimos el precio a número para evaluarlo
        const precioNum = Number(precio);

        if (!nombre || !categoria || !precio || isNaN(existencia)) {
            return fail(400, { errorRegistro: 'Todos los campos son obligatorios.' });
        }

        if (isNaN(precioNum) || precioNum < 0) {
            return fail(400, { errorRegistro: 'El precio no puede ser negativo ni contener letras.' });
        }

        await db.insert(productos).values({
            nombre,
            categoria,
            precio, // Se guarda el texto original pero ya validado matemáticamente
            existencia
        });

        return { successRegistro: true };
    },

    modificarProducto: async ({ request }) => {
        const data = await request.formData();
        const id_producto = Number(data.get('id_producto'));
        const nombre = data.get('nombre')?.toString();
        const categoria = data.get('categoria')?.toString();
        const precio = data.get('precio')?.toString();

        const precioNum = Number(precio);

        if (!id_producto || !nombre || !categoria || !precio) {
            return fail(400, { errorModificar: 'Todos los campos son obligatorios.' });
        }

        if (isNaN(precioNum) || precioNum < 0) {
            return fail(400, { errorModificar: 'El precio no puede ser negativo ni contener letras.' });
        }

        await db.update(productos)
            .set({ nombre, categoria, precio })
            .where(eq(productos.id_producto, id_producto));

        return { successModificar: true };
    },

    actualizarExistencia: async ({ request }) => {
        const data = await request.formData();
        const id_producto = Number(data.get('id_producto'));
        const tipo_movimiento = data.get('tipo_movimiento')?.toString();
        const cantidad = Number(data.get('cantidad'));
        const existencia_actual = Number(data.get('existencia_actual'));

        if (!id_producto || !tipo_movimiento || !cantidad || cantidad <= 0) {
            return fail(400, { errorExistencia: 'Ingrese una cantidad válida mayor a 0.' });
        }

        let nuevaExistencia = existencia_actual;
        
        if (tipo_movimiento === 'Entrada') {
            nuevaExistencia += cantidad;
        } else if (tipo_movimiento === 'Salida') {
            if (cantidad > existencia_actual) {
                return fail(400, { errorExistencia: 'La cantidad a retirar supera la existencia actual.' });
            }
            nuevaExistencia -= cantidad;
        }

        await db.update(productos)
            .set({ existencia: nuevaExistencia })
            .where(eq(productos.id_producto, id_producto));

        return { successExistencia: true };
    }
};