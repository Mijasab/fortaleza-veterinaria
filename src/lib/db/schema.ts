import { pgTable, serial, varchar, boolean, integer, date, time, text } from 'drizzle-orm/pg-core';

// Entidad: Usuario
export const usuarios = pgTable('usuario', {
    id_usuario: serial('id_usuario').primaryKey(),
    nombre_usuario: varchar('nombre_usuario', { length: 255 }).notNull().unique(),
    contrasena_hash: varchar('contrasena_hash', { length: 255 }).notNull(),
    estado_cuenta: boolean('estado_cuenta').default(true).notNull(),
});

// Entidad: Propietario
export const propietarios = pgTable('propietario', {
    id_propietario: serial('id_propietario').primaryKey(),
    nombre_completo: varchar('nombre_completo', { length: 255 }).notNull(),
    telefono: varchar('telefono', { length: 20 }).notNull(),
});

// NUEVA Entidad: Mascota
export const mascotas = pgTable('mascota', {
    id_mascota: serial('id_mascota').primaryKey(),
    nombre: varchar('nombre', { length: 255 }).notNull(),
    especie: varchar('especie', { length: 100 }).notNull(),
    raza: varchar('raza', { length: 100 }).notNull(),
    id_propietario: integer('id_propietario').references(() => propietarios.id_propietario).notNull(),
});

// Entidad 4: Cita (Módulo 4)
export const citas = pgTable('cita', {
    id_cita: serial('id_cita').primaryKey(),
    // Usamos date() y time() de drizzle
    fecha: date('fecha').notNull(),
    hora: time('hora').notNull(),
    estado: varchar('estado', { length: 50 }).notNull(),
    motivo: varchar('motivo', { length: 255 }).notNull(),
    id_mascota: integer('id_mascota').references(() => mascotas.id_mascota).notNull(),
});

// NUEVA Entidad 5: Historial Clínico (Unifica Consulta y Atención Médica)
export const historial_clinico = pgTable('historial_clinico', {
    id_registro: serial('id_registro').primaryKey(),
    id_mascota: integer('id_mascota').references(() => mascotas.id_mascota).notNull(),
    fecha: date('fecha').notNull(),
    tipo_registro: varchar('tipo_registro', { length: 50 }).notNull(), // Ej: "Consulta", "Vacuna", "Examen de laboratorio"
    resumen: varchar('resumen', { length: 255 }).notNull(), // Guarda el "Motivo" o el "Tipo de atención"
    
    // Campos grandes tipo Textarea (pueden ser nulos dependiendo si es Consulta o Atención)
    evaluacion: text('evaluacion'), 
    observaciones: text('observaciones'), // Se usa también para la "Información de la atención"
    tratamiento: text('tratamiento')
});

export const servicios = pgTable('servicio', {
    id_servicio: serial('id_servicio').primaryKey(),
    nombre: varchar('nombre', { length: 255 }).notNull(),
    tipo: varchar('tipo', { length: 100 }).notNull(), // Ej: Veterinario, Grooming
    precio: varchar('precio', { length: 50 }).notNull(), // O decimal/numeric si prefieres, varchar es seguro para formato moneda
    estado: varchar('estado', { length: 20 }).default('Activo').notNull() // Activo / Inactivo
});

export const servicios_realizados = pgTable('servicio_realizado', {
    id_servicio_realizado: serial('id_servicio_realizado').primaryKey(),
    id_mascota: integer('id_mascota').references(() => mascotas.id_mascota).notNull(),
    id_servicio: integer('id_servicio').references(() => servicios.id_servicio).notNull(),
    fecha: date('fecha').notNull(),
    informacion_adicional: text('informacion_adicional')
});

// Entidad 7: Productos (Inventario)
export const productos = pgTable('producto', {
    id_producto: serial('id_producto').primaryKey(),
    nombre: varchar('nombre', { length: 255 }).notNull(),
    categoria: varchar('categoria', { length: 100 }).notNull(), // Ej: Alimento, Juguete, Medicamento
    precio: varchar('precio', { length: 50 }).notNull(),
    existencia: integer('existencia').default(0).notNull()
});

// Entidad 8: Ventas y Facturación
export const ventas = pgTable('venta', {
    id_venta: serial('id_venta').primaryKey(),
    id_propietario: integer('id_propietario').references(() => propietarios.id_propietario).notNull(),
    fecha: date('fecha').notNull(),
    total: varchar('total', { length: 50 }).notNull() // Guardamos el importe total
});

export const detalles_venta = pgTable('detalle_venta', {
    id_detalle: serial('id_detalle').primaryKey(),
    id_venta: integer('id_venta').references(() => ventas.id_venta).notNull(),
    tipo_elemento: varchar('tipo_elemento', { length: 50 }).notNull(), // 'Producto' o 'Servicio'
    id_producto: integer('id_producto').references(() => productos.id_producto), // Nullable si es un servicio
    id_servicio: integer('id_servicio').references(() => servicios.id_servicio), // Nullable si es un producto
    nombre_elemento: varchar('nombre_elemento', { length: 255 }).notNull(), // Histórico por si cambia el nombre
    cantidad: integer('cantidad').notNull(),
    precio_unitario: varchar('precio_unitario', { length: 50 }).notNull(),
    subtotal: varchar('subtotal', { length: 50 }).notNull()
});

// Entidad 9: Facturación
export const facturas = pgTable('factura', {
    id_factura: serial('id_factura').primaryKey(),
    id_venta: integer('id_venta').references(() => ventas.id_venta).notNull().unique(), // Una factura pertenece a una sola venta
    fecha_emision: date('fecha_emision').notNull(),
    numero_factura: varchar('numero_factura', { length: 50 }).notNull().unique() // Ej. F-0001
});