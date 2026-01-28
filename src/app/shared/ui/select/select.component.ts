import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl, ReactiveFormsModule } from '@angular/forms';

interface OptionObject { id?: number | string; value?: number | string; label?: string }

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
    placeholder = input<string>('Seleccione una opción');
    options = input.required<(string | Record<string, any>)[]>();

    private formatOptionLabel(option: string): string {
        if (option.includes(' ') || !option.includes('_')) {
            return option;
        }

        return option.replace(/_/g, ' ');
    }

    // TODO: Eliminar este computed y obtener los operadores del back
    optionPairs = computed(() => {
        console.log('Opciones de anonimato (debug):', this.options());
        return this.options().map(opt => {
            if (typeof opt === 'string') {
                return { value: opt, label: this.formatOptionLabel(opt) };
            }

            const o = opt as OptionObject;
            const value = o.value ?? (o.id !== undefined ? String(o.id) : String(o));
            const label = o.label ?? this.formatOptionLabel(String(value));
            return { value, label };
        })
    });
    value = signal<string>('');
    disabled = signal(false);

    constructor() {
        if (this.ngControl) {
            this.ngControl.valueAccessor = this;
        }
    }

    onChange: (value: string) => void = (value: string) => { void value; };
    onTouched: () => void = () => undefined;

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
