import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '../../lib/db';
// 1. IMPORTANTE: Agrega "propietarios" a la importación del schema
import { citas, mascotas, propietarios } from '../../lib/db/schema';
import { eq, asc, and, ne } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
    const listaCitas = await db
        .select({
            id_cita: citas.id_cita,
            fecha: citas.fecha,
            hora: citas.hora,
            estado: citas.estado,
            motivo: citas.motivo,
            id_mascota: citas.id_mascota,
            nombre_mascota: mascotas.nombre
        })
        .from(citas)
        .innerJoin(mascotas, eq(citas.id_mascota, mascotas.id_mascota))
        .orderBy(asc(citas.estado), asc(citas.fecha), asc(citas.hora));

    // 2. CORRECCIÓN: Traemos las mascotas pero unidas a sus dueños
    const listaMascotas = await db
    .select({
        id_mascota: mascotas.id_mascota,
        nombre: mascotas.nombre,
        nombre_propietario: propietarios.nombre_completo // ¡Importante traer este campo!
    })
    .from(mascotas)
    .innerJoin(propietarios, eq(mascotas.id_propietario, propietarios.id_propietario));

    return {
        citas: listaCitas,
        mascotas: listaMascotas
    };
};

export const actions: Actions = {
    registrar: async ({ request }) => {
        const data = await request.formData();
        const id_mascota = Number(data.get('id_mascota'));
        const motivo = data.get('motivo')?.toString();
        const fecha = data.get('fecha')?.toString();
        const hora = data.get('hora')?.toString();

        if (!id_mascota || !motivo || !fecha || !hora) {
            return fail(400, { error: 'Todos los campos son obligatorios.' });
        }

        // Excepción E1: Validar disponibilidad de Fecha y Hora
        const citaOcupada = await db.query.citas.findFirst({
            where: and(
                eq(citas.fecha, fecha),
                eq(citas.hora, hora)
            )
        });

        if (citaOcupada) {
            return fail(400, { error: 'El horario seleccionado no está disponible. Elija otra fecha u hora.' });
        }

        await db.insert(citas).values({
            id_mascota: id_mascota,
            motivo: motivo,
            fecha: fecha,
            hora: hora,
            estado: 'Activa' // Se crea activa por defecto
        });

        return { success: true };
    },

    modificar: async ({ request }) => {
        const data = await request.formData();
        const id_cita = Number(data.get('id_cita'));
        const id_mascota = Number(data.get('id_mascota'));
        const motivo = data.get('motivo')?.toString();
        const fecha = data.get('fecha')?.toString();
        const hora = data.get('hora')?.toString();

        if (!id_cita || !id_mascota || !motivo || !fecha || !hora) {
            return fail(400, { errorEditar: 'Faltan datos para modificar.' });
        }

        // Excepción E1: Validar disponibilidad al reagendar
            const citaOcupada = await db.query.citas.findFirst({
                where: and(
                    eq(citas.fecha, fecha),
                    eq(citas.hora, hora),
                    ne(citas.id_cita, id_cita) // ne = not equal (ignora la cita actual)
                )
            });

            if (citaOcupada) {
                return fail(400, { errorEditar: 'El horario seleccionado no está disponible. Elija otra fecha u hora.' });
            }

        await db.update(citas)
            .set({ id_mascota, motivo, fecha, hora })
            .where(eq(citas.id_cita, id_cita));

        return { successEditar: true };
    },

    // Acción para cambiar el estado de la cita a "Cancelada"
    cancelar: async ({ request }) => {
        const data = await request.formData();
        const id_cita = Number(data.get('id_cita'));

        if (!id_cita) return fail(400, { errorCancelar: 'ID inválido.' });

        await db.update(citas).set({ estado: 'Cancelada' }).where(eq(citas.id_cita, id_cita));
        
        return { successCancelar: true };
    }
};