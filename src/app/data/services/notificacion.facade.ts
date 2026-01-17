import { computed, Injectable, inject, signal } from '@angular/core';
import type { NotificacionResponse } from '@/core/api/notificaciones/models/notificacion-response';
import { BuzonService } from '@/core/api/notificaciones/services/buzon.service';

@Injectable({
    providedIn: 'root'
})
export class NotificacionFacade {
    private readonly api = inject(BuzonService);

    private readonly _items = signal<NotificacionResponse[]>([]);
    private readonly _loading = signal(false);
    private readonly _error = signal<string | null>(null);

    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();

    public notificaciones = this._items.asReadonly();

    public noLeidasCount = computed(() =>
        this._items().filter(n => !n.leida).length
    );

    async getAll(force = false) {
        if (this._items().length > 0 && !force) {
            return;
        }

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
        } catch {
            this.getAll();
        }
    }

    async marcarTodasComoLeidas() {
        // // Verificamos usando el computed
    }
}
