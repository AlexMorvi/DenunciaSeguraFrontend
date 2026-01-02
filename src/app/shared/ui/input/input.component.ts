import { Component, input, signal, forwardRef, computed } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { faEye, faEyeSlash, faCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-input',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
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
    control = input<FormControl | null>(null);
    errors = input<Record<string, string>>({});

    showPassword = signal(false);
    value = signal('');
    disabled = signal(false);

    private onChange: (value: string) => void = () => { };
    private onTouched: () => void = () => { };

    protected readonly faEye = faEye;
    protected readonly faEyeSlash = faEyeSlash;
    protected readonly faDefault: IconDefinition = faCircle;

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

    onInput(event: Event): void {
        const target = event.target as HTMLInputElement | HTMLTextAreaElement;
        this.value.set(target.value);
        this.onChange(target.value);
    }

    onBlur(): void {
        this.onTouched();
    }

    togglePasswordVisibility(): void {
        this.showPassword.update(v => !v);
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
