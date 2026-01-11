import { Component, inject, signal, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '@/shared/ui/input/input.component';
import { SubmitButtonComponent } from '@/shared/ui/submit-button/submit-button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope, faLock, faArrowRight, faUsers, faKey, faCheckCircle, faInfoCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { UiStyleDirective } from '@/shared/style/ui-styles.directive';
import { ToastService } from '@/core/service/toast/toast.service';
import { AuthFacade } from '@/data/services/auth.facade';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink, InputComponent, SubmitButtonComponent, FontAwesomeModule, UiStyleDirective]
})
export class LoginComponent {
    protected readonly faEnvelope: IconDefinition = faEnvelope;
    protected readonly faLock: IconDefinition = faLock;
    protected readonly faArrowRight: IconDefinition = faArrowRight;
    protected readonly faUsers: IconDefinition = faUsers;
    protected readonly faKey: IconDefinition = faKey;
    protected readonly faCheckCircle: IconDefinition = faCheckCircle;
    protected readonly faInfoCircle: IconDefinition = faInfoCircle;
    protected readonly faExclamationCircle: IconDefinition = faExclamationCircle;

    private fb = inject(FormBuilder);
    private toast = inject(ToastService);
    private router = inject(Router);
    private readonly authFacade = inject(AuthFacade);

    protected readonly isLoading = this.authFacade.loading;

    mensaje = signal('Tu contraseña ha sido cambiada exitosamente.');

    form = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
        password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(128)]]
    });

    async login(): Promise<void> {
        if (this.form.invalid || this.isLoading()) return;

        const { email, password } = this.form.getRawValue();

        try {
            await this.authFacade.login({
                email: email.trim().toLowerCase(),
                password: password
            });

            this.router.navigate(['/dashboard']);
            this.toast.showSuccess('¡Bienvenido!', 'Inicio de sesión exitoso');
        } catch {
            this.toast.showError('Credenciales incorrectas. Por favor, verifica tu email y contraseña.');
        }
    }

    goToForgotPassword() { this.router.navigate(['/forgot-password']); }
    goToRegister() { this.router.navigate(['/crear-cuenta']); }
}
