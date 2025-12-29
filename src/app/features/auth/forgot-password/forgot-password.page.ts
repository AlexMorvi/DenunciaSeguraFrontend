import { Component, signal, computed, inject } from '@angular/core';
import { InputComponent } from '@/shared/ui/input/input.component';
import { SubmitButtonComponent } from '@/shared/ui/submit-button/submit-button.component';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faKey, faCheckCircle, faExclamationCircle, faEnvelope, faInfoCircle, faPaperPlane, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { UiStyleDirective } from "@/shared/style/ui-styles.directive";

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

    // UI State
    readonly successMessage = signal<string | null>(null);
    readonly errorMessage = signal<string | null>(null);
    readonly isLoading = signal(false);

    // Form group
    readonly forgotPasswordForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
    });

    readonly isFormValid = computed(() => {
        const ctrl = this.forgotPasswordForm.controls.email;
        return ctrl.valid && ctrl.dirty;
    });

    // Submit
    onSubmit(): void {
        if (this.forgotPasswordForm.invalid) {
            this.forgotPasswordForm.markAllAsTouched();
            return;
        }

        this.isLoading.set(true);
        this.errorMessage.set(null);

        const { email } = this.forgotPasswordForm.getRawValue();
    }

    goBackToLogin(): void {
        this.router.navigate(['/login']);
    }
}
