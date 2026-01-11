import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AuthFacade } from '@/data/services/auth.facade';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ROLES } from '@/shared/constants/roles.const';
import { CommonModule } from '@angular/common';
import { InputComponent } from '@/shared/ui/input/input.component';
import { SubmitButtonComponent } from '@/shared/ui/submit-button/submit-button.component';
import { ToastService } from '@/core/service/toast/toast.service';
import { UsuarioPerfilResponse } from '@/core/api/auth/models';
import { Router } from '@angular/router';

@Component({
    selector: 'app-perfil',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputComponent,
        SubmitButtonComponent,
    ],
    templateUrl: './perfil.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerfilPageComponent {
    private fb = inject(FormBuilder);
    private router = inject(Router);

    private readonly authFacade = inject(AuthFacade);
    private readonly toast = inject(ToastService);

    readonly currentUser = this.authFacade.currentUser;
    protected readonly isLoading = this.authFacade.loading;

    readonly isCitizen = computed(() => this.currentUser()?.rol === ROLES.CIUDADANO);
    readonly isStaff = computed(() => this.currentUser()?.rol !== ROLES.CIUDADANO);

    form = this.fb.nonNullable.group({
        alias: ['', [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(50),
        ]],
    });

    constructor() {
        this.initializeForm();
    }

    private initializeForm(): void {
        const user = this.currentUser();
        if (!user) return;

        const alias = this.isCitizen()
            ? user.publicCitizenId
            : user.aliasPublico;
        this.form.setValue({ alias: alias || '' });
    }

    async updateAlias(): Promise<void> {
        // 1. Guard Clause: Validación inicial separada
        if (!this.isValidSubmission()) {
            return;
        }

        const { alias: newAlias } = this.form.getRawValue();

        try {
            // 2. Ejecución: Delegar la lógica de negocio a un método específico
            const updatedUser = await this.performAliasUpdate(newAlias);

            // 3. Sincronización: Manejar la actualización del estado
            await this.syncUserState(updatedUser);

            // 4. Finalización: Feedback y navegación
            await this.handleUpdateSuccess();

        } catch (error: unknown) {
            this.toast.showError("No se pudo actualizar el alias. Intente nuevamente.");
        }
    }

    // --- Métodos privados (Helpers) ---

    private isValidSubmission(): boolean {
        if (this.form.invalid || !this.form.value?.alias) {
            this.form.markAsTouched();
            this.toast.showError('El alias no cumple con el formato requerido (min 3 caracteres, sin símbolos).');
            return false;
        }
        return true;
    }

    private async performAliasUpdate(alias: string): Promise<UsuarioPerfilResponse | undefined> {
        return this.isCitizen()
            ? await this.authFacade.updateCitizenAlias(alias)
            : await this.authFacade.updateMyAlias(alias);
    }

    private async syncUserState(user: UsuarioPerfilResponse | undefined): Promise<void> {
        if (user) {
            this.authFacade.updateAuthState(user);
        } else {
            await this.authFacade.refreshUser();
        }
    }

    private async handleUpdateSuccess(): Promise<void> {
        this.initializeForm();
        this.toast.showSuccess('Perfil actualizado', 'Tu alias ha sido modificado correctamente.');
        await this.router.navigate(['/ciudadano/dashboard']);
    }
}
