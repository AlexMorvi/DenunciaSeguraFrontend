import { CommonModule } from '@angular/common';
import { Component, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import type { CategoriaEnum } from '@/core/api/denuncias/models/categoria-enum';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition, faRoad, faLightbulb, faTrashAlt, faShieldAlt, faTint, faSeedling, faEllipsisH, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

interface CategoryOption {
    value: CategoriaEnum;
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
    ]
})
export class CategorySelectorComponent implements ControlValueAccessor {
    selectedCategory = signal<CategoriaEnum | null>(null);

    private onChange: (value: CategoriaEnum | null) => void = () => { };
    private onTouched: () => void = () => { };

    readonly categories: CategoryOption[] = [
        { value: 'VIALIDAD', label: 'Bacheo / Vialidad', icon: faRoad, colorClass: 'text-primary' },
        { value: 'ILUMINACION', label: 'Alumbrado', icon: faLightbulb, colorClass: 'text-yellow-500' },
        { value: 'SANIDAD', label: 'Basura / Limpieza', icon: faTrashAlt, colorClass: 'text-green-500' },
        { value: 'SEGURIDAD', label: 'Seguridad', icon: faShieldAlt, colorClass: 'text-red-500' },
        { value: 'AGUA', label: 'Agua', icon: faTint, colorClass: 'text-blue-500' },
        { value: 'JARDINERIA', label: 'Jardinería', icon: faSeedling, colorClass: 'text-emerald-500' },
        { value: 'OTROS', label: 'Otro', icon: faEllipsisH, colorClass: 'text-purple-500' }
    ];

    protected readonly faCheckCircle = faCheckCircle;

    writeValue(obj: CategoriaEnum | null): void {
        this.selectedCategory.set(obj);
    }

    registerOnChange(fn: (value: CategoriaEnum | null) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    updateSelection(val: CategoriaEnum) {
        this.selectedCategory.set(val);
        this.onChange(val);
        this.onTouched();
    }
} 
