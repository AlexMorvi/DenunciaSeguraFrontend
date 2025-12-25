import { UsuarioPerfilResponse } from '@/core/api/auth/models/usuario-perfil-response';
import { CuentaService } from '@/core/api/auth/services/cuenta.service';
import { Injectable, computed, inject, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
    private accountService = inject(CuentaService);
    readonly currentUser = signal<UsuarioPerfilResponse | null>(null);
    readonly loading = signal<boolean>(false);

    readonly defaultPath = computed(() => {
        const user = this.currentUser();

        if (!user || !user.rol) {
            return '/auth';
        }

        switch (user.rol) {
            case 'ADMIN_PLATAFORMA':
                return '/admin';
            case 'CIUDADANO':
                return '/ciudadano';
            default:
                return '/auth';
        }
    });

    async loadUser(): Promise<void> {
        if (this.currentUser()) {
            return;
        }

        try {
            this.loading.set(true);
            const user = await this.accountService.getMe();
            this.currentUser.set(user || null);
        } catch (err) {
            this.currentUser.set(null);
        } finally {
            this.loading.set(false);
        }
    }

    refreshUser() {
        this.currentUser.set(null);
        return this.loadUser();
    }
}
