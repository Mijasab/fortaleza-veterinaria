import { fail } from '@sveltejs/kit';
import { db } from '../../lib/db';
import { historial_clinico, mascotas, propietarios } from '../../lib/db/schema';
import { eq, asc } from 'drizzle-orm'; // Cambiado desc por asc

export const load = async () => {
    const listaMascotas = await db
        .select({
            id_mascota: mascotas.id_mascota,
            nombre: mascotas.nombre,
            especie: mascotas.especie,
            nombre_propietario: propietarios.nombre_completo
        })
        .from(mascotas)
        .innerJoin(propietarios, eq(mascotas.id_propietario, propietarios.id_propietario));

    // Ordenamos de la fecha más vieja a la más nueva
    const listaHistorial = await db
        .select()
        .from(historial_clinico)
        .orderBy(asc(historial_clinico.fecha));

    return {
        mascotas: listaMascotas,
        historial: listaHistorial
    };
};

export const actions = {
    registrarConsulta: async ({ request }) => {
        const data = await request.formData();
        const id_mascota = Number(data.get('id_mascota'));
        const fecha = data.get('fecha')?.toString();
        const motivo = data.get('motivo')?.toString();
        const evaluacion = data.get('evaluacion')?.toString() || '';
        const observaciones = data.get('observaciones')?.toString() || '';
        const tratamento = data.get('tratamiento')?.toString() || '';

        if (!id_mascota || !fecha || !motivo) {
            return fail(400, { errorConsulta: 'La fecha y el motivo son obligatorios.' });
        }

        await db.insert(historial_clinico).values({
            id_mascota,
            fecha,
            tipo_registro: 'Consulta',
            resumen: motivo, 
            evaluacion,
            observaciones,
            tratamiento: tratamento
        });

        return { successConsulta: true };
    },

    registrarAtencion: async ({ request }) => {
        const data = await request.formData();
        const id_mascota = Number(data.get('id_mascota'));
        const fecha = data.get('fecha')?.toString();
        const tipo_atencion = data.get('tipo_atencion')?.toString();
        const informacion = data.get('informacion')?.toString() || '';

        if (!id_mascota || !fecha || !tipo_atencion) {
            return fail(400, { errorAtencion: 'El tipo de atención y la fecha son obligatorios.' });
        }

        await db.insert(historial_clinico).values({
            id_mascota,
            fecha,
            tipo_registro: tipo_atencion,
            resumen: informacion ? informacion.substring(0, 60) : tipo_atencion,
            evaluacion: '',
            observaciones: informacion,
            tratamiento: ''
        });

        return { successAtencion: true };
    }
};