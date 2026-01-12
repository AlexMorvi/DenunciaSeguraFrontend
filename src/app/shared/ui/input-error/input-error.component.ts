import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
    selector: 'app-input-error',
    standalone: true,
    templateUrl: './input-error.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputErrorComponent {
    control = input<AbstractControl | null>(null);
    messages = input<Record<string, string> | null>(null);

    get showErrors(): boolean {
        const ctrl = this.control();
        if (!ctrl || !ctrl.invalid) return false;

        if (ctrl.touched) return true;
        if (ctrl.dirty && ctrl.hasError('numeric')) return true;

        return false;
    }

    get visibleErrors(): string[] {
        const ctrl = this.control();
        if (!ctrl?.errors) return [];

        const errorKeys = Object.keys(ctrl.errors);

        if (ctrl.dirty && !ctrl.touched) {
            if (ctrl.hasError('numeric')) return ['numeric'];
            return [];
        }

        return errorKeys;
    }
    private errorMessages: Record<string, (params: any) => string> = {
        required: () => 'Este campo es requerido.',
        minlength: (params) => `Mínimo ${params.requiredLength} caracteres.`,
        maxlength: (params) => `Máximo ${params.requiredLength} caracteres.`,
        email: () => 'Formato de correo inválido.',
        pattern: () => 'El formato no es válido.',
        numeric: () => 'Solo se aceptan números.'
    };

    getErrorMessage(errorKey: string, errorValue: any): string {
        const custom = this.messages?.();
        if (custom && custom[errorKey]) return custom[errorKey];

        const handler = this.errorMessages[errorKey];
        return handler ? handler(errorValue) : 'Campo inválido';
    }
}
