import { CommonModule } from '@angular/common';
import { Component, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import type { CategoriaEnum } from '@/core/api/denuncias/models/categoria-enum';

// Definimos una interfaz para tipar nuestros datos
interface CategoryOption {
    value: CategoriaEnum; // <--- Aquí está la magia de la seguridad
    label: string;
    icon: string;
    colorClass: string;
}

@Component({
    selector: 'app-category-selector',
    standalone: true,
    imports: [CommonModule, FormsModule],
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
        { value: 'VIALIDAD', label: 'Bacheo / Vialidad', icon: 'fa-road', colorClass: 'text-primary' },
        { value: 'ILUMINACION', label: 'Alumbrado', icon: 'fa-lightbulb', colorClass: 'text-yellow-500' },
        { value: 'SANIDAD', label: 'Basura / Limpieza', icon: 'fa-trash-alt', colorClass: 'text-green-500' },
        { value: 'SEGURIDAD', label: 'Seguridad', icon: 'fa-shield-alt', colorClass: 'text-red-500' },
        { value: 'AGUA', label: 'Agua', icon: 'fa-tint', colorClass: 'text-blue-500' },
        { value: 'JARDINERIA', label: 'Jardinería', icon: 'fa-seedling', colorClass: 'text-emerald-500' },
        { value: 'OTROS', label: 'Otro', icon: 'fa-ellipsis-h', colorClass: 'text-purple-500' }
    ];

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
