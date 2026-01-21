import { Injectable, computed, inject, signal } from '@angular/core';
import { AdminService } from '@/core/api/auth/services/admin.service';
import { PublicoService } from '@/core/api/auth/services/publico.service';
import { InternoService as UsuariosInternoService } from '@/core/api/usuarios/services/interno.service';
import { LoggerService } from '@/core/service/logging/logger.service';

import { RegistroStaffAuthRequest } from '@/core/api/auth/models/registro-staff-auth-request';
import { RegistroCiudadanoAuthRequest } from '@/core/api/auth/models/registro-ciudadano-auth-request';
import { RegistroUsuarioResponse } from '@/core/api/auth/models/registro-usuario-response';
import { PasswordResetRequest } from '@/core/api/auth/models/password-reset-request';
import { PasswordForgotRequest } from '@/core/api/auth/models/password-forgot-request';

import { UsuarioResponse } from '@/core/api/usuarios/models/usuario-response';
import { ROL_ENUM } from '@/core/api/usuarios/models/rol-enum-array';
import { ENTIDAD_ENUM } from '@/core/api/usuarios/models/entidad-enum-array';


@Injectable({ providedIn: 'root' })
export class AuthFacade {
    private readonly adminService = inject(AdminService);
    private readonly publicoService = inject(PublicoService);
    private readonly usuariosInternoService = inject(UsuariosInternoService);
    private readonly logger = inject(LoggerService);

    // TODO: Temporal hardcoded user until backend endpoint is available
    // private readonly _currentUser = signal<UsuarioResponse | null>({
    //     id: 1,
    //     nombre: 'Usuario Temporal',
    //     email: 'temporal@example.com',
    //     rol: 'CIUDADANO',
    //     // rol: 'ADMIN',
    //     // rol: 'SUPERVISOR',
    //     // rol: 'JEFE_OP_EXT',
    //     // rol: 'OPERADOR_INTERNO',
    //     aliasPublico: undefined,
    //     publicCitizenId: 'temp-0001',

    // });

    private readonly _currentUser = signal<UsuarioResponse | null>(null);
    public readonly currentUser = this._currentUser.asReadonly();

    private readonly _loading = signal(false);
    readonly loading = this._loading.asReadonly();

    // Expose constants for UI consumption
    readonly availableRoles = ROL_ENUM;
    // readonly availableEntities = ENTIDAD_ENUM;
    private readonly _entities = signal(ENTIDAD_ENUM);
    readonly uiEntities = computed(() => {
        return this._entities().map((entity) => ({
            code: entity,
            label: this.formatLabel(entity),
        }));
    });

    public defaultPath = computed(() => {
        const user = this.currentUser();
        if (!user) return '/login';

        const rol = String(user.rol || '')
            .toLowerCase()
            .replaceAll('_', '-');
        return `/${rol}`;
    });

    public updateAuthState(user: UsuarioResponse | null): void {
        if (user === null) {
            this._currentUser.set(null);
            this.logger.logInfo('AuthFacade', 'Sesión de usuario limpiada');
            return;
        }

        if (!this.isValidUser(user)) {
            this.logger.logError('AuthFacade', 'Intento de actualizar estado con datos corruptos', {
                receivedData: user,
            });
        }

        this._currentUser.set(user);
        this.logger.logInfo('AuthFacade', 'Estado de usuario actualizado', { userId: user.id });
    }

    private isValidUser(user: any): user is UsuarioResponse {
        return user && typeof user.id === 'number' && user.id > 0;
    }

    // =============================================================================
    // Métodos Públicos (Sin Autenticación)
    // =============================================================================

    // async login(request: LoginRequest): Promise<AuthResponse> {
    //     this._loading.set(true);
    //     try {
    //         return await this.publicoService.login({ body: request });
    //     } finally {
    //         this._loading.set(false);
    //     }
    // }

    async registerCitizen(request: RegistroCiudadanoAuthRequest): Promise<void> {
        this._loading.set(true);
        try {
            const response = await this.publicoService.registrarCiudadano({ body: request });
            this.logger.logInfo('RegisterComponent', 'Registro exitoso', { userId: response.id });
        } finally {
            this._loading.set(false);
        }
    }

    async forgotPassword(cedula: string): Promise<void> {
        this._loading.set(true);
        try {
            const body: PasswordForgotRequest = { cedula };
            await this.publicoService.forgot({ body });
        } finally {
            this._loading.set(false);
        }
    }

    async resetPassword(request: PasswordResetRequest): Promise<void> {
        this._loading.set(true);
        try {
            await this.publicoService.reset({ body: request });
        } finally {
            this._loading.set(false);
        }
    }

    // =============================================================================
    // Métodos Privados (Requieren Autenticación)
    // =============================================================================

    /* public setMockUser(): void {
         this.updateAuthState({
            id: 1,
            nombre: 'Usuario Temporal',
            email: 'temporal@example.com',
            rol: 'CIUDADANO' as RolEnum,
            aliasPublico: null,
            publicCitizenId: 'temp-0001',
        });
    } */

    /* async getMe(): Promise<void> {
        if (this.currentUser()) {
            return;
        }
        // ... (Not implemented due to missing model)
    } */

    async registerStaff(request: RegistroStaffAuthRequest): Promise<RegistroUsuarioResponse> {
        return await this.adminService.registrarStaff({ body: request });
    }

    async logout(): Promise<void> {
        try {
            // await firstValueFrom(logout(this.http, this.config.rootUrl));
            // For now just clear local state since logout endpoint is missing/not implemented in facade via service
        } finally {
            this._currentUser.set(null);
        }
    }

    private formatLabel(raw: string): string {
        return raw
            .replaceAll('_', ' ')
            .toLowerCase()
            .replaceAll(/\b\w/g, (l) => l.toUpperCase());
    }
}
