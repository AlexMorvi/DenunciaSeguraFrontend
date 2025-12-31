import { UsuarioPerfilResponse } from '@/core/api/auth/models/usuario-perfil-response';
import { CuentaService } from '@/core/api/auth/services/cuenta.service';
import { AdminService } from '@/core/api/auth/services/admin.service';
import { RegistroStaffRequest } from '@/core/api/auth/models/registro-staff-request';
import { RegistroUsuarioResponse } from '@/core/api/auth/models/registro-usuario-response';
import { ROL_ENUM } from '@/core/api/auth/models/rol-enum-array';
import { ENTIDAD_ENUM } from '@/core/api/auth/models/entidad-enum-array';
import { Injectable, computed, inject, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
    private accountService = inject(CuentaService);
    private adminService = inject(AdminService);
    readonly currentUser = signal<UsuarioPerfilResponse | null>(null);
    readonly loading = signal<boolean>(false);

    // Expose constants for UI consumption
    readonly availableRoles = ROL_ENUM;
    readonly availableEntities = ENTIDAD_ENUM;

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

    async getMe(): Promise<void> {
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
        return this.getMe();
    }

    registerStaff(request: RegistroStaffRequest): Promise<RegistroUsuarioResponse> {
        return this.adminService.registerStaff({ body: request });
    }
}
