import { Injectable, inject, signal, computed } from '@angular/core';
import { BuzonService } from '@/core/api/notificaciones/services/buzon.service';
import { NotificacionResponse } from '@/core/api/notificaciones/models/notificacion-response';

@Injectable({
    providedIn: 'root'
})
export class NotificacionFacade {
    private api = inject(BuzonService);

    private _items = signal<NotificacionResponse[]>([]);
    private _loading = signal(false);
    private _error = signal<string | null>(null);

    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();

    public notificaciones = this._items.asReadonly();

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
            this._items.set(response.items || []);
            this._error.set(null);
        } catch (err: any) {
            this._error.set(err?.message || 'Error al cargar notificaciones');
        } finally {
            this._loading.set(false);
        }
    }

    async marcarComoLeida(id: number) {
        this._items.update(items =>
            items.map(n => n.id === id ? { ...n, leida: true } : n)
        );

        try {
            await this.api.marcarLeida({ id });
        } catch (error) {
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
