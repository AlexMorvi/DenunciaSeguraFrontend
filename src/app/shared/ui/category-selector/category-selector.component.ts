import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, forwardRef, signal, input } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

interface CategoryOption {
    value: string;
    label: string;
    icon: IconDefinition;
    colorClass: string;
}

@Component({
    selector: 'app-category-selector',
    standalone: true,
    imports: [CommonModule, FormsModule, FontAwesomeModule],
    templateUrl: './category-selector.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CategorySelectorComponent),
            multi: true
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategorySelectorComponent implements ControlValueAccessor {
    selectedCategory = signal<string | null>(null);

    private onChange: (value: string | null) => void = () => undefined;
    private onTouched: () => void = () => undefined;

    // Now the list of categories is provided by the parent component.
    // Use Angular's `input()` signal so the parent can pass any CategoryOption[] dynamically.
    readonly categories = input<CategoryOption[]>([]);

    protected readonly faCheckCircle = faCheckCircle;

    writeValue(obj: string | null): void {
        this.selectedCategory.set(obj);
    }

    registerOnChange(fn: (value: string | null) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    updateSelection(val: string) {
        this.selectedCategory.set(val);
        this.onChange(val);
        this.onTouched();
    }
} 
