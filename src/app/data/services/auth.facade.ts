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
    AuthResponse,
    LoginRequest,
    PasswordResetRequest,
    RegistroCiudadanoRequest,
} from '@/core/api/auth/models';
import { LoggerService } from '@/core/service/logging/logger.service';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
    private readonly accountService = inject(CuentaService);
    private readonly adminService = inject(AdminService);
    private readonly publicoService = inject(PublicoService);
    private readonly logger = inject(LoggerService);
    // private readonly _currentUser = signal<UsuarioPerfilResponse | null>(null);
    // TODO: Temporal hardcoded user until backend endpoint is available
    private readonly _currentUser = signal<UsuarioPerfilResponse | null>({
        id: 1,
        nombre: 'Usuario Temporal',
        email: 'temporal@example.com',
        rol: 'CIUDADANO',
        // rol: 'ADMIN_PLATAFORMA',
        // rol: 'SUPERVISOR_DENUNCIAS',
        // rol: 'JEFE_INTERNO',
        // rol: 'OPERADOR_INTERNO',
        aliasPublico: null,
        publicCitizenId: 'temp-0001',
    });
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

    public updateAuthState(user: UsuarioPerfilResponse | null): void {
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
        } catch {
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

    async updateMyAlias(alias: string): Promise<void> {
        const body: ActualizarAliasRequest = { aliasPublico: alias };
        this._loading.set(true);

        try {
            await this.accountService.updateMyAlias({ body });
            this._currentUser.update((currentUser) => {
                if (!currentUser) return null;
                return {
                    ...currentUser,
                    aliasPublico: alias,
                };
            });
        } finally {
            this._loading.set(false);
        }
    }
    async updateCitizenAlias(alias: string): Promise<void> {
        const body: ActualizarAliasRequest = { aliasPublico: alias };
        this._loading.set(true);

        try {
            await this.accountService.updateMyAlias({ body });
            this._currentUser.update((currentUser) => {
                if (!currentUser) return null;
                return {
                    ...currentUser,
                    publicCitizenId: alias,
                };
            });
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

    private formatLabel(raw: string): string {
        return raw
            .replaceAll('_', ' ')
            .toLowerCase()
            .replaceAll(/\b\w/g, (l) => l.toUpperCase());
    }
}
