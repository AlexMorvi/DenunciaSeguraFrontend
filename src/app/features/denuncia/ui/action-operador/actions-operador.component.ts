import { Component, input, output, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '@/core/service/toast/toast.service';
import { ESTADO_DENUNCIA_ENUM } from '@/core/api/denuncias/models/estado-denuncia-enum-array';
import { UiStyleDirective } from '@/shared/style/ui-styles.directive';
import { InputComponent } from '@/shared/ui/input/input.component';
import { FileUploadComponent } from '@/shared/ui/file-upload/file-upload.component';
import { ENTIDAD_ENUM } from '@/core/api/usuarios/models/entidad-enum-array';
import { SubmitButtonComponent } from '@/shared/ui/submit-button/submit-button.component';
import { faSave, faComment, faPlay, faCheck, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FileUploadErrorEvent } from '@/core/model/file-upload.event';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-actions-operador',
    standalone: true,
    imports: [ReactiveFormsModule, UiStyleDirective, SubmitButtonComponent, FileUploadComponent, InputComponent, FontAwesomeModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './actions-operador.component.html'
})
export class ActionsOperadorComponent {
    private readonly fb = inject(FormBuilder);
    private readonly toast = inject(ToastService);

    protected readonly faSave = faSave;
    protected readonly faComment = faComment;
    protected readonly faPlay = faPlay;
    protected readonly faCheck = faCheck;
    protected readonly faInfoCircle = faInfoCircle;

    currentDenuncia = input.required<any>();
    uploadEvidenceStrategy = input.required<(file: File) => Promise<string>>();
    public isLoading = input<boolean>(false);

    iniciar = output<{ idDenuncia: number }>();
    save = output<{ idDenuncia: number, comentario: string, evidenciasIds: string[] }>();

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
    }

    async resolverDenunciaPorOperador() {
        const denuncia = this.currentDenuncia();
        if (!denuncia?.id) return;

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
        if (!denuncia?.id) return;

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
