import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthFacade } from '@/data/services/auth.facade';
import { RolEnum } from '@/core/api/auth/models/rol-enum';
import { EntidadEnum } from '@/core/api/auth/models/entidad-enum';
import { RegistroStaffRequest } from '@/core/api/auth/models/registro-staff-request';
import { InputComponent } from '@/shared/ui/input/input.component';
import { SelectComponent } from '@/shared/ui/select/select.component';
import { SubmitButtonComponent } from '@/shared/ui/submit-button/submit-button.component';
import { ToastService } from '@/core/service/toast.service';
import { LoggerService } from '@/core/service/logger.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-staff-manager',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, InputComponent, SelectComponent, SubmitButtonComponent, FontAwesomeModule],
    templateUrl: './staff-manager.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StaffManagerPage {
    protected readonly faUserPlus = faUserPlus;

    private fb = inject(FormBuilder);
    private authFacade = inject(AuthFacade);
    private toast = inject(ToastService);
    private logger = inject(LoggerService);

    loading = signal<boolean>(false);

    roles = this.authFacade.availableRoles.filter(r => r !== 'CIUDADANO');
    entidades = this.authFacade.availableEntities;
    private readonly emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    form = this.fb.group({
        nombre: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
        rol: ['', [Validators.required]],
        entidad: ['', [Validators.required]],
        aliasPublico: ['']
    });

    getControl(name: string): FormControl {
        return this.form.get(name) as FormControl;
    }

    async onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.toast.showInfo('Por favor, complete todos los campos obligatorios.');
            return;
        }

        this.loading.set(true);

        const request: RegistroStaffRequest = {
            nombre: this.form.value.nombre!,
            email: this.form.value.email!,
            rol: this.form.value.rol as RolEnum,
            entidad: this.form.value.entidad as EntidadEnum,
            aliasPublico: this.form.value.aliasPublico || undefined
        };

        try {
            await this.authFacade.registerStaff(request);
            this.toast.showSuccess('Funcionario registrado', 'Nuevo funcionario registrado correctamente.');
            this.form.reset();
        } catch (error) {
            this.logger.error('Error al registrar staff', error);
            this.toast.showError('No se pudo completar el registro. Verifique su conexión o intente más tarde.');
        } finally {
            this.loading.set(false);
        }
    }
}
