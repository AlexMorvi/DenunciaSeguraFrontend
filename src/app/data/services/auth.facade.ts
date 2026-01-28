import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';
import { AdminService } from '@/core/api/auth/services/admin.service';
import { PublicoService } from '@/core/api/auth/services/publico.service';
import { InternoService as UsuariosInternoService } from '@/core/api/usuarios/services/interno.service';

import { RegistroStaffAuthRequest } from '@/core/api/auth/models/registro-staff-auth-request';
import { RegistroCiudadanoAuthRequest } from '@/core/api/auth/models/registro-ciudadano-auth-request';
import { RegistroUsuarioResponse } from '@/core/api/auth/models/registro-usuario-response';
import { PasswordResetRequest } from '@/core/api/auth/models/password-reset-request';
import { PasswordForgotRequest } from '@/core/api/auth/models/password-forgot-request';
import { PasswordResetResponse } from '@/core/api/auth/models/password-reset-response';

import { UsuarioResponse } from '@/core/api/usuarios/models/usuario-response';
import { ROL_ENUM } from '@/core/api/usuarios/models/rol-enum-array';
import { ENTIDAD_ENUM } from '@/core/api/usuarios/models/entidad-enum-array';


@Injectable({ providedIn: 'root' })
export class AuthFacade {
    private readonly adminService = inject(AdminService);
    private readonly publicoService = inject(PublicoService);
    private readonly usuariosInternoService = inject(UsuariosInternoService);
    private readonly http = inject(HttpClient);
    private readonly oauthService = inject(OAuthService);

    private readonly _currentUser = signal<UsuarioResponse | null>(null);
    public readonly currentUser = this._currentUser.asReadonly();

    private readonly _loading = signal(false);
    readonly loading = this._loading.asReadonly();

    readonly availableRoles = ROL_ENUM;
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
            return;
        }
        this._currentUser.set(user);
    }

    private isValidUser(user: any): user is UsuarioResponse {
        return user && typeof user.id === 'number' && user.id > 0;
    }

    // =============================================================================
    // Métodos Públicos (Sin Autenticación)
    // =============================================================================

    async registerCitizen(request: RegistroCiudadanoAuthRequest): Promise<RegistroUsuarioResponse> {
        this._loading.set(true);
        try {
            return await this.publicoService.registrarCiudadano({ body: request });
        } finally {
            this._loading.set(false);
        }
    }

    async forgotPassword(cedula: string): Promise<PasswordResetResponse> {
        this._loading.set(true);
        try {
            const body: PasswordForgotRequest = { cedula };
            return await this.publicoService.forgot({ body });
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

    async registerStaff(request: RegistroStaffAuthRequest): Promise<RegistroUsuarioResponse> {
        return await this.adminService.registrarStaff({ body: request });
    }

    async logout(): Promise<void> {
        const refreshToken = this.oauthService.getRefreshToken() || null;

        try {
            await firstValueFrom(this.http.post(
                `${environment.apiUrl}/auth/logout`,
                { refreshToken },
                {
                    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
                    withCredentials: true
                }
            ));
        } catch {
            // Ignorar errores de logout para no bloquear la salida
        } finally {
            // Limpieza local: tokens y estado de usuario
            this.oauthService.logOut(true); // true => sin redirigir al end_session
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
