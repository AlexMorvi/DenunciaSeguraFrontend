import { Component, input, output, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '@/core/service/toast/toast.service';
import { LoggerService } from '@/core/service/logging/logger.service';
// import { DenunciaStaffViewResponse } from '@/core/api/denuncias/models';
import { ESTADO_DENUNCIA_ENUM } from '@/core/api/denuncias/models/estado-denuncia-enum-array';
import { UiStyleDirective } from '@/shared/style/ui-styles.directive';
import { InputComponent } from '@/shared/ui/input/input.component';
import { FileUploadComponent } from '@/shared/ui/file-upload/file-upload.component';
import { ENTIDAD_ENUM } from '@/core/api/usuarios/models/entidad-enum-array';
import { SubmitButtonComponent } from '@/shared/ui/submit-button/submit-button.component';
import { faSave, faComment, faPlay, faCheck } from '@fortawesome/free-solid-svg-icons';
import { FileUploadErrorEvent } from '@/core/model/file-upload.event';

@Component({
    selector: 'app-actions-operador',
    standalone: true,
    imports: [ReactiveFormsModule, UiStyleDirective, SubmitButtonComponent, FileUploadComponent, InputComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './actions-operador.component.html'
})
export class ActionsOperadorComponent {
    private fb = inject(FormBuilder);
    private toast = inject(ToastService);
    private logger = inject(LoggerService);

    protected readonly faSave = faSave;
    protected readonly faComment = faComment;
    protected readonly faPlay = faPlay;
    protected readonly faCheck = faCheck;

    // TODO: Utilizar el tipo correcto una vez corregido el contrato
    // currentDenuncia = input.required<DenunciaStaffViewResponse>();
    currentDenuncia = input.required<any>();
    uploadEvidenceStrategy = input.required<(file: File) => Promise<string>>();
    public isLoading = input<boolean>(false);

    iniciar = output<{ idDenuncia: number }>();
    save = output<{ idDenuncia: number, comentario: string, evidenciasIds: string[] }>();
    // onSaveAssignment = output<string>();

    readonly form = this.fb.nonNullable.group({
        evidenciasIds: new FormControl<string[]>([], { nonNullable: true, validators: [Validators.required, Validators.minLength(1)] }),
        comentarioResolucion: new FormControl('', {
            nonNullable: true,
            validators: [
                Validators.required,
                Validators.minLength(10),
                Validators.maxLength(500)
            ]
        })
    });

    entidadesOptions = ENTIDAD_ENUM;
    estadoOptions = ESTADO_DENUNCIA_ENUM;

    evidencias = signal<File[]>([]);

    isEnProceso = computed(() => {
        return this.currentDenuncia()?.estadoDenuncia === 'EN_PROCESO';
    });

    canResolve = computed(() => {
        return this.isEnProceso() && this.form.valid;
    });

    canIniciar = computed(() => {
        return this.currentDenuncia()?.estadoDenuncia === 'ASIGNADA';
    });


    handleUploadError(event: FileUploadErrorEvent) {
        this.toast.showWarning(event.userMessage);
        this.logger.logError('Upload error in actions panel', { ...event.logData, code: 'UPLOAD_ERROR', timestamp: new Date().toISOString() });
    }

    async resolverDenunciaPorOperador() {
        const denuncia = this.currentDenuncia();
        if (!denuncia || !denuncia.id) return;

        if (!this.form.valid) {
            this.form.markAllAsTouched();
            return;
        }

        const rawComentario = this.form.controls.comentarioResolucion.value || '';
        const comentarioLimpio = rawComentario.trim();

        this.save.emit({
            idDenuncia: denuncia.id,
            comentario: comentarioLimpio,
            evidenciasIds: this.form.controls.evidenciasIds.value,
        });
    }

    iniciarDenunciaPorOperador() {
        const denuncia = this.currentDenuncia();
        if (!denuncia || !denuncia.id) return;

        this.iniciar.emit({
            idDenuncia: denuncia.id,
        });
    }

    resetForm() {
        this.form.reset();
    }

    agregarEvidencia(nuevoId: string) {
        const actuales = this.form.controls.evidenciasIds.value;
        this.form.patchValue({
            evidenciasIds: [...actuales, nuevoId]
        });
    }
}
