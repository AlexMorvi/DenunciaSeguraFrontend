import { Component, inject, computed, input, effect, untracked, ChangeDetectionStrategy } from '@angular/core';
// import { DenunciaStaffViewResponse } from '@/core/api/denuncias/models/denuncia-staff-view-response';
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
import { EvidenceFacade } from '@/data/services/evidence.facade';

@Component({
    selector: 'app-denuncia-page',
    standalone: true,
    imports: [DenunciaLayoutComponent, SkeletonLoaderComponent, DenunciaDetailsComponent, ActionsSupervisorComponent, ActionsJefeComponent, ActionsOperadorComponent],
    templateUrl: './denuncia.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DenunciaPageComponent {
    denunciaService = inject(DenunciaFacade);
    evidenciaService = inject(EvidenceFacade);
    authService = inject(AuthFacade);
    private toast = inject(ToastService);
    private fileService = inject(FileUploadService);
    private router = inject(Router);

    public currentUser = this.authService.currentUser;
    public denuncia = this.denunciaService.currentDenuncia;
    protected readonly isLoading = this.denunciaService.loading;

    id = input<number>();

    constructor() {
        effect(() => {
            // TODO: Validar el formato del id 
            const currentId = this.id();
            if (currentId) {
                untracked(() => {
                    this.denunciaService.loadById(currentId);
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

    public readonly resolveUrlFn = async (evidenceId: string): Promise<string | undefined> => {
        try {
            const response = await this.evidenciaService.getSignedUrl(evidenceId);
            return response.url;
        } catch (error) {
            this.toast.showError('No se pudo cargar la evidencia.');
            return undefined;
        }
    };

    showActionsPanel = computed(() => {
        return this.isJefe() || this.isSupervisor() || this.isOperador();
    });

    uploadEvidenceStrategy = (file: File): Promise<string> => {
        return this.fileService.subirEvidencia(file);
    }

    //TODO: Revisar si después de iniciar el proceso se puede resolver la denuncia 
    async resolverDenunciaPorOperador(payload: { idDenuncia: number; comentario: string; evidenciasIds: string[] }) {
        try {
            await this.denunciaService.resolverDenunciaPorOperador(
                payload.idDenuncia,
                payload.comentario,
                payload.evidenciasIds
            );
            this.toast.showSuccess('Éxito', 'Denuncia resuelta correctamente');
            // TODO: Cambiar ruta al operador
            await this.router.navigate(['/dashboard']);
        } catch (error: any) {
            this.toast.showError(error.message || 'No se pudo resolver la denuncia. Intente nuevamente.');
        }
    }

    async iniciarDenunciaPorOperador(payload: { idDenuncia: number }) {
        try {
            //TODO: Crear método en el facade para iniciar el proceso
            await this.denunciaService.iniciarDenunciaPorOperador(
                payload.idDenuncia
            );
            this.toast.showSuccess('Éxito', 'Denuncia iniciada correctamente');
            await this.router.navigate(['/dashboard']);
        } catch (error: any) {
            this.toast.showError(error.message || 'No se pudo iniciar la denuncia. Intente nuevamente.');
        }
    }

    async asignarOperadorPorJefe(payload: { idDenuncia: number, idOperador: number }) {
        try {
            //TODO: Crear método en el facade para iniciar el proceso
            await this.denunciaService.asignarOperadorPorJefe(
                payload.idDenuncia,
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
            //TODO: Crear método en el facade para iniciar el proceso
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

    async validarDenunciaPorJefe(payload: { idDenuncia: number, aprobada: boolean, comentario?: string }) {
        try {
            await this.denunciaService.validarDenunciaPorSupervisor(payload.idDenuncia, payload.aprobada, payload.comentario);
            if (payload.aprobada) {
                this.toast.showSuccess('Éxito', 'Denuncia validada correctamente');
            } else {
                this.toast.showSuccess('Éxito', 'Denuncia rechazada correctamente');
            }
        } catch (error: any) {
            this.toast.showError(error.message || 'No se pudo validar la denuncia. Intente nuevamente.');
        }
    }
}

