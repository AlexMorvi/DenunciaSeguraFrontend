import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { KeyValuePipe } from '@angular/common';

@Component({
    selector: 'app-input-error',
    standalone: true,
    imports: [KeyValuePipe],
    templateUrl: './input-error.component.html'
})
export class InputErrorComponent {
    control = input<AbstractControl | null>(null);
    messages = input<Record<string, string> | null>(null);

    private errorMessages: Record<string, (params: any) => string> = {
        required: () => 'Este campo es requerido.',
        minlength: (params) => `Mínimo ${params.requiredLength} caracteres.`,
        maxlength: (params) => `Máximo ${params.requiredLength} caracteres.`,
        email: () => 'Formato de correo inválido.',
        pattern: () => 'El formato no es válido.'
    };

    getErrorMessage(errorKey: string, errorValue: any): string {
        const custom = this.messages?.();
        if (custom && custom[errorKey]) return custom[errorKey];

        const handler = this.errorMessages[errorKey];
        return handler ? handler(errorValue) : 'Campo inválido';
    }
}
