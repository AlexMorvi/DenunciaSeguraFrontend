import { Injectable, inject, signal } from '@angular/core';
import { InternoService } from '@/core/api/usuarios/services/interno.service';
import { UsuarioResponse } from '@/core/api/usuarios/models/usuario-response';
import { LoggerService } from '@/core/service/logging/logger.service';
import { EntidadResponsableEnum } from '@/core/api/denuncias/models/entidad-responsable-enum';
import { EntidadEnum } from '@/core/api/usuarios/models/entidad-enum';

@Injectable({
    providedIn: 'root'
})
export class StaffFacade {
    private readonly internoService = inject(InternoService);
    private readonly logger = inject(LoggerService);

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
    async loadOperadoresPorEntidad(entidad: EntidadResponsableEnum): Promise<void> {
        this._loading.set(true);
        try {
            // Cast necesario ya que son enums generados en distintos contextos pero con mismos valores
            const entidadUsuario = entidad as unknown as EntidadEnum;
            const data = await this.internoService.usuarioInternoObtenerOperadoresPorEntidad({ entidad: entidadUsuario });
            this._operadores.set(data);
        } catch (error) {
            this.logger.logError('StaffFacade: Error cargando operadores', error);
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
        } catch (error) {
            this.logger.logError('StaffFacade: Error cargando jefe', error);
            this._jefe.set(null);
        } finally {
            this._loading.set(false);
        }
    }
}
