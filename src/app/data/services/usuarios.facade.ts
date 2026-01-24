import { inject, Injectable, signal } from '@angular/core';
import { InternoService } from '@/core/api/usuarios/services/interno.service';
import { PerfilService } from '@/core/api/usuarios/services/perfil.service';
import { UsuarioResponse } from '@/core/api/usuarios/models/usuario-response';
import { CrearCiudadano$Params } from '@/core/api/usuarios/fn/interno/crear-ciudadano';
import { CrearStaff$Params } from '@/core/api/usuarios/fn/interno/crear-staff';
import { ActualizarAlias$Params } from '@/core/api/usuarios/fn/interno/actualizar-alias';

@Injectable({
    providedIn: 'root'
})
export class UsuariosFacade {
    private readonly internoService = inject(InternoService);
    private readonly perfilService = inject(PerfilService);

    // State
    private readonly _currentUser = signal<UsuarioResponse | null>(null);
    private readonly _loading = signal(false);
    private readonly _error = signal<string | null>(null);

    // Selectors
    readonly currentUser = this._currentUser.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();

    async getProfile() {
        this._loading.set(true);
        try {
            // const result = await this.perfilService.obtenerPerfil();

            // TODO: Eliminar usuario quemado y descomentar línea anterior
            const result: UsuarioResponse = {
                id: 1,
                aliasPublico: 'CiudadanoMock',
                cedula: '0999999999',
                email: 'ciudadano@mock.com',
                estado: 'ACTIVO',
                nombre: 'Ciudadano de Prueba',
                rol: 'CIUDADANO',
                publicCitizenId: 'PUB-MOCK-123'
            };

            this._currentUser.set(result);
            this._error.set(null);
            return result;
        } catch (err: any) {
            const msg = err?.message || 'Error al obtener perfil';
            this._error.set(msg);
            throw err;
        } finally {
            this._loading.set(false);
        }
    }

    async getById(id: number) {
        this._loading.set(true);
        try {
            const result = await this.internoService.obtenerUsuario({ id });
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
            const result = await this.internoService.obtenerPorCedula({ cedula });
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

    /**
     * Obtiene un usuario por ID sin afectar el estado global del facade.
     * Útil para consultar datos de ciudadanos en reportes o listados.
     */
    async findUsuarioById(id: number): Promise<UsuarioResponse> {
        return this.internoService.obtenerUsuario({ id });
    }

    async crearCiudadano(params: CrearCiudadano$Params) {
        this._loading.set(true);
        try {
            const result = await this.internoService.crearCiudadano(params);
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
            const result = await this.internoService.crearStaff(params);
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
            const result = await this.internoService.actualizarAlias(params);

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
