import { Injectable, inject, signal, computed } from '@angular/core';
import { BuzonService } from '@/app/core/api/notificaciones/services/buzon.service';
import { NotificacionResponse } from '@/app/core/api/notificaciones/models/notificacion-response';

@Injectable({
    providedIn: 'root'
})
export class NotificacionFacade {
    private api = inject(BuzonService);

    // 1. ESTADO INTERNO
    // Solo guardamos la lista de items. El contador se derivará de aquí.
    private _items = signal<NotificacionResponse[]>([]);

    private _loading = signal(false);
    private _error = signal<string | null>(null);

    // 2. SELECTORES PÚBLICOS (Lectura)
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();

    // Exponemos la lista tal cual
    public notificaciones = this._items.asReadonly();

    // ✨ COMPUTED: Aquí está la magia.
    // Angular recalcula esto automáticamente solo cuando _items cambia.
    public noLeidasCount = computed(() =>
        this._items().filter(n => !n.leida).length
    );

    constructor() {
        this.loadNotificaciones();
    }

    async loadNotificaciones() {
        this._loading.set(true);
        try {
            const response = await this.api.meGet();
            // Solo actualizamos los items. El computed se encargará del contador.
            this._items.set(response.items || []);
            this._error.set(null);
        } catch (err: any) {
            this._error.set(err?.message || 'Error al cargar notificaciones');
        } finally {
            this._loading.set(false);
        }
    }

    async marcarComoLeida(id: number) {
        // 1. Actualización Optimista: 
        // Solo buscamos el item y le cambiamos el flag. No tocamos contadores.
        this._items.update(items =>
            items.map(n => n.id === id ? { ...n, leida: true } : n)
        );

        // 2. Llamada al API
        try {
            await this.api.marcarLeida({ id });
        } catch (error) {
            console.error('Error al marcar como leída', error);
            // Rollback: Recargamos la verdad desde el servidor
            this.loadNotificaciones();
        }
    }

    async marcarTodasComoLeidas() {
        // // Verificamos usando el computed
        // if (this.noLeidasCount() === 0) return;

        // // 1. Actualización Optimista Masiva
        // this._items.update(items =>
        //     items.map(n => ({ ...n, leida: true }))
        // );

        // // 2. Llamada al API
        // try {
        //     // IMPORTANTE: Asegúrate de tener este endpoint en tu backend 
        //     // para evitar el problema de N+1 peticiones.
        //     // Si aún no lo tienes, descomenta el bucle Promise.all de abajo bajo tu riesgo.

        //     // Opción A (Recomendada - Backend nuevo):
        //     // await this.api.marcarTodasLeidas(); 

        //     // Opción B (Temporal - Bucle frontend):
        //     const itemsIds = this._items()
        //         .filter(n => n.id != null) // Aseguramos IDs válidos
        //         .map(n => n.id as number);

        //     // Nota: Esto es subóptimo si son muchas, pero funciona si son pocas.
        //     await Promise.all(itemsIds.map(id => this.api.marcarLeida({ id })));

        // } catch (error) {
        //     console.error('Error al marcar todas', error);
        //     this.loadNotificaciones();
        // }
    }
}
