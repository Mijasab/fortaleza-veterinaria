import { redirect } from '@sveltejs/kit';

export const load = async () => {
    // Redirige automáticamente al login si entran a la URL base
    throw redirect(303, '/login');
};