// components/actions-panel/actions-panel.component.ts
import { Component, input, output, inject, ChangeDetectionStrategy, signal, effect } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DenunciaFacade } from '@/data/services/denuncia.facade';
import { DenunciaStaffViewResponse } from '@/core/api/denuncias/models';
import { UiStyleDirective } from '@/shared/style/ui-styles.directive';
import { SelectComponent } from '@/shared/ui/select/select.component';
import { InputErrorComponent } from '@/shared/ui/input-error/input-error.component';
import { SubmitButtonComponent } from '@/shared/ui/submit-button/submit-button.component';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { ToastService } from '@/core/service/toast.service';
import { LoggerService } from '@/core/service/logger.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-actions-jefe',
    standalone: true,
    imports: [ReactiveFormsModule, UiStyleDirective, SelectComponent, SubmitButtonComponent, InputErrorComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './actions-jefe.component.html'
})
export class ActionsJefeComponent {
    private denunciaFacade = inject(DenunciaFacade);
    private toast = inject(ToastService);
    private router = inject(Router);
    protected readonly faUsers = faUsers;

    // TODO: Utilizar la denuncia actual que envía denuncia page
    // currentDenuncia = input.required<DenunciaStaffViewResponse>();
    currentDenuncia = input.required<any>();

    onAssignmentComplete = output<void>();

    form = new FormGroup({
        operadorId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        notas: new FormControl('', { nonNullable: true })
    });

    // TODO: Cargar lista real de operadores desde un servicio
    operadores = signal<string[]>(['1 - Operador Alpha', '2 - Operador Bravo', '3 - Operador Charlie']);

    async asignarOperador() {

        if (this.form.invalid) {
            return;
        }

        const denunciaId = this.currentDenuncia()?.id;
        if (!denunciaId) {
            return;
        }

        // TODO: Obtener de forma correcta el operadorId
        const selection = this.form.controls.operadorId.value;

        if (typeof selection !== 'string' || !selection.trim()) {
            this.form.controls.operadorId.setErrors({ invalidOperator: true });
            this.toast.showError('Selecciona un operador válido.');
            return;
        }

        // TODO: corregir esto en caso de que el formato del id cambie
        const [idPart] = selection.split(' - ');
        const operadorId = Number.parseInt(idPart, 10);
        if (!Number.isInteger(operadorId)) {
            this.form.controls.operadorId.setErrors({ invalidOperator: true });
            this.toast.showError('Selecciona un operador válido.');
            return;
        }
        try {
            await this.denunciaFacade.asignarDenuncia(denunciaId, operadorId);
            this.onAssignmentComplete.emit();
            this.form.reset();

            this.toast.showSuccess('Denuncia asignada', 'La denuncia ha sido asignada correctamente.');
            await this.router.navigate(['/jefe/dashboard']);
        } catch (error) {
        }
    }
}
