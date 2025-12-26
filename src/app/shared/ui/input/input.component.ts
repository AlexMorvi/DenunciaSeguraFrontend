import { Component, input, signal, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-input',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './input.component.html',
    styleUrls: ['./input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputComponent),
            multi: true
        }
    ]
})
export class InputComponent implements ControlValueAccessor {
    // Inputs configurables
    id = input.required<string>();
    label = input<string>('');
    type = input<'text' | 'email' | 'password'>('text');
    placeholder = input<string>('');
    icon = input<string>(''); // Clase de FontAwesome (ej: 'fa-envelope')
    autocomplete = input<string>('off');
    inputmode = input<string>('');
    maxlength = input<number>(254);
    autofocus = input<boolean>(false);
    control = input<FormControl | null>(null); // Para mostrar errores
    errors = input<Record<string, string>>({}); // Mapa de errores personalizados

    // Estado interno
    showPassword = signal(false);
    value = signal('');
    disabled = signal(false);

    // Callbacks de ControlValueAccessor
    private onChange: (value: string) => void = () => { };
    private onTouched: () => void = () => { };

    // ControlValueAccessor implementation
    writeValue(value: string): void {
        this.value.set(value || '');
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled.set(isDisabled);
    }

    // Métodos públicos
    onInput(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.value.set(target.value);
        this.onChange(target.value);
    }

    onBlur(): void {
        this.onTouched();
    }

    togglePasswordVisibility(): void {
        this.showPassword.update(v => !v);
    }

    get isPassword(): boolean {
        return this.type() === 'password';
    }

    get inputType(): string {
        if (this.isPassword && this.showPassword()) {
            return 'text';
        }
        return this.type();
    }

    get hasError(): boolean {
        const ctrl = this.control();
        return !!ctrl && ctrl.invalid && ctrl.touched;
    }

    get errorMessages(): string[] {
        const ctrl = this.control();
        if (!ctrl || !ctrl.errors) return [];

        const messages: string[] = [];
        const customErrors = this.errors();

        Object.keys(ctrl.errors).forEach(key => {
            if (customErrors[key]) {
                messages.push(customErrors[key]);
            }
        });

        return messages;
    }
}
