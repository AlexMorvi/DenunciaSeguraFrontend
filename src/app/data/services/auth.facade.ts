import { UsuarioPerfilResponse } from '@/core/api/auth/models/usuario-perfil-response';
import { CuentaService } from '@/core/api/auth/services/cuenta.service';
import { AdminService } from '@/core/api/auth/services/admin.service';
import { RegistroStaffRequest } from '@/core/api/auth/models/registro-staff-request';
import { RegistroUsuarioResponse } from '@/core/api/auth/models/registro-usuario-response';
import { ROL_ENUM } from '@/core/api/auth/models/rol-enum-array';
import { ENTIDAD_ENUM } from '@/core/api/auth/models/entidad-enum-array';
import { Injectable, computed, inject, signal } from '@angular/core';
import { PublicoService } from '@/core/api/auth/services';
import {
    ActualizarAliasRequest,
    AliasResponse,
    AuthResponse,
    LoginRequest,
    PasswordResetRequest,
    RegistroCiudadanoRequest
} from '@/core/api/auth/models';
import { LoggerService } from '@/core/service/logging/logger.service';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
    private accountService = inject(CuentaService);
    private adminService = inject(AdminService);
    private publicoService = inject(PublicoService);
    private readonly logger = inject(LoggerService);
    private readonly _currentUser = signal<UsuarioPerfilResponse | null>(null);
    public readonly currentUser = this._currentUser.asReadonly();
    private _loading = signal(false);
    readonly loading = this._loading.asReadonly();

    // Expose constants for UI consumption
    readonly availableRoles = ROL_ENUM;
    readonly availableEntities = ENTIDAD_ENUM;

    public defaultPath = computed(() => {
        const user = this.currentUser();
        if (!user) return '/login';

        const rol = String(user.rol || '').toLowerCase().replace(/_/g, '-');
        return `/${rol}`;
    });

    public updateAuthState(user: UsuarioPerfilResponse | null): void {
        if (user === null) {
            this._currentUser.set(null);
            this.logger.logInfo('AuthFacade', 'Sesión de usuario limpiada');
            return;
        }

        if (!this.isValidUser(user)) {
            this.logger.logError('AuthFacade', 'Intento de actualizar estado con datos corruptos', {
                receivedData: user
            });
        }

        this._currentUser.set(user);
        this.logger.logInfo('AuthFacade', 'Estado de usuario actualizado', { userId: user.id });
    }

    private isValidUser(user: any): user is UsuarioPerfilResponse {
        return user && typeof user.id === 'number' && user.id > 0;
    }

    // =============================================================================
    // Métodos Públicos (Sin Autenticación)
    // =============================================================================

    async login(request: LoginRequest): Promise<AuthResponse> {
        this._loading.set(true);
        try {
            return await this.publicoService.login({ body: request });
        } finally {
            this._loading.set(false);
        }
    }

    async registerCitizen(request: RegistroCiudadanoRequest): Promise<void> {
        this._loading.set(true);
        try {
            const response = await this.publicoService.registerCitizen({ body: request });
            this.logger.logInfo('RegisterComponent', 'Registro exitoso', { userId: response.id });
        } finally {
            this._loading.set(false);
        }
    }

    async forgotPassword(request: { email: string }): Promise<void> {
        this._loading.set(true);
        try {
            await this.publicoService.forgotPassword({ body: request });
        } finally {
            this._loading.set(false);
        }
    }

    async resetPassword(request: PasswordResetRequest): Promise<void> {
        this._loading.set(true);
        try {
            await this.publicoService.resetPassword({ body: request });
        } finally {
            this._loading.set(false);
        }
    }

    // =============================================================================
    // Métodos Privados (Requieren Autenticación)
    // =============================================================================

    async getMe(): Promise<void> {
        if (this.currentUser()) {
            return;
        }

        try {
            this._loading.set(true);
            const user = await this.accountService.getMe();
            this._currentUser.set(user || null);
        } catch (_err) {
            this._currentUser.set(null);
        } finally {
            this._loading.set(false);
        }
    }

    refreshUser() {
        this._currentUser.set(null);
        return this.getMe();
    }

    registerStaff(request: RegistroStaffRequest): Promise<RegistroUsuarioResponse> {
        return this.adminService.registerStaff({ body: request });
    }

    async updateMyAlias(alias: string): Promise<AliasResponse> {
        const body: ActualizarAliasRequest = { aliasPublico: alias };
        this._loading.set(true);
        try {
            return await this.accountService.updateMyAlias({ body });
        } finally {
            this._loading.set(false);
        }
    }

    async updateCitizenAlias(alias: string): Promise<AliasResponse> {
        // TODO: El endpoint real para actualizar el alias de un ciudadano debe ser implementado.
        const body: ActualizarAliasRequest = { aliasPublico: alias };
        this._loading.set(true);
        try {
            return await this.accountService.updateMyAlias({ body });
        } finally {
            this._loading.set(false);
        }
    }

    // TODO: manejar errores
    async logout(): Promise<void> {
        try {
            await this.accountService.logout();
        } finally {
            this._currentUser.set(null);
        }
    }
}
