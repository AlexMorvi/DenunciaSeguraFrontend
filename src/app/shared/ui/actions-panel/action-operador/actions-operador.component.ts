// components/actions-panel/actions-panel.component.ts
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
import { FileUploadComponent } from '@/shared/ui/file-upload/file-upload.component';
import { ENTIDAD_ENUM } from '@/core/api/auth/models/entidad-enum-array';
import { SubmitButtonComponent } from '@/shared/ui/submit-button/submit-button.component';
import { faSave } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-actions-operador',
    standalone: true,
    imports: [ReactiveFormsModule, UiStyleDirective, SelectComponent, SubmitButtonComponent, FileUploadComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './actions-operador.component.html'
})
export class ActionsOperadorComponent {
    auth = inject(AuthFacade);
    private denunciaFacade = inject(DenunciaFacade);
    private toast = inject(ToastService);
    private logger = inject(LoggerService);
    protected readonly faSave = faSave;

    // Recibimos la denuncia actual para ver su estado (ej. si ya es urgente)
    // currentDenuncia = input.required<DenunciaStaffViewResponse>();
    currentDenuncia = input.required<any>();

    // Outputs para comunicar al Smart Component que algo pasó
    onUpdateStatus = output<{ prioridad: string }>();
    onSaveAssignment = output<string>();

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

    // Evidence files uploaded via shared FileUploadComponent
    evidencias = signal<File[]>([]);

    handleUploadError(errorMessage: string) {
        this.toast.showWarning(errorMessage);
        this.logger.error('Upload error in actions panel', { error: errorMessage, timestamp: new Date().toISOString() });
    }

    isSubmitting(): boolean {
        return this.denunciaFacade.loading();
    }

    toggleUrgency() {
        // Emitimos evento, NO mutamos la data aquí
        // const nuevaPrioridad = this.currentDenuncia().prioridad === 'Alta' ? 'Media' : 'Alta';
        // this.onUpdateStatus.emit({ prioridad: nuevaPrioridad });
    }

    async marcarResuelta() {
        const denuncia = this.currentDenuncia?.();
        if (!denuncia || !denuncia.id) return;

        if (!this.form.valid) {
            this.form.markAllAsTouched();
            return;
        }

        try {
            await this.denunciaFacade.marcarComoResuelta(denuncia.id, this.form.controls.comentarios.value || undefined);
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
