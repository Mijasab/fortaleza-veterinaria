import { fail } from '@sveltejs/kit';
import { db } from '../../lib/db';
import { ventas, detalles_venta, productos, servicios, propietarios } from '../../lib/db/schema';
import { eq, asc } from 'drizzle-orm';

export const load = async () => {
    // Solo cargamos productos que tengan existencia mayor a 0
    const listaProductos = await db.select().from(productos).orderBy(asc(productos.nombre));
    const productosDisponibles = listaProductos.filter(p => p.existencia > 0);
    
    // Solo servicios activos
    const listaServicios = await db.select().from(servicios).where(eq(servicios.estado, 'Activo')).orderBy(asc(servicios.nombre));
    const listaPropietarios = await db.select().from(propietarios).orderBy(asc(propietarios.nombre_completo));

    return {
        productos: productosDisponibles,
        servicios: listaServicios,
        propietarios: listaPropietarios
    };
};

export const actions = {
    confirmarVenta: async ({ request }) => {
        const data = await request.formData();
        const id_propietario = Number(data.get('id_propietario'));
        const fecha = data.get('fecha')?.toString();
        const total = data.get('total')?.toString();
        
        // Recibimos el "carrito" desde el frontend en formato JSON
        const carritoString = data.get('carrito')?.toString();

        if (!id_propietario || !fecha || !carritoString) {
            return fail(400, { errorVenta: 'Complete todos los datos y agregue elementos a la venta.' });
        }

        const elementosVenta = JSON.parse(carritoString);
        if (elementosVenta.length === 0) {
            return fail(400, { errorVenta: 'No se puede confirmar una venta vacía.' });
        }

        // 1. Registramos la Venta Principal
        const nuevaVenta = await db.insert(ventas).values({
            id_propietario,
            fecha,
            total: total || '0'
        }).returning({ id_venta: ventas.id_venta });

        const id_venta = nuevaVenta[0].id_venta;

        // 2. Registramos los detalles y actualizamos inventario
        for (const item of elementosVenta) {
            await db.insert(detalles_venta).values({
                id_venta,
                tipo_elemento: item.tipo,
                id_producto: item.tipo === 'Producto' ? item.id : null,
                id_servicio: item.tipo === 'Servicio' ? item.id : null,
                nombre_elemento: item.nombre,
                cantidad: item.cantidad,
                precio_unitario: item.precio,
                subtotal: item.subtotal
            });

            // Si es producto, restamos la existencia
            if (item.tipo === 'Producto') {
                const prod = await db.query.productos.findFirst({ where: eq(productos.id_producto, item.id) });
                if (prod) {
                    await db.update(productos)
                        .set({ existencia: prod.existencia - item.cantidad })
                        .where(eq(productos.id_producto, item.id));
                }
            }
        }

        return { successVenta: true };
    }
};