import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
    FormBuilder,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';

import { InputComponent } from '@/shared/ui/input/input.component';
import { SubmitButtonComponent } from '@/shared/ui/submit-button/submit-button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition, faUserPlus, faUser, faEnvelope, faLock, faCheckCircle, faExclamationCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink, InputComponent, SubmitButtonComponent, FontAwesomeModule],
    templateUrl: './register.page.html',
    styleUrls: ['./register.page.scss']
})
export class RegisterComponent {
    protected readonly faUserPlus: IconDefinition = faUserPlus;
    protected readonly faUser: IconDefinition = faUser;
    protected readonly faEnvelope: IconDefinition = faEnvelope;
    protected readonly faLock: IconDefinition = faLock;
    protected readonly faCheckCircle: IconDefinition = faCheckCircle;
    protected readonly faExclamationCircle: IconDefinition = faExclamationCircle;
    protected readonly faInfoCircle: IconDefinition = faInfoCircle;

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
