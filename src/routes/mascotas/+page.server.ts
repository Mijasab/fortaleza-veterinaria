import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '../../lib/db';
import { mascotas, propietarios } from '../../lib/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
    const listaMascotas = await db
        .select({
            id_mascota: mascotas.id_mascota,
            nombre: mascotas.nombre,
            especie: mascotas.especie,
            raza: mascotas.raza,
            id_propietario: mascotas.id_propietario, // Necesario para el formulario de edición
            nombre_propietario: propietarios.nombre_completo
        })
        .from(mascotas)
        .innerJoin(propietarios, eq(mascotas.id_propietario, propietarios.id_propietario));

    const listaPropietarios = await db.query.propietarios.findMany();

    return {
        mascotas: listaMascotas,
        propietarios: listaPropietarios
    };
};

export const actions: Actions = {
    registrar: async ({ request }) => {
        const data = await request.formData();
        const nombre = data.get('nombre')?.toString();
        const especie = data.get('especie')?.toString();
        const raza = data.get('raza')?.toString();
        const id_propietario = Number(data.get('id_propietario'));

        if (!nombre || !especie || !id_propietario) {
            return fail(400, { error: 'Nombre, especie y propietario son obligatorios.' });
        }

        await db.insert(mascotas).values({
            nombre: nombre,
            especie: especie,
            raza: raza || '',
            id_propietario: id_propietario
        });

        return { success: true };
    },

    // NUEVO: Acción para guardar las modificaciones
    modificar: async ({ request }) => {
        const data = await request.formData();
        const id_mascota = Number(data.get('id_mascota'));
        const nombre = data.get('nombre')?.toString();
        const especie = data.get('especie')?.toString();
        const raza = data.get('raza')?.toString();
        const id_propietario = Number(data.get('id_propietario'));

        if (!id_mascota || !nombre || !especie || !id_propietario) {
            return fail(400, { errorEditar: 'Faltan datos obligatorios para modificar.' });
        }

        await db.update(mascotas)
            .set({ nombre: nombre, especie: especie, raza: raza || '', id_propietario: id_propietario })
            .where(eq(mascotas.id_mascota, id_mascota));

        return { successEditar: true };
    }
};