import { Component, input, output, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapViewerComponent } from '@/app/shared/map-viewer/map-viewer.component';
import { SubmitButtonComponent } from '@/app/shared/submit-button/submit-button.component';
import { Denuncia } from '@/app/features/ciudadano/dashboard/denuncia.interface';
import { DenunciaService } from '@/app/features/ciudadano/dashboard/denuncia.service';

@Component({
    selector: 'app-denuncias-table',
    standalone: true,
    imports: [CommonModule, FormsModule, MapViewerComponent, SubmitButtonComponent],
    templateUrl: './denuncias-table.component.html',
})
export class DenunciasTableComponent {
    denuncias = input.required<Denuncia[]>();
    showCreateButton = input<boolean>(true);
    onCreate = output<void>();

    searchText = signal('');
    expandedId = signal<number | null>(null);

    filteredDenuncias = computed(() => {
        const term = this.searchText().toLowerCase();
        const list = this.denuncias();

        if (!term) return list;

        return list.filter(d =>
            d.titulo.toLowerCase().includes(term) ||
            d.categoria.toLowerCase().includes(term)
        );
    });

    toggleDetail(id: number) {
        this.expandedId.update(curr => curr === id ? null : id);
    }

    getStatusClasses(estado: string): string {
        const base = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
        const colors: Record<string, string> = {
            'PENDIENTE': 'bg-yellow-100 text-yellow-800',
            'EN_PROCESO': 'bg-blue-100 text-blue-800',
            'RESUELTO': 'bg-green-100 text-green-800',
            'RECHAZADO': 'bg-red-100 text-red-800'
        };
        return `${base} ${colors[estado] || 'bg-gray-100 text-gray-800'}`;
    }
}
