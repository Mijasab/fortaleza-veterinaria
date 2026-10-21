import { fail, redirect } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { db } from '../../lib/db';
import { usuarios } from '../../lib/db/schema';
import { eq } from 'drizzle-orm';

export const actions = {
    default: async ({ request, cookies }) => {
        const data = await request.formData();
        const username = data.get('username')?.toString();
        const password = data.get('password')?.toString();

        if (!username || !password) {
            return fail(400, { error: 'Por favor, ingrese usuario y contraseña.' });
        }

        // 1. Buscar al usuario en la base de datos
        const user = await db.query.usuarios.findFirst({
            where: eq(usuarios.nombre_usuario, username)
        });

        if (!user || !user.estado_cuenta) {
            return fail(401, { error: 'Credenciales inválidas o cuenta desactivada.' });
        }

        // 2. Lógica de validación híbrida (Migración Silenciosa)
        let isValid = false;

        // Comprobamos si la contraseña ya está encriptada con bcrypt (siempre empiezan con $2)
        if (user.contrasena_hash.startsWith('$2a$') || user.contrasena_hash.startsWith('$2b$')) {
            isValid = await bcrypt.compare(password, user.contrasena_hash);
        } else {
            // Es un usuario de tu versión anterior con contraseña en texto plano
            isValid = (password === user.contrasena_hash);
            
            // Si la contraseña es correcta, la encriptamos y la actualizamos automáticamente
            if (isValid) {
                const newHash = await bcrypt.hash(password, 10);
                await db.update(usuarios)
                    .set({ contrasena_hash: newHash })
                    .where(eq(usuarios.id_usuario, user.id_usuario));
            }
        }

        if (!isValid) {
            return fail(401, { error: 'Usuario o contraseña incorrectos.' });
        }

        // 3. Crear la sesión (Cookie segura) por 1 día
        cookies.set('session', user.id_usuario.toString(), {
            path: '/',
            httpOnly: true, // Evita hackeos por JavaScript (XSS)
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 
        });

        // 4. Redirigir al sistema
        throw redirect(303, '/citas');
    }
};