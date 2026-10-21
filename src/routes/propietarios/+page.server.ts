import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '../../lib/db';
import { propietarios, mascotas } from '../../lib/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
    const listaPropietarios = await db.query.propietarios.findMany();
    const listaMascotas = await db.query.mascotas.findMany();

    // Cruzar datos para obtener el número de mascotas y la lista para el botón "Ver"
    const propietariosConMascotas = listaPropietarios.map(prop => {
        const susMascotas = listaMascotas.filter(m => m.id_propietario === prop.id_propietario);
        return {
            ...prop,
            mascotasAsociadas: susMascotas,
            cantidad_mascotas: susMascotas.length
        };
    });

    return { propietarios: propietariosConMascotas };
};

export const actions: Actions = {
    registrar: async ({ request }) => {
        const data = await request.formData();
        const nombreCompleto = data.get('nombre_completo')?.toString();
        const telefono = data.get('telefono')?.toString();

        if (!nombreCompleto || !telefono) {
            return fail(400, { error: 'Debe ingresar nombre y teléfono.' });
        }

        const existe = await db.query.propietarios.findFirst({
            where: eq(propietarios.nombre_completo, nombreCompleto)
        });

        if (existe) {
            return fail(400, { error: 'Ya existe un propietario con ese nombre.' });
        }

        await db.insert(propietarios).values({ nombre_completo: nombreCompleto, telefono: telefono });
        return { success: true };
    },
    
    modificar: async ({ request }) => {
        const data = await request.formData();
        const id = Number(data.get('id_propietario'));
        const nombreCompleto = data.get('nombre_completo')?.toString();
        const telefono = data.get('telefono')?.toString();

        if (!id || !nombreCompleto || !telefono) {
            return fail(400, { errorEditar: 'Faltan datos para modificar.' });
        }

        await db.update(propietarios)
            .set({ nombre_completo: nombreCompleto, telefono: telefono })
            .where(eq(propietarios.id_propietario, id));

        return { successEditar: true };
    }
};