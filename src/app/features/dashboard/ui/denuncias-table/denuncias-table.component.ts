import { Component, input, computed, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { DenunciaResponse as Denuncia, EstadoDenunciaEnum } from '@/core/api/denuncias/models';
import { ESTADOS_UI_OPTIONS } from '@/shared/constants/estados.const';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch, faChevronDown, faCalendarAlt, faInfoCircle, faImage, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

const SEARCH_PATTERN = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-._]*$/;
export type FilterStatusType = EstadoDenunciaEnum | EstadoDenunciaEnum[] | null;

@Component({
    selector: 'app-denuncias-table',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, FontAwesomeModule],
    templateUrl: './denuncias-table.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DenunciasTableComponent {
    private readonly router = inject(Router);

    protected readonly faSearch = faSearch;
    protected readonly faChevronDown = faChevronDown;
    protected readonly faCalendarAlt = faCalendarAlt;
    protected readonly faInfoCircle = faInfoCircle;
    protected readonly faImage = faImage;
    protected readonly faFileAlt = faFileAlt;

    denuncias = input.required<Denuncia[]>();

    filterStatus = signal<FilterStatusType>(null);

    readonly filterOptions = ESTADOS_UI_OPTIONS;

    searchControl = new FormControl('', {
        nonNullable: true,
        validators: [
            Validators.maxLength(100),
            Validators.pattern(SEARCH_PATTERN)
        ]
    });

    searchText = toSignal(
        this.searchControl.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ),
        { initialValue: '' }
    );

    // filteredDenuncias = computed(() => {
    //     const term = this.searchText().toLowerCase();
    //     const status = this.filterStatus();
    //     const list = this.denuncias();

    //     if (!term && !status) return list;

    //     return list.filter(d => {
    //         const matchesText = !term ||
    //             (d.titulo ?? '').toLowerCase().includes(term) ||
    //             (d.descripcion ?? '').toLowerCase().includes(term);

    //         const matchesStatus = this.checkStatusMatch(d.estado as EstadoDenunciaEnum, status);

    //         return matchesText && matchesStatus;
    //     });
    // });

    private checkStatusMatch(denunciaEstado: EstadoDenunciaEnum, currentFilter: FilterStatusType): boolean {
        if (!currentFilter) return true;

        if (Array.isArray(currentFilter)) {
            return currentFilter.includes(denunciaEstado);
        }

        return denunciaEstado === currentFilter;
    }

    setFilter(status: FilterStatusType) {
        if (this.isFilterActive(status)) {
            this.filterStatus.set(null);
        } else {
            this.filterStatus.set(status);
        }
    }

    isFilterActive(status: FilterStatusType): boolean {
        const current = this.filterStatus();

        if (Array.isArray(status) && Array.isArray(current)) {
            const sortedStatus = [...status].sort((a, b) => a.localeCompare(b));
            const sortedCurrent = [...current].sort((a, b) => a.localeCompare(b));

            return JSON.stringify(sortedStatus) === JSON.stringify(sortedCurrent);
        }

        return current === status;
    }

    // TODO: Arreglar el tipo del id
    navigateToDenuncia(id?: number | null | undefined) {
        if (typeof id !== 'number' || !Number.isFinite(id) || id <= 0) return;
        this.router.navigate(['/denuncias', id]);
    }

    getStatusClasses(estado?: EstadoDenunciaEnum | null): string {
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

    // TODO: eliminar los any
    getLat(denuncia: any): string {
        const v = denuncia?.latitud ?? denuncia?.latitude ?? null;
        return v == null ? '-' : String(v);
    }

    getLng(denuncia: any): string {
        const v = denuncia?.longitud ?? denuncia?.longitude ?? null;
        return v == null ? '-' : String(v);
    }

    // TODO: No utilizar any, sino el tipo de openapi correcto
    getFechaFormatted(denuncia: any): string {
        const val = denuncia?.fechaCreacion ?? denuncia?.createdAt ?? denuncia?.created_at ?? null;
        if (!val) return '-';
        try {
            const d = new Date(val);
            const fmt = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            return fmt.format(d);
        } catch {
            return String(val);
        }
    }
}
