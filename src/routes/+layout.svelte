<script lang="ts">
    import { page } from '$app/state';
    let { children } = $props();
</script>

<style>
    /* Estilos globales básicos para resetear márgenes */
    :global(body) { margin: 0; font-family: sans-serif; background-color: #f3f4f6; }
    .nav-link { display: block; padding: 0.75rem 1rem; color: #1e3a8a; text-decoration: none; border-radius: 4px; margin-bottom: 0.25rem; }
    .nav-link:hover { background-color: #e0e7ff; }
    .nav-link.active { background-color: #e0e7ff; font-weight: bold; }
</style>

{#if page.url.pathname === '/login' || page.url.pathname === '/'}
    <!-- Si estamos en el login, mostramos la página sin el menú -->
    {@render children()}
{:else}
    <!-- Estructura del sistema principal -->
    <div style="display: flex; flex-direction: column; min-height: 100vh;">
        
        <!-- Barra Superior Azul -->
        <header style="background-color: #1e3a8a; color: white; padding: 1rem 2rem;">
            <h1 style="margin: 0; font-size: 1.2rem;">Fortaleza Veterinaria: sistema web de gestión</h1>
        </header>

        <div style="display: flex; flex: 1;">
            <!-- Menú Lateral (Dashboard) -->
            <aside style="width: 250px; background-color: white; border-right: 1px solid #d1d5db; padding: 1rem;">
                <nav>
                    <a href="/propietarios" class="nav-link {page.url.pathname.includes('/propietarios') ? 'active' : ''}">Propietarios</a>
                    <a href="/mascotas" class="nav-link {page.url.pathname.includes('/mascotas') ? 'active' : ''}">Mascotas</a>
                    <a href="/citas" class="nav-link {page.url.pathname.includes('/citas') ? 'active' : ''}">Citas</a>
                    <a href="/historial-clinico" class="nav-link {page.url.pathname.includes('/historial-clinico') ? 'active' : ''}">Historial clínico</a>
                    <a href="/servicios" class="nav-link {page.url.pathname.includes('/servicios') ? 'active' : ''}">Servicios</a>
                    <a href="/productos" class="nav-link {page.url.pathname.includes('/productos') ? 'active' : ''}">Productos e inventario</a>
                    <a href="/ventas" class="nav-link {page.url.pathname.includes('/ventas') ? 'active' : ''}">Ventas</a>
                    <a href="/facturacion" class="nav-link {page.url.pathname.includes('/facturacion') ? 'active' : ''}">Facturación</a>
                    <a href="/reportes" class="nav-link {page.url.pathname.includes('/reportes') ? 'active' : ''}">Reportes</a>
                    <!-- NUEVO: Botón de Cerrar Sesión anclado abajo -->
            <div style="margin-top: auto; padding: 1.5rem 1rem; border-top: 1px solid #e5e7eb;">
                <form action="/logout" method="POST">
                    <button type="submit" style="width: 100%; background-color: transparent; border: 1px solid #ef4444; color: #ef4444; padding: 0.5rem 1rem; border-radius: 4px; font-weight: 500; cursor: pointer; transition: all 0.2s ease;">
                        Cerrar sesión
                    </button>
                </form>
            </div>
                </nav>
            </aside>

            <!-- Contenido Principal -->
            <main style="flex: 1;">
                {@render children()}
            </main>
        </div>

        
    </div>
{/if}