import { redirect } from '@sveltejs/kit';

export const POST = async ({ cookies }) => {
    // Borramos la cookie de sesión
    cookies.delete('session', { path: '/' });
    
    // Lo pateamos de vuelta al login
    throw redirect(303, '/login');
};