import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '@/shared/ui/input/input.component';
import { SubmitButtonComponent } from '@/shared/ui/submit-button/submit-button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
    IconDefinition,
    faUserPlus,
    faUser,
    faEnvelope,
    faLock,
    faCheckCircle,
    faExclamationCircle,
    faInfoCircle,
    faAddressCard
} from '@fortawesome/free-solid-svg-icons';
import { UiStyleDirective } from '@/shared/style/ui-styles.directive';
import { AuthFacade } from '@/data/services/auth.facade';
import { RegistroCiudadanoRequest } from '@/core/api/auth/models';
import { InputErrorComponent } from '@/shared/ui/input-error/input-error.component';
import { ToastService } from '@/core/service/toast/toast.service';
import { numericValidator } from '@/shared/validators/numeric.validator';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        RouterLink,
        InputComponent,
        SubmitButtonComponent,
        FontAwesomeModule,
        UiStyleDirective,
        ReactiveFormsModule,
    ],
    templateUrl: './register.page.html',
    styles: [`
        @use '@/styles/_auth.scss';`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
    protected readonly faUserPlus: IconDefinition = faUserPlus;
    protected readonly faUser: IconDefinition = faUser;
    protected readonly faEnvelope: IconDefinition = faEnvelope;
    protected readonly faLock: IconDefinition = faLock;
    protected readonly faCheckCircle: IconDefinition = faCheckCircle;
    protected readonly faExclamationCircle: IconDefinition = faExclamationCircle;
    protected readonly faInfoCircle: IconDefinition = faInfoCircle;
    protected readonly faAddressCard: IconDefinition = faAddressCard;

    private readonly fb = inject(FormBuilder);
    private readonly router = inject(Router);
    private readonly authFacade = inject(AuthFacade);
    private toast = inject(ToastService);

    message = signal<string | null>(null);
    messageClass = signal<'success' | 'error' | 'info' | null>(null);
    submitting = signal(false);

    form = this.fb.nonNullable.group({
        nombre: ['', [Validators.required, Validators.minLength(2)]],
        cedula: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), numericValidator()]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]]
    });

    get isFormValid(): boolean {
        return this.form.valid;
    }


    async onSubmit(): Promise<void> {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.submitting.set(true);
        this.message.set(null);
        this.messageClass.set(null);

        const request: RegistroCiudadanoRequest = this.form.getRawValue();

        try {
            await this.authFacade.registerCitizen(request);

            this.message.set('¡Registro exitoso! Serás redirigido para iniciar sesión.');
            this.messageClass.set('success');
            this.toast.showSuccess('¡Registro exitoso!', 'Por favor inicia sesión con tus credenciales.');

            this.form.reset();
            this.router.navigate(['/auth/login']);
        } catch (error) {

        } finally {
            this.submitting.set(false);
        }
    }
}
