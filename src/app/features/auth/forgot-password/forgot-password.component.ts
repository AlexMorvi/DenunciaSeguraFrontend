import { Component, signal, computed, inject } from '@angular/core';
import { InputComponent } from '@/app/shared/input/input.component';
import { SubmitButtonComponent } from '@/app/shared/submit-button/submit-button.component';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink, InputComponent, SubmitButtonComponent],
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
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
