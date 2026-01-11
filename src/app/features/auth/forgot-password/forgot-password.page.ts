import { Component, inject } from '@angular/core';
import { InputComponent } from '@/shared/ui/input/input.component';
import { SubmitButtonComponent } from '@/shared/ui/submit-button/submit-button.component';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faKey, faCheckCircle, faExclamationCircle, faEnvelope, faInfoCircle, faPaperPlane, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { UiStyleDirective } from "@/shared/style/ui-styles.directive";
import { AuthFacade } from '@/data/services/auth.facade';
import { ToastService } from '@/core/service/toast/toast.service';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink, InputComponent, SubmitButtonComponent, FontAwesomeModule, UiStyleDirective],
    templateUrl: './forgot-password.page.html',
    styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordComponent {
    protected readonly faKey = faKey;
    protected readonly faCheckCircle = faCheckCircle;
    protected readonly faExclamationCircle = faExclamationCircle;
    protected readonly faEnvelope = faEnvelope;
    protected readonly faInfoCircle = faInfoCircle;
    protected readonly faPaperPlane = faPaperPlane;
    protected readonly faArrowLeft = faArrowLeft;

    private readonly fb = inject(FormBuilder);
    private readonly router = inject(Router);
    private toast = inject(ToastService);
    private readonly authFacade = inject(AuthFacade);

    // UI State
    readonly isLoading = this.authFacade.loading;

    // Form group
    form = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    });

    async forgotPassword(): Promise<void> {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const { email } = this.form.getRawValue();

        try {
            await this.authFacade.forgotPassword({ email: email.trim().toLowerCase() });
            this.toast.showSuccess('Éxito',
                'Si tu correo electrónico está registrado, recibirás un enlace para restablecer tu contraseña.'
            );
            this.form.reset();
        } catch {
            this.toast.showSuccess('Éxito',
                'Si tu correo electrónico está registrado, recibirás un enlace para restablecer tu contraseña.'
            );
        }
    }

    goBackToLogin(): void {
        this.router.navigate(['/login']);
    }
}
