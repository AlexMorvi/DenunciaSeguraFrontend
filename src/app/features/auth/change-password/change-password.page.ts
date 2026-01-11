// import { Component, inject, signal, computed, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
// import { ActivatedRoute } from '@angular/router';
// import { InputComponent } from '@/shared/ui/input/input.component';
// import { SubmitButtonComponent } from '@/shared/ui/submit-button/submit-button.component';
// import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// import { faLock, faExclamationCircle, faCheck, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
// import { AuthFacade } from '@/data/services/auth.facade';
// import { PasswordResetRequest } from '@/core/api/auth/models';
// import { Router } from '@angular/router';
// import { ToastService } from '@/core/service/toast/toast.service';

// @Component({
//     selector: 'app-change-password',
//     standalone: true,
//     imports: [CommonModule, ReactiveFormsModule, InputComponent, SubmitButtonComponent, FontAwesomeModule],
//     templateUrl: './change-password.page.html',
//     styleUrls: ['./change-password.page.scss']
// })
// export class ChangePasswordComponent implements OnInit {
//     protected readonly faLock = faLock;
//     protected readonly faExclamationCircle = faExclamationCircle;
//     protected readonly faCheck = faCheck;
//     protected readonly faShieldAlt = faShieldAlt;

//     private fb = inject(FormBuilder);
//     private route = inject(ActivatedRoute);
//     private readonly authFacade = inject(AuthFacade);
//     private readonly router = inject(Router);
//     private readonly toast = inject(ToastService);

//     protected readonly isLoading = this.authFacade.loading;

//     showPassword = signal(false);
//     showConfirmPassword = signal(false);
//     passwordStrength = signal(0);
//     token = signal<string | null>(null);

//     form = this.fb.nonNullable.group({
//         password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(128)]],
//         confirmPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(128)]]
//     }, { validators: this.matchPasswords });

//     strengthColor = computed(() => {
//         const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600'];
//         return colors[this.passwordStrength() - 1] || 'bg-gray-200';
//     });

//     strengthWidth = computed(() => {
//         const widths = ['20%', '40%', '60%', '80%', '100%'];
//         return widths[this.passwordStrength() - 1] || '0%';
//     });

//     strengthText = computed(() => {
//         const texts = ['Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte'];
//         return texts[this.passwordStrength() - 1] || '';
//     });

//     ngOnInit() {
//         const tokenFromUrl = this.route.snapshot.queryParamMap.get('token');
//         this.token.set(tokenFromUrl);
//     }

//     togglePassword() { this.showPassword.update(v => !v); }
//     toggleConfirmPassword() { this.showConfirmPassword.update(v => !v); }

//     matchPasswords(control: AbstractControl): ValidationErrors | null {
//         const password = control.get('password')?.value;
//         const confirm = control.get('confirmPassword')?.value;
//         return password === confirm ? null : { mismatch: true };
//     }

//     calculateStrength(event: Event) {
//         const value = (event.target as HTMLInputElement).value;
//         if (!value) {
//             this.passwordStrength.set(0);
//             return;
//         }
//         let s = 0;
//         if (value.length >= 6) s++;
//         if (value.length >= 10) s++;
//         if (/[a-z]/.test(value) && /[A-Z]/.test(value)) s++;
//         if (/\d/.test(value)) s++;
//         if (/[^a-zA-Z0-9]/.test(value)) s++;
//         this.passwordStrength.set(s);
//     }

//     isFieldInvalid(field: string) {
//         const control = this.form.get(field);
//         return control?.invalid && (control?.dirty || control?.touched);
//     }

//     async resetPassword() {
//         if (this.form.invalid || !this.token()) {
//             this.form.markAllAsTouched();
//             return;
//         }

//         const payload: PasswordResetRequest = {
//             token: this.token()!,
//             newPassword: this.form.controls.password.value
//         };

//         try {
//             await this.authFacade.resetPassword(payload);
//             this.toast.showSuccess('Contraseña actualizada con éxito', 'Ahora puedes iniciar sesión.');
//             this.router.navigate(['/auth/login']);
//         } catch (_error) {
//             this.toast.showError('El enlace ha expirado o es inválido. Por favor, solicita un nuevo cambio de contraseña.');
//             this.router.navigate(['/auth/forgot-password']);
//         }
//     }
// }
