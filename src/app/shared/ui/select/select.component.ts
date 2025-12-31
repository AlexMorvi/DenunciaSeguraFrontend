import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-select',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    templateUrl: './select.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectComponent implements ControlValueAccessor {
    public ngControl = inject(NgControl, { self: true, optional: true });

    id = input.required<string>();
    label = input.required<string>();
    placeholder = input<string>('Seleccione una opción');
    options = input.required<string[]>();
    customErrors = input<Record<string, string>>({}, { alias: 'errors' });

    // Options as pairs: keep original value, and a formatted label for display
    private formatOptionLabel(option: string): string {
        // Si ya tiene espacios o no tiene guiones bajos, asumimos que el texto ya está formateado
        if (option.includes(' ') || !option.includes('_')) {
            return option;
        }

        // Caso típico: valores en SNAKE_CASE → reemplazamos "_" por espacios
        return option.replace(/_/g, ' ');
    }

    optionPairs = computed(() => this.options().map(opt => ({
        value: opt,
        label: this.formatOptionLabel(opt)
    })));
    value = signal<string>('');
    disabled = signal(false);

    constructor() {
        if (this.ngControl) {
            this.ngControl.valueAccessor = this;
        }
    }

    onChange: (value: string) => void = () => { };
    onTouched: () => void = () => { };

    writeValue(val: string): void {
        this.value.set(val);
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

    onChanged(event: Event) {
        const val = (event.target as HTMLSelectElement).value;
        this.value.set(val);
        this.onChange(val);
    }

    onBlurred() {
        this.onTouched();
    }

    showError = computed(() => {
        const control = this.ngControl?.control;
        return !!(control && control.invalid && (control.touched || control.dirty));
    });
}
