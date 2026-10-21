import { db } from '../../lib/db';
import { ventas, detalles_venta, mascotas, servicios, propietarios, productos, citas, servicios_realizados } from '../../lib/db/schema';
import { eq, asc, desc } from 'drizzle-orm';

export const load = async () => {
    // 1. Catálogos base
    const listaMascotas = await db
        .select({
            id_mascota: mascotas.id_mascota,
            nombre: mascotas.nombre,
            especie: mascotas.especie,
            raza: mascotas.raza,
            nombre_propietario: propietarios.nombre_completo
        })
        .from(mascotas)
        .innerJoin(propietarios, eq(mascotas.id_propietario, propietarios.id_propietario))
        .orderBy(asc(mascotas.nombre));

    const listaServicios = await db.select().from(servicios).orderBy(asc(servicios.nombre));
    const listaProductos = await db.select().from(productos).orderBy(asc(productos.nombre));

    // 2. Datos para Reporte de Ventas
    const listaVentas = await db.select().from(ventas).orderBy(asc(ventas.fecha));
    const listaDetalles = await db.select().from(detalles_venta);

    const ventasConResumen = listaVentas.map(venta => {
        const detalles = listaDetalles.filter(d => d.id_venta === venta.id_venta);
        let countProductos = 0, countServicios = 0;
        detalles.forEach(d => {
            if (d.tipo_elemento === 'Producto') countProductos++;
            if (d.tipo_elemento === 'Servicio') countServicios++;
        });
        
        let resumen = [];
        if (countProductos > 0) resumen.push(`${countProductos} prod`);
        if (countServicios > 0) resumen.push(`${countServicios} serv`);

        return { ...venta, elementos: resumen.length > 0 ? resumen.join(', ') : 'Sin detalle' };
    });

    // 3. Datos para Reporte de Citas
    const listaCitas = await db
        .select({
            fecha: citas.fecha,
            estado: citas.estado,
            motivo: citas.motivo,
            nombre_mascota: mascotas.nombre
        })
        .from(citas)
        .innerJoin(mascotas, eq(citas.id_mascota, mascotas.id_mascota))
        .orderBy(desc(citas.fecha));

    // 4. Datos para Reporte de Servicios Realizados
    const listaServiciosRealizados = await db
        .select({
            fecha: servicios_realizados.fecha,
            nombre_servicio: servicios.nombre,
            tipo_servicio: servicios.tipo,
            nombre_mascota: mascotas.nombre
        })
        .from(servicios_realizados)
        .innerJoin(servicios, eq(servicios_realizados.id_servicio, servicios.id_servicio))
        .innerJoin(mascotas, eq(servicios_realizados.id_mascota, mascotas.id_mascota))
        .orderBy(desc(servicios_realizados.fecha));

    return {
        mascotas: listaMascotas,
        servicios: listaServicios,
        productos: listaProductos,
        datosVentas: ventasConResumen,
        datosCitas: listaCitas,
        datosServiciosRealizados: listaServiciosRealizados
    };
};