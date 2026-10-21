import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '../../lib/db';
import { servicios, servicios_realizados, mascotas, propietarios } from '../../lib/db/schema';
import { eq, asc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
    // 1. Catálogo completo de servicios
    const listaServicios = await db.select().from(servicios).orderBy(asc(servicios.nombre));

    // 2. Mascotas con propietarios para el autocompletado y filtros
    const listaMascotas = await db
        .select({
            id_mascota: mascotas.id_mascota,
            nombre: mascotas.nombre,
            nombre_propietario: propietarios.nombre_completo
        })
        .from(mascotas)
        .innerJoin(propietarios, eq(mascotas.id_propietario, propietarios.id_propietario));

    // 3. Servicios realizados (con JOIN para mostrar nombres legibles)
    const listaRealizados = await db
        .select({
            id_servicio_realizado: servicios_realizados.id_servicio_realizado,
            fecha: servicios_realizados.fecha,
            nombre_mascota: mascotas.nombre,
            nombre_propietario: propietarios.nombre_completo,
            nombre_servicio: servicios.nombre,
            tipo_servicio: servicios.tipo,
            informacion_adicional: servicios_realizados.informacion_adicional
        })
        .from(servicios_realizados)
        .innerJoin(mascotas, eq(servicios_realizados.id_mascota, mascotas.id_mascota))
        .innerJoin(propietarios, eq(mascotas.id_propietario, propietarios.id_propietario))
        .innerJoin(servicios, eq(servicios_realizados.id_servicio, servicios.id_servicio))
        .orderBy(asc(servicios_realizados.fecha));

    return {
        servicios: listaServicios,
        mascotas: listaMascotas,
        realizados: listaRealizados
    };
};

export const actions: Actions = {
    guardarServicio: async ({ request }) => {
        const data = await request.formData();
        const nombre = data.get('nombre')?.toString();
        const tipo = data.get('tipo')?.toString();
        const precio = data.get('precio')?.toString();

        if (!nombre || !tipo || !precio) {
            return fail(400, { errorServicio: 'Todos los campos del servicio son obligatorios.' });
        }

        await db.insert(servicios).values({
            nombre,
            tipo,
            precio,
            estado: 'Activo'
        });

        return { successServicio: true };
    },

    modificarServicio: async ({ request }) => {
        const data = await request.formData();
        const id_servicio = Number(data.get('id_servicio'));
        const nombre = data.get('nombre')?.toString();
        const tipo = data.get('tipo')?.toString();
        const precio = data.get('precio')?.toString();
        const estado = data.get('estado')?.toString();

        if (!id_servicio || !nombre || !tipo || !precio || !estado) {
            return fail(400, { errorModificar: 'Complete todos los campos para modificar.' });
        }

        await db.update(servicios)
            .set({ nombre, tipo, precio, estado })
            .where(eq(servicios.id_servicio, id_servicio));

        return { successModificar: true };
    },

    registrarRealizado: async ({ request }) => {
        const data = await request.formData();
        const id_mascota = Number(data.get('id_mascota'));
        const id_servicio = Number(data.get('id_servicio'));
        const fecha = data.get('fecha')?.toString();
        const informacion_adicional = data.get('informacion_adicional')?.toString() || '';

        if (!id_mascota || !id_servicio || !fecha) {
            return fail(400, { errorRealizado: 'Mascota, servicio y fecha son obligatorios.' });
        }

        await db.insert(servicios_realizados).values({
            id_mascota,
            id_servicio,
            fecha,
            informacion_adicional
        });

        return { successRealizado: true };
    }
};