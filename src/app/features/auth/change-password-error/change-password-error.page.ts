import { Component, Input, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SubmitButtonComponent } from '@/shared/ui/submit-button/submit-button.component';

@Component({
    selector: 'app-change-password-error',
    standalone: true,
    imports: [SubmitButtonComponent],
    templateUrl: './change-password-error.page.html',
})
export class ChangePasswordErrorComponent {
    errorMessage = signal('El enlace de recuperación es inválido o ha expirado. Por favor, solicita uno nuevo.');

    @Input('error') set setError(value: string) {
        if (value) this.errorMessage.set(value);
    }

    private router = inject(Router);

    navigateTo(path: string) {
        this.router.navigate([path]);
    }
}
