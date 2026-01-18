import { computed, inject, Injectable, signal } from '@angular/core';
import { ApiService } from '@/core/api/usuarios/services/api.service';
import { UsuarioResponse } from '@/core/api/usuarios/models/usuario-response';
import { CrearCiudadano$Params } from '@/core/api/usuarios/fn/operations/crear-ciudadano';
import { CrearStaff$Params } from '@/core/api/usuarios/fn/operations/crear-staff';
import { ActualizarAlias$Params } from '@/core/api/usuarios/fn/operations/actualizar-alias';

@Injectable({
    providedIn: 'root'
})
export class UsuariosFacade {
    private readonly api = inject(ApiService);

    // State
    private readonly _currentUser = signal<UsuarioResponse | null>(null);
    private readonly _loading = signal(false);
    private readonly _error = signal<string | null>(null);

    // Selectors
    readonly currentUser = this._currentUser.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();

    async getById(id: number) {
        this._loading.set(true);
        try {
            const result = await this.api.obtenerUsuario({ id });
            this._currentUser.set(result);
            this._error.set(null);
            return result;
        } catch (err: any) {
            const msg = err?.message || 'Error al obtener usuario';
            this._error.set(msg);
            throw err;
        } finally {
            this._loading.set(false);
        }
    }

    async getByCedula(cedula: string) {
        this._loading.set(true);
        try {
            const result = await this.api.obtenerPorCedula({ cedula });
            this._currentUser.set(result);
            this._error.set(null);
            return result;
        } catch (err: any) {
            const msg = err?.message || 'Error al buscar usuario por cédula';
            this._error.set(msg);
            throw err;
        } finally {
            this._loading.set(false);
        }
    }

    async crearCiudadano(params: CrearCiudadano$Params) {
        this._loading.set(true);
        try {
            const result = await this.api.crearCiudadano(params);
            this._currentUser.set(result);
            this._error.set(null);
            return result;
        } catch (err: any) {
            const msg = err?.message || 'Error al crear ciudadano';
            this._error.set(msg);
            throw err;
        } finally {
            this._loading.set(false);
        }
    }

    async crearStaff(params: CrearStaff$Params) {
        this._loading.set(true);
        try {
            const result = await this.api.crearStaff(params);
            // No seteamos currentUser porque usualmente esto lo hace un admin para otro usuario
            this._error.set(null);
            return result;
        } catch (err: any) {
            const msg = err?.message || 'Error al crear staff';
            this._error.set(msg);
            throw err;
        } finally {
            this._loading.set(false);
        }
    }

    async updateAlias(params: ActualizarAlias$Params) {
        this._loading.set(true);
        try {
            const result = await this.api.actualizarAlias(params);

            this._currentUser.update(user => {
                if (user && user.id === params.id) {
                    return { ...user, aliasPublico: result.aliasPublico };
                }
                return user;
            });

            this._error.set(null);
            return result;
        } catch (err: any) {
            const msg = err?.message || 'Error al actualizar alias';
            this._error.set(msg);
            throw err;
        } finally {
            this._loading.set(false);
        }
    }
}
