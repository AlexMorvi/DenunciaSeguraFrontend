import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
    FormBuilder,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';

import { InputComponent } from '@/shared/input/input.component';
import { SubmitButtonComponent } from '@/shared/submit-button/submit-button.component';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink, InputComponent, SubmitButtonComponent],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
    private readonly fb = inject(FormBuilder);
    private readonly router = inject(Router);

    message = signal<string | null>(null);
    messageClass = signal<'success' | 'error' | 'info' | null>(null);
    submitting = signal(false);

    registerForm = this.fb.nonNullable.group({
        nombre: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]]
    });

    get isFormValid(): boolean {
        return this.registerForm.valid && this.registerForm.dirty;
    }

    onSubmit(): void {
        if (this.registerForm.invalid || this.submitting()) {
            this.registerForm.markAllAsTouched();
            return;
        }

        this.submitting.set(true);

        const formData = this.registerForm.getRawValue();
    }

    get nombreControl() { return this.registerForm.controls.nombre; }
    get emailControl() { return this.registerForm.controls.email; }
    get passwordControl() { return this.registerForm.controls.password; }
}
