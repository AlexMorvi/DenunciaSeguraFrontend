import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubmitButtonComponent } from '@/app/shared/submit-button/submit-button.component';
import { DenunciaCitizenViewResponse as Denuncia, EstadoDenunciaEnum } from '@/app/core/api/denuncias/models';

@Component({
    selector: 'app-denuncias-table',
    standalone: true,
    // imports: [CommonModule, FormsModule, MapViewerComponent, SubmitButtonComponent],
    imports: [CommonModule, FormsModule, SubmitButtonComponent],
    templateUrl: './denuncias-table.component.html',
})
export class DenunciasTableComponent {
    @Input() denuncias: Denuncia[] = [];
    @Input() showCreateButton = true;
    @Output() onCreate = new EventEmitter<void>();

    searchText = signal('');
    expandedId = signal<number | null>(null);

    filteredDenuncias = computed(() => {
        const term = this.searchText().toLowerCase();
        const list = this.denuncias || [];

        if (!term) return list;

        return list.filter(d =>
            (d.titulo ?? '').toLowerCase().includes(term) ||
            (d.descripcion ?? '').toLowerCase().includes(term)
        );
    });

    toggleDetail(id?: number) {
        if (id == null) return; // evita undefined/null
        this.expandedId.update(curr => curr === id ? null : id);
    }

    getStatusClasses(estado?: EstadoDenunciaEnum | string | null): string {
        const base = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
        const colors: Record<string, string> = {
            'RECIBIDA': 'bg-yellow-100 text-yellow-800',
            'ASIGNADA': 'bg-indigo-100 text-indigo-800',
            'EN_PROCESO': 'bg-blue-100 text-blue-800',
            'EN_VALIDACION': 'bg-purple-100 text-purple-800',
            'RESUELTA': 'bg-green-100 text-green-800',
            'RECHAZADA': 'bg-red-100 text-red-800'
        };

        if (!estado) return `${base} bg-gray-100 text-gray-800`;

        return `${base} ${colors[estado] || 'bg-gray-100 text-gray-800'}`;
    }

    shouldShowCreateButton(): boolean {
        return !!this.showCreateButton;
    }
}
