import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { InputComponent } from '@/app/shared/input/input.component';
import { SubmitButtonComponent } from '@/app/shared/submit-button/submit-button.component';

@Component({
    selector: 'app-change-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, InputComponent, SubmitButtonComponent],
    templateUrl: './change-password.component.html',
    styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent implements OnInit {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);

    showPassword = signal(false);
    showConfirmPassword = signal(false);
    passwordStrength = signal(0);
    serverError = signal<string | null>(null);
    token = signal<string | null>(null);

    form = this.fb.group({
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]]
    }, { validators: this.matchPasswords });

    strengthColor = computed(() => {
        const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600'];
        return colors[this.passwordStrength() - 1] || 'bg-gray-200';
    });

    strengthWidth = computed(() => {
        const widths = ['20%', '40%', '60%', '80%', '100%'];
        return widths[this.passwordStrength() - 1] || '0%';
    });

    strengthText = computed(() => {
        const texts = ['Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte'];
        return texts[this.passwordStrength() - 1] || '';
    });

    ngOnInit() {
        const tokenFromUrl = this.route.snapshot.queryParamMap.get('token');
        this.token.set(tokenFromUrl);
    }

    togglePassword() { this.showPassword.update(v => !v); }
    toggleConfirmPassword() { this.showConfirmPassword.update(v => !v); }

    matchPasswords(control: AbstractControl): ValidationErrors | null {
        const password = control.get('password')?.value;
        const confirm = control.get('confirmPassword')?.value;
        return password === confirm ? null : { mismatch: true };
    }

    calculateStrength(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        if (!value) {
            this.passwordStrength.set(0);
            return;
        }
        let s = 0;
        if (value.length >= 6) s++;
        if (value.length >= 10) s++;
        if (/[a-z]/.test(value) && /[A-Z]/.test(value)) s++;
        if (/\d/.test(value)) s++;
        if (/[^a-zA-Z0-9]/.test(value)) s++;
        this.passwordStrength.set(s);
    }

    isFieldInvalid(field: string) {
        const control = this.form.get(field);
        return control?.invalid && (control?.dirty || control?.touched);
    }

    onSubmit() {
        if (this.form.valid) {
            const payload = {
                token: this.token(),
                newPassword: this.form.value.password
            };

            // TODO: llamar a backend
        }
    }
}
