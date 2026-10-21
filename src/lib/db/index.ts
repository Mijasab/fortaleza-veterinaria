import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import * as dotenv from 'dotenv';

// Cargamos las variables del archivo .env manualmente
dotenv.config();

// Crea la conexión segura usando la URL de tu archivo .env
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });