import { Component, input, signal, computed, inject } from '@angular/core';
import { ControlValueAccessor, ReactiveFormsModule, NgControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { faEye, faEyeSlash, faCircle } from '@fortawesome/free-solid-svg-icons';
import { InputErrorComponent } from '../input-error/input-error.component';

@Component({
    selector: 'app-input',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule, InputErrorComponent],
    templateUrl: './input.component.html',
    styleUrls: ['./input.component.scss'],
})
export class InputComponent implements ControlValueAccessor {
    public ngControl = inject(NgControl, { optional: true, self: true });

    id = input.required<string>();
    label = input<string>('');
    type = input<'text' | 'email' | 'password'>('text');
    placeholder = input<string>('');
    icon = input<IconDefinition | null>(null);
    autocomplete = input<string>('off');
    inputmode = input<string>('');
    maxlength = input<number>(254);
    autofocus = input<boolean>(false);
    multiline = input<boolean>(false);
    rows = input<number>(3);
    errors = input<Record<string, string>>({});

    showPassword = signal(false);
    value = signal<string>('');
    disabled = signal(false);


    protected readonly faEye = faEye;
    protected readonly faEyeSlash = faEyeSlash;
    protected readonly faDefault: IconDefinition = faCircle;

    constructor() {
        if (this.ngControl) {
            this.ngControl.valueAccessor = this;
        }
    }

    protected iconClasses = computed(() => {
        const baseClasses = 'absolute left-3 text-gray-400 pointer-events-none';

        const positionClasses = this.multiline()
            ? 'top-3'
            : 'top-1/2 -translate-y-1/2';

        return `${baseClasses} ${positionClasses}`;
    });

    canToggleVisibility = computed(() => this.type() === 'password');

    inputType = computed(() => {
        if (this.canToggleVisibility() && this.showPassword()) {
            return 'text';
        }
        return this.type();
    });

    onInput(event: Event): void {
        const target = event.target as HTMLInputElement | HTMLTextAreaElement;
        this.value.set(target.value);
        this.onChange(target.value);
    }
    get hasError(): boolean {
        const ctrl = this.ngControl?.control;
        return !!ctrl && ctrl.invalid && ctrl.touched;
    }

    get errorMessage(): string | null {
        const control = this.ngControl?.control;

        if (control && control.invalid && (control.touched || control.dirty)) {
            const errors = control.errors;
            if (errors) {
                const firstErrorKey = Object.keys(errors)[0];
                return this.errors()[firstErrorKey] || `Error: ${firstErrorKey}`;
            }
        }
        return null;
    }

    onChange: (value: any) => void = () => { };
    onTouched: () => void = () => { };

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

    onBlur(): void {
        this.onTouched();
    }

    togglePasswordVisibility(): void {
        this.showPassword.update(v => !v);
    }
}
