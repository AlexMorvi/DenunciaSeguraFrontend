import { Injectable, inject, signal } from '@angular/core';
import { InternoService } from '@/core/api/usuarios/services/interno.service';
import { AdminService } from '@/core/api/usuarios/services/admin.service';
import { UsuarioResponse } from '@/core/api/usuarios/models/usuario-response';
import { EntidadResponsableEnum } from '@/core/api/denuncias/models/entidad-responsable-enum';
import { EntidadEnum } from '@/core/api/usuarios/models/entidad-enum';

@Injectable({
    providedIn: 'root'
})
export class StaffFacade {
    private readonly internoService = inject(InternoService);
    private readonly adminService = inject(AdminService);

    private readonly _loading = signal(false);
    readonly loading = this._loading.asReadonly();

    private readonly _operadores = signal<UsuarioResponse[]>([]);
    readonly operadores = this._operadores.asReadonly();

    private readonly _jefe = signal<UsuarioResponse | null>(null);
    readonly jefe = this._jefe.asReadonly();

    /**
     * Carga la lista de operadores asociados a una entidad específica.
     * @param entidad La entidad responsable.
     */
    async loadOperadoresPorEntidadInterno(entidad: EntidadResponsableEnum): Promise<void> {
        this._loading.set(true);
        try {
            // Cast necesario ya que son enums generados en distintos contextos pero con mismos valores
            const entidadUsuario = entidad as unknown as EntidadEnum;
            const data = await this.internoService.usuarioInternoObtenerOperadoresPorEntidad({ entidad: entidadUsuario });
            this._operadores.set(data);
        } catch {
            this._operadores.set([]);
        } finally {
            this._loading.set(false);
        }
    }

    /**
     * Carga el jefe asignado a una entidad específica.
     * @param entidad La entidad responsable.
     */
    async loadJefePorEntidad(entidad: EntidadResponsableEnum): Promise<void> {
        this._loading.set(true);
        try {
            const entidadUsuario = entidad as unknown as EntidadEnum;
            const data = await this.internoService.usuarioInternoObtenerJefePorEntidad({ entidad: entidadUsuario });
            this._jefe.set(data);
        } catch {
            this._jefe.set(null);
        } finally {
            this._loading.set(false);
        }
    }

    /**
     * Carga la lista de operadores asociados a una entidad específica (Admin).
     * @param entidad La entidad responsable.
     */
    async loadOperadoresPorEntidadExterno(entidad: EntidadResponsableEnum): Promise<void> {
        this._loading.set(true);
        try {
            const entidadUsuario = entidad as unknown as EntidadEnum;
            const data = await this.adminService.usuarioAdminObtenerOperadoresPorEntidad({ entidad: entidadUsuario });
            this._operadores.set(data);
        } catch {
            this._operadores.set([]);
        } finally {
            this._loading.set(false);
        }
    }

    /**
     * Carga el jefe asignado a una entidad específica (Admin).
     * @param entidad La entidad responsable.
     */
    async loadJefePorEntidadAdmin(entidad: EntidadResponsableEnum): Promise<void> {
        this._loading.set(true);
        try {
            const entidadUsuario = entidad as unknown as EntidadEnum;
            const data = await this.adminService.usuarioAdminObtenerJefePorEntidad({ entidad: entidadUsuario });
            this._jefe.set(data);
        } catch {
            this._jefe.set(null);
        } finally {
            this._loading.set(false);
        }
    }

    /**
     * Carga todos los operadores (Interno + Externo/Admin) para una entidad,
     * combinando resultados y eliminando duplicados.
     * @param entidad La entidad responsable.
     */
    async loadAllOperadoresPorEntidad(entidad: EntidadResponsableEnum): Promise<void> {
        this._loading.set(true);
        try {
            const entidadUsuario = entidad as unknown as EntidadEnum;

            const [interno, admin] = await Promise.all([
                this.internoService.usuarioInternoObtenerOperadoresPorEntidad({ entidad: entidadUsuario })
                    .catch(() => {
                        return [] as UsuarioResponse[];
                    }),
                this.adminService.usuarioAdminObtenerOperadoresPorEntidad({ entidad: entidadUsuario })
                    .catch(() => {
                        return [] as UsuarioResponse[];
                    })
            ]);

            const todos = [...interno, ...admin];

            // Eliminar duplicados por ID
            const unicos = Array.from(new Map(todos.map(op => [op.id, op])).values());

            this._operadores.set(unicos);
        } catch {
            this._operadores.set([]);
        } finally {
            this._loading.set(false);
        }
    }
}
