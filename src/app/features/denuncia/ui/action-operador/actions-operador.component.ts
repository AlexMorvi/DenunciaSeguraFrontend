import { Component, input, output, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthFacade } from '@/data/services/auth.facade';
import { DenunciaFacade } from '@/data/services/denuncia.facade';
import { ToastService } from '@/core/service/toast.service';
import { LoggerService } from '@/core/service/logger.service';
import { DenunciaStaffViewResponse } from '@/core/api/denuncias/models';
import { ESTADO_DENUNCIA_ENUM } from '@/core/api/denuncias/models/estado-denuncia-enum-array';
import { UiStyleDirective } from '@/shared/style/ui-styles.directive';
import { SelectComponent } from '@/shared/ui/select/select.component';
import { InputComponent } from '@/shared/ui/input/input.component';
import { FileUploadComponent } from '@/shared/ui/file-upload/file-upload.component';
import { ENTIDAD_ENUM } from '@/core/api/auth/models/entidad-enum-array';
import { SubmitButtonComponent } from '@/shared/ui/submit-button/submit-button.component';
import { faSave, faComment } from '@fortawesome/free-solid-svg-icons';
import { InputErrorComponent } from '@/shared/ui/input-error/input-error.component';

@Component({
    selector: 'app-actions-operador',
    standalone: true,
    imports: [ReactiveFormsModule, UiStyleDirective, SelectComponent, SubmitButtonComponent, FileUploadComponent, InputErrorComponent, InputComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './actions-operador.component.html'
})
export class ActionsOperadorComponent {
    auth = inject(AuthFacade);
    private denunciaFacade = inject(DenunciaFacade);
    private toast = inject(ToastService);
    private logger = inject(LoggerService);
    protected readonly faSave = faSave;
    protected readonly faComment = faComment;

    // TODO: Utilizar el tipo correcto una vez corregido el contrato
    // currentDenuncia = input.required<DenunciaStaffViewResponse>();
    currentDenuncia = input.required<any>();

    onUpdateStatus = output<{ prioridad: string }>();
    onSaveAssignment = output<string>();

    // TODO: si hay otro endpoint para el estado  entonces este método debe aceptar las evidencias
    form = new FormGroup({
        entidadId: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required]
        }),
        estado: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        comentarios: new FormControl('', { nonNullable: true })
    });

    entidadesOptions = ENTIDAD_ENUM;
    estadoOptions = ESTADO_DENUNCIA_ENUM;

    evidencias = signal<File[]>([]);

    handleUploadError(errorMessage: string) {
        this.toast.showWarning(errorMessage);
        this.logger.error('Upload error in actions panel', { code: 'UPLOAD_ERROR', timestamp: new Date().toISOString() });
    }

    isSubmitting(): boolean {
        return this.denunciaFacade.loading();
    }

    async marcarResuelta() {
        const denuncia = this.currentDenuncia?.();
        if (!denuncia || !denuncia.id) return;

        if (!this.form.valid) {
            this.form.markAllAsTouched();
            return;
        }

        const rawComentario = this.form.controls.comentarios.value || '';
        const comentarioLimpio = rawComentario.trim();

        try {
            await this.denunciaFacade.marcarComoResuelta(denuncia.id, comentarioLimpio);
            this.toast.showSuccess('Denuncia actualizada', 'La denuncia ha sido marcada como resuelta.');
            this.onUpdateStatus.emit({ prioridad: denuncia.prioridad ?? '' });
        } catch (err) {
            // TODO: mejorar manejo de errores
            this.logger.error('Error al marcar denuncia como resuelta', err);
            this.toast.showError('No se pudo marcar la denuncia como resuelta. Intente nuevamente.');
            throw err;
        } finally {
            this.form.controls.comentarios.reset();
        }
    }

}
