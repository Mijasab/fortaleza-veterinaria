import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './\$types';
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
        const nombreCompleto = data.get('nombre_completo')?.toString().trim();
        const telefono = data.get('telefono')?.toString().trim();

        if (!nombreCompleto || !telefono) {
            return fail(400, { error: 'Debe ingresar nombre y teléfono.' });
        }

        // Expresión regular que exige exactamente 8 números del 0 al 9
        const regexTelefono = /^[0-9]{8}$/;

        if (!telefono || !regexTelefono.test(telefono.trim())) {
            return fail(400, { error: 'El número de celular debe contener exactamente 8 dígitos numéricos.' });
        }

        const existe = await db.query.propietarios.findFirst({
            where: eq(propietarios.nombre_completo, nombreCompleto)
        });

        if (existe) {
            return fail(400, { error: `Ya existe un propietario registrado exactamente con el nombre "${nombreCompleto}".` });
        }

        await db.insert(propietarios).values({ nombre_completo: nombreCompleto, telefono: telefono });
        return { success: true };
    },
    
    modificar: async ({ request }) => {
        const data = await request.formData();
        const id = Number(data.get('id_propietario'));
        const nombreCompleto = data.get('nombre_completo')?.toString().trim();
        const telefono = data.get('telefono')?.toString().trim();

        if (!id || !nombreCompleto || !telefono) {
            return fail(400, { errorEditar: 'Faltan datos para modificar.' });
        }

        // Expresión regular que exige exactamente 8 números del 0 al 9
        const regexTelefono = /^[0-9]{8}$/;

        if (!telefono || !regexTelefono.test(telefono.trim())) {
            return fail(400, { errorEditar: 'El número de celular debe contener exactamente 8 dígitos numéricos.' });
        }

        // Buscar si el nombre ya lo tiene otra persona diferente
        const propietarioExistente = await db.query.propietarios.findFirst({
            where: eq(propietarios.nombre_completo, nombreCompleto)
        });

        // Si el nombre existe, pero pertenece a un ID diferente al que estamos editando, lanzamos error
        if (propietarioExistente && propietarioExistente.id_propietario !== id) {
            return fail(400, { errorEditar: `El nombre "${nombreCompleto}" ya está registrado a otro propietario.` });
        }

        await db.update(propietarios)
            .set({ nombre_completo: nombreCompleto, telefono: telefono })
            .where(eq(propietarios.id_propietario, id));

        return { successEditar: true };
    }
};