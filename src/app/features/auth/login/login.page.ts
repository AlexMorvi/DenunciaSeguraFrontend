import { Component, inject, OnInit, signal, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '@/shared/ui/input/input.component';
import { SubmitButtonComponent } from '@/shared/ui/submit-button/submit-button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope, faLock, faArrowRight, faUsers, faKey, faCheckCircle, faInfoCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink, InputComponent, SubmitButtonComponent, FontAwesomeModule]
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
    private router = inject(Router);

    mensaje = signal('Tu contraseña ha sido cambiada exitosamente.');
    error = signal(false);
    submitting = signal(false);

    passwordChanged = input<string>();
    logout = input<string>();

    loginForm = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
        password: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(128)]]
    });

    onSubmit(): void {
        if (this.loginForm.invalid || this.submitting()) return;

        this.submitting.set(true);

        const rawEmail = this.loginForm.getRawValue().email;
        const emailPayload = rawEmail.trim().toLowerCase();
        const passwordPayload = this.loginForm.getRawValue().password;

        setTimeout(() => {
            this.submitting.set(false);
            this.error.set(true);
        }, 1000);
    }

    get emailControl() { return this.loginForm.controls.email; }
    get passwordControl() { return this.loginForm.controls.password; }

    goToForgotPassword() { this.router.navigate(['/forgot-password']); }
    goToRegister() { this.router.navigate(['/crear-cuenta']); }
}
