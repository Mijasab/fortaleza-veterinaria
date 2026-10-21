import { redirect } from '@sveltejs/kit';

export const load = async ({ cookies, url }) => {
    const session = cookies.get('session');
    
    // Si NO hay sesión y NO está en la página de login, lo mandamos al login
    if (!session && url.pathname !== '/login') {
        throw redirect(303, '/login');
    }
    
    // Si YA hay sesión y quiere entrar al login, lo mandamos a citas
    if (session && url.pathname === '/login') {
        throw redirect(303, '/citas');
    }

    return { 
        sesionActiva: !!session 
    };
};