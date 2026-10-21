import { fail } from '@sveltejs/kit';
import { db } from '../../lib/db';
import { facturas, ventas, detalles_venta, propietarios } from '../../lib/db/schema';
import { eq, asc, desc, sql } from 'drizzle-orm';

export const load = async () => {
    // 1. Cargamos todas las facturas ya generadas con la info de la venta original
    const listaFacturas = await db
        .select({
            id_factura: facturas.id_factura,
            numero_factura: facturas.numero_factura,
            fecha_emision: facturas.fecha_emision,
            id_venta: ventas.id_venta,
            total: ventas.total,
            nombre_propietario: propietarios.nombre_completo
        })
        .from(facturas)
        .innerJoin(ventas, eq(facturas.id_venta, ventas.id_venta))
        .innerJoin(propietarios, eq(ventas.id_propietario, propietarios.id_propietario))
        .orderBy(desc(facturas.id_factura)); // Las más recientes primero

    // 2. Cargamos TODOS los detalles de ventas para poder mostrarlos en el modal de "Ver"
    const listaDetalles = await db.select().from(detalles_venta);

    // 3. Cargamos SOLO las ventas que NO tienen factura para el Datalist inferior
    const ventasSinFacturar = await db
        .select({
            id_venta: ventas.id_venta,
            fecha: ventas.fecha,
            total: ventas.total,
            nombre_propietario: propietarios.nombre_completo
        })
        .from(ventas)
        .innerJoin(propietarios, eq(ventas.id_propietario, propietarios.id_propietario))
        .leftJoin(facturas, eq(ventas.id_venta, facturas.id_venta))
        .where(sql`${facturas.id_factura} IS NULL`)
        .orderBy(asc(ventas.id_venta));

    return {
        facturas: listaFacturas,
        detalles: listaDetalles,
        ventasPendientes: ventasSinFacturar
    };
};

export const actions = {
    generarFactura: async ({ request }) => {
        const data = await request.formData();
        const id_venta = Number(data.get('id_venta'));

        if (!id_venta) {
            return fail(400, { errorFactura: 'Debe seleccionar una venta válida.' });
        }

        const hoy = new Date().toISOString().split('T')[0];

        // Obtenemos el último número de factura para generar el siguiente (F-000X)
        const ultimaFactura = await db.query.facturas.findFirst({
            orderBy: [desc(facturas.id_factura)]
        });

        let nuevoNumero = 'F-0001';
        if (ultimaFactura && ultimaFactura.numero_factura) {
            const numeroActual = parseInt(ultimaFactura.numero_factura.split('-')[1]);
            nuevoNumero = `F-${(numeroActual + 1).toString().padStart(4, '0')}`;
        }

        await db.insert(facturas).values({
            id_venta,
            fecha_emision: hoy,
            numero_factura: nuevoNumero
        });

        return { successFactura: true };
    }
};