import { Component, input, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { DenunciaListadoResponse, EstadoDenunciaEnum } from '@/core/api/denuncias/models';
import { ESTADOS_UI_OPTIONS, ESTADO_BADGE_CLASSES } from '@/shared/constants/estados.const';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch, faChevronDown, faCalendarAlt, faInfoCircle, faImage, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthFacade } from '@/data/services/auth.facade';
import { ROLES } from '@/shared/constants/roles.const';

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
    private readonly authFacade = inject(AuthFacade);

    protected readonly faSearch = faSearch;
    protected readonly faChevronDown = faChevronDown;
    protected readonly faCalendarAlt = faCalendarAlt;
    protected readonly faInfoCircle = faInfoCircle;
    protected readonly faImage = faImage;
    protected readonly faFileAlt = faFileAlt;

    denuncias = input.required<DenunciaListadoResponse[]>();

    filterStatus = signal<FilterStatusType>(null);
    filterOtros = signal<boolean>(false);

    isSupervisor = computed(() => this.authFacade.currentUser()?.rol === ROLES.SUPERVISOR);

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

    filteredDenuncias = computed(() => {
        const term = this.searchText().toLowerCase();
        const status = this.filterStatus();
        const otros = this.filterOtros();
        const list = this.denuncias();

        if (!term && !status && !otros) return list;

        return list.filter(d => {
            const matchesText = !term ||
                (d.titulo ?? '').toLowerCase().includes(term);

            const matchesStatus = this.checkStatusMatch(d.estadoDenuncia as EstadoDenunciaEnum, status);
            const matchesOtros = !otros || d.categoriaDenuncia === 'OTROS';

            return matchesText && matchesStatus && matchesOtros;
        });
    });

    toggleOtrosFilter() {
        this.filterOtros.update(v => !v);
    }

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

    navigateToDenuncia(id?: number | null) {
        if (typeof id !== 'number' || !Number.isFinite(id) || id <= 0) return;
        this.router.navigate(['/denuncias', id]);
    }

    getStatusClasses(estado?: EstadoDenunciaEnum | null): string {
        const base = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';

        if (!estado) return `${base} bg-gray-100 text-gray-800`;

        return `${base} ${ESTADO_BADGE_CLASSES[estado] || 'bg-gray-100 text-gray-800'}`;
    }

    getFechaFormatted(value?: string | null): string {
        if (!value) return '-';
        try {
            const d = new Date(value);
            const fmt = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            return fmt.format(d);
        } catch {
            return String(value);
        }
    }

    getEntidadLabel(entidad?: string | null): string {
        if (!entidad) return '-';
        const map: Record<string, string> = {
            'MUNICIPIO': 'Municipio',
            'EMPRESA_ELECTRICA': 'Empresa Eléctrica',
            'EMPRESA_AGUA_POTABLE': 'Empresa de Agua Potable'
        };
        return map[entidad] || entidad;
    }

    getCategoriaLabel(categoria?: string | null): string {
        if (!categoria) return '-';
        const map: Record<string, string> = {
            'VIALIDAD': 'Vialidad',
            'SANIDAD': 'Sanidad',
            'ILUMINACION': 'Iluminación',
            'JARDINERIA': 'Jardinería',
            'AGUA': 'Agua Potable',
            'OTROS': 'Otros'
        };
        return map[categoria] || categoria;
    }
}
