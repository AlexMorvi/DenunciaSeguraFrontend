import { Component, inject, computed, input, effect, untracked, ChangeDetectionStrategy, numberAttribute } from '@angular/core';
import { DenunciaLayoutComponent } from '@/core/layout/denuncia-layout/denuncia-layout.component';
import { ROLES } from '@/shared/constants/roles.const';
import { DenunciaDetailsComponent } from '../ui/denuncia-details/denuncia-details.component';
import { ActionsSupervisorComponent } from '../ui/action-supervisor/actions-supervisor.component';
import { ActionsOperadorComponent } from '../ui/action-operador/actions-operador.component';
import { ActionsJefeComponent } from '../ui/action-jefe/actions-jefe.component';
import { DenunciaFacade } from '@/data/services/denuncia.facade';
import { AuthFacade } from '@/data/services/auth.facade';
import { Router } from '@angular/router';
import { ToastService } from '@/core/service/toast/toast.service';
import { FileUploadService } from '@/core/service/file-upload.service';
import { SkeletonLoaderComponent } from '@/shared/components/skeleton-loader/skeleton-loader';
import { DenunciaHistoryComponent } from '../ui/denuncia-history/denuncia-history.component';

@Component({
    selector: 'app-denuncia-page',
    standalone: true,
    imports: [DenunciaLayoutComponent, SkeletonLoaderComponent, DenunciaDetailsComponent, ActionsSupervisorComponent, ActionsJefeComponent, ActionsOperadorComponent, DenunciaHistoryComponent],
    templateUrl: './denuncia.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DenunciaPageComponent {
    denunciaService = inject(DenunciaFacade);
    authService = inject(AuthFacade);
    private readonly toast = inject(ToastService);
    private readonly fileService = inject(FileUploadService);
    private readonly router = inject(Router);

    public currentUser = this.authService.currentUser;
    public denuncia = this.denunciaService.currentDenuncia;
    public historialEstados = this.denunciaService.historialEstados;
    protected readonly isLoading = this.denunciaService.loading;

    id = input(undefined, { transform: numberAttribute });

    constructor() {
        effect(() => {
            const currentId = this.id();
            if (currentId) {
                untracked(() => {
                    this.denunciaService.obtenerDenunciaPorId(currentId);
                    this.denunciaService.obtenerHistorialEstados(currentId);
                });
            }
        });
    }

    isJefe = computed(() => {
        const rol = this.currentUser()?.rol;
        return [ROLES.JEFE_INTERNO, ROLES.JEFE_EXTERNO].includes(rol as any);
    });

    isSupervisor = computed(() => {
        return this.currentUser()?.rol === ROLES.SUPERVISOR;
    });

    isOperador = computed(() => {
        const rol = this.currentUser()?.rol;
        return [ROLES.OPERADOR_INTERNO, ROLES.OPERADOR_EXTERNO].includes(rol as any);
    });

    isCiudadano = computed(() => {
        const rol = this.currentUser()?.rol;
        return [ROLES.CIUDADANO].includes(rol as any);
    });

    showActionsPanel = computed(() => {
        const denuncia = this.denuncia();

        if (this.isSupervisor()) {
            return false;
        }

        if (denuncia?.estadoDenuncia === 'RESUELTA') {
            return false;
        }

        if (denuncia?.estadoDenuncia === 'ASIGNADA' && this.isJefe()) {
            return false;
        }

        if (denuncia?.estadoDenuncia === 'EN_PROCESO' && this.isJefe()) {
            return false;
        }

        if (denuncia?.estadoDenuncia === 'EN_VALIDACION' && this.isOperador()) {
            return false;
        }

        return this.isJefe() || this.isOperador();
    });

    uploadEvidenceStrategy = (file: File): Promise<string> => {
        return this.fileService.subirEvidencia(file);
    }

    async resolverDenunciaPorOperador(payload: { idDenuncia: number; comentario: string; evidenciasIds: string[] }) {
        try {
            await this.denunciaService.resolverDenunciaPorOperador(
                payload.idDenuncia,
                payload.comentario,
                payload.evidenciasIds
            );
            this.toast.showSuccess('Éxito', 'Denuncia resuelta correctamente');
            await this.router.navigate(['/dashboard']);
        } catch (error: any) {
            this.toast.showError(error.message || 'No se pudo resolver la denuncia. Intente nuevamente.');
        }
    }

    async iniciarDenunciaPorOperador(payload: { idDenuncia: number }) {
        try {
            await this.denunciaService.iniciarDenunciaPorOperador(
                payload.idDenuncia
            );
            this.toast.showSuccess('Éxito', 'Denuncia iniciada correctamente');
            // await this.denunciaService.obtenerDenunciaPorId(payload.idDenuncia);
            await this.router.navigate(['/dashboard']);
        } catch (error: any) {
            this.toast.showError(error.message || 'No se pudo iniciar la denuncia. Intente nuevamente.');
        }
    }

    async asignarOperadorPorJefe(payload: { idOperador: number }) {
        try {
            await this.denunciaService.asignarOperadorPorJefe(
                payload.idOperador
            );
            this.toast.showSuccess('Éxito', 'Denuncia iniciada correctamente');
            await this.router.navigate(['/dashboard']);
        } catch (error: any) {
            this.toast.showError(error.message || 'No se pudo asignar el operador. Intente nuevamente.');
        }
    }

    async asignarJefePorSupervisor(payload: { idDenuncia: number, entidadId: number }) {
        try {
            await this.denunciaService.asignarJefePorSupervisor(
                payload.idDenuncia,
                payload.entidadId
            );

            await this.router.navigate(['/dashboard']);
            this.toast.showSuccess('Éxito', 'Denuncia asignada a entidad correctamente');
        } catch (error: any) {
            this.toast.showError(error.message || 'No se pudo asignar la entidad. Intente nuevamente.');
        }
    }

    async validarDenunciaPorJefe(payload: { aprobada: boolean, comentarioObservacion: string }) {
        try {
            if (payload.aprobada) {
                await this.denunciaService.validarDenunciaPorSupervisor(payload.aprobada, payload.comentarioObservacion);
                this.toast.showSuccess('Éxito', 'Denuncia validada correctamente');
            } else {
                await this.denunciaService.validarDenunciaPorSupervisor(payload.aprobada, payload.comentarioObservacion);
                this.toast.showSuccess('Éxito', 'Denuncia rechazada correctamente');
            }
            await this.router.navigate(['/dashboard']);
        } catch (error: any) {
            this.toast.showError(error.message || 'No se pudo procesar la denuncia. Intente nuevamente.');
        }
    }
}

