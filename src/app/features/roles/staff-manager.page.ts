import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthFacade } from '@/data/services/auth.facade';
import { RolEnum } from '@/core/api/usuarios/models/rol-enum';
import { EntidadEnum } from '@/core/api/usuarios/models/entidad-enum';
import { RegistroStaffRequest } from '@/core/api/usuarios/models/registro-staff-request';
import { InputComponent } from '@/shared/ui/input/input.component';
import { SelectComponent } from '@/shared/ui/select/select.component';
import { CategorySelectorComponent } from '@/shared/ui/category-selector/category-selector.component';
import { SubmitButtonComponent } from '@/shared/ui/submit-button/submit-button.component';
import { ToastService } from '@/core/service/toast/toast.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition, faUserPlus, faBuilding, faBolt, faTint, faBroom, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { UiStyleDirective } from "@/shared/style/ui-styles.directive";

const ENTITY_ICON_MAP: Record<string, IconDefinition> = {
    MUNICIPIO: faBuilding,
    EMPRESA_ELECTRICA: faBolt,
    EMPRESA_AGUA: faTint,
    ASEO: faBroom,
    POLICIA: faShieldAlt
};

const ENTITY_COLOR_MAP: Record<string, string> = {
    MUNICIPIO: 'text-indigo-600',
    EMPRESA_ELECTRICA: 'text-yellow-500',
    EMPRESA_AGUA: 'text-blue-500',
    ASEO: 'text-green-600',
    POLICIA: 'text-red-600'
};

@Component({
    selector: 'app-staff-manager',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, InputComponent, SelectComponent, CategorySelectorComponent, SubmitButtonComponent, FontAwesomeModule, UiStyleDirective],
    templateUrl: './staff-manager.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [`

:host {
  display: flex;
}


    `]

})
export class StaffManagerPage {
    protected readonly faUserPlus = faUserPlus;

    private readonly fb = inject(FormBuilder);
    private readonly authFacade = inject(AuthFacade);
    private readonly toast = inject(ToastService);
    private readonly router = inject(Router);

    loading = signal<boolean>(false);

    roles = this.authFacade.availableRoles.filter((r: string) => r !== 'CIUDADANO');
    entidades = this.authFacade.uiEntities;

    readonly listadoEntidades = computed(() => {
        return this.authFacade.uiEntities().map((e: { code: string | number; label: any; }) => ({
            value: e.code as EntidadEnum,
            label: e.label,
            icon: ENTITY_ICON_MAP[e.code] ?? faBuilding,
            colorClass: ENTITY_COLOR_MAP[e.code] ?? 'text-gray-600'
        }));
    });
    private readonly emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    form = this.fb.group({
        nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
        email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
        cedula: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
        rol: ['', [Validators.required]],
        entidad: ['', [Validators.required]],
        aliasPublico: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
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
            cedula: this.form.value.cedula!,
            rol: this.form.value.rol as RolEnum,
            entidad: this.form.value.entidad as EntidadEnum,
        };

        try {
            await this.authFacade.registerStaff(request);
            this.toast.showSuccess('Funcionario registrado', 'Nuevo funcionario registrado correctamente.');

            this.router.navigate(['/login']);
            this.form.reset();
        } catch {
            this.toast.showError('No se pudo completar el registro. Verifique su conexión o intente más tarde.');
        } finally {
            this.loading.set(false);
        }
    }
}
