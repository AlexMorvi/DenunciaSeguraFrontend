import { ToastService } from '@/core/service/toast/toast.service';
import { AuthFacade } from '@/data/services/auth.facade';
import { ROLES } from '@/shared/constants/roles.const';
import { InputComponent } from '@/shared/ui/input/input.component';
import { SubmitButtonComponent } from '@/shared/ui/submit-button/submit-button.component';
import { DenunciaFacade } from '@/data/services/denuncia.facade';
import { Component, computed, effect, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IconDefinition, faSave } from '@fortawesome/free-solid-svg-icons';
import { ESTADOS_DENUNCIA } from '@/shared/constants/estados.const';
import { EstadoDenunciaEnum } from '@/core/api/denuncias/models';
import { UiStyleDirective } from "@/shared/style/ui-styles.directive";
import { UsuarioResponse } from '@/core/api/usuarios/models';

@Component({
    selector: 'app-perfil-page',
    standalone: true,
    imports: [ReactiveFormsModule, SubmitButtonComponent, InputComponent, UiStyleDirective],
    templateUrl: './perfil.page.html',
})
export class PerfilPageComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly router = inject(Router);
    private readonly authService = inject(AuthFacade);
    private readonly denunciaService = inject(DenunciaFacade);
    private readonly toast = inject(ToastService);

    // Signals del Facade
    readonly currentUser = this.authService.currentUser;
    readonly isLoading = this.authService.loading;
    readonly save: IconDefinition = faSave;
    protected readonly denuncias = this.denunciaService.denuncias;


    readonly denunciasCount = computed(() => this.denunciaService.denuncias()?.length ?? 0);
    readonly resolvedCount = computed(() => (this.denunciaService.denuncias() || []).filter(d => d.estado === ESTADOS_DENUNCIA.RESUELTA).length);
    readonly inProgressCount = computed(() => {
        const list = this.denunciaService.denuncias() || [];
        const inProgressStates = [
            ESTADOS_DENUNCIA.ASIGNADA,
            ESTADOS_DENUNCIA.EN_PROCESO,
            ESTADOS_DENUNCIA.EN_VALIDACION
        ];
        return list.filter(d => inProgressStates.includes(d.estado as EstadoDenunciaEnum)).length;
    });

    // Computados para lógica de vista
    readonly isCitizen = computed(() => this.currentUser()?.rol === ROLES.CIUDADANO);
    readonly isStaff = computed(() => this.currentUser()?.rol !== ROLES.CIUDADANO);


    ngOnInit(): void {
        // TODO: Es muy ineficiente cargar todas las denuncias solo para contarlas, considerar un endpoint dedicado
        this.denunciaService.loadAll();
    }

    form = this.fb.nonNullable.group({
        alias: ['', [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(50),
            Validators.pattern(/^[a-zA-Z0-9\s\-_]+$/)
        ]],
    });

    constructor() {
        effect(() => {
            const user = this.currentUser();
            if (user) {
                // this.resetFormValues(user);
            }
        });
    }

    async updateAlias(): Promise<void> {
        if (!this.isValidSubmission()) return;

        const { alias: newAlias } = this.form.getRawValue();

        try {
            await this.performAliasUpdate(newAlias.trim());
            this.handleUpdateSuccess(newAlias);

        } catch {
            this.toast.showError("No se pudo actualizar el perfil. Verifique su conexión.");
        }
    }

    cancel(): void {
        // const user = this.currentUser();
        // if (user) this.resetFormValues(user);
    }

    // --- Métodos Privados (Helpers & Business Logic) ---

    private resetFormValues(user: UsuarioResponse): void {
        const currentAlias = this.isCitizen()
            ? user.publicCitizenId
            : user.aliasPublico;

        this.form.controls.alias.setValue(currentAlias || '');
        this.form.markAsPristine();
    }

    private isValidSubmission(): boolean {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return false;
        }
        if (!this.form.value.alias?.trim()) {
            this.toast.showError('El alias no puede estar vacío.');
            return false;
        }
        return true;
    }

    private async performAliasUpdate(alias: string): Promise<void> {
        return this.isCitizen()
            ? await this.authService.updateCitizenAlias(alias)
            : await this.authService.updateMyAlias(alias);
    }

    private handleUpdateSuccess(newAlias: string): void {
        this.toast.showSuccess(
            'Perfil actualizado',
            this.isCitizen() ? 'Tu ID público ha sido modificado.' : 'Tu alias público ha sido modificado.'
        );

        this.form.controls.alias.setValue(newAlias);
        this.form.markAsPristine();
    }
}
