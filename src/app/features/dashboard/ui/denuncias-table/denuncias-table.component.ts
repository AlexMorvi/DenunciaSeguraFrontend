import { Component, input, output, signal, computed } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { SubmitButtonComponent } from '@/shared/ui/submit-button/submit-button.component';
import { InputComponent } from '@/shared/ui/input/input.component';
import { InputErrorComponent } from '@/shared/ui/input-error/input-error.component';
import { DenunciaCitizenViewResponse as Denuncia, EstadoDenunciaEnum } from '@/core/api/denuncias/models';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch, faPlus, faChevronDown, faChevronUp, faMapMarkerAlt, faCalendarAlt, faInfoCircle, faImage, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

const SEARCH_PATTERN = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\.\_]*$/;

@Component({
    selector: 'app-denuncias-table',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, SubmitButtonComponent, FontAwesomeModule, InputComponent, InputErrorComponent],
    templateUrl: './denuncias-table.component.html',
})
export class DenunciasTableComponent {
    protected readonly faSearch = faSearch;
    protected readonly faPlus = faPlus;
    protected readonly faChevronDown = faChevronDown;
    protected readonly faChevronUp = faChevronUp;
    protected readonly faMapMarkerAlt = faMapMarkerAlt;
    protected readonly faCalendarAlt = faCalendarAlt;
    protected readonly faInfoCircle = faInfoCircle;
    protected readonly faImage = faImage;
    protected readonly faFileAlt = faFileAlt;

    denuncias = input.required<Denuncia[]>();

    showCreateButton = input(true);

    onCreate = output<void>();

    expandedId = signal<number | null>(null);
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
        const list = this.denuncias();

        if (!term) return list;

        return list.filter(d =>
            (d.titulo ?? '').toLowerCase().includes(term) ||
            (d.descripcion ?? '').toLowerCase().includes(term)
        );
    });

    toggleDetail(id?: number) {
        if (id == null) return;
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

    // TODO: No utilizar any, sino el tipo de openapi correcto
    getLat(denuncia: any): string {
        const v = denuncia?.latitud ?? denuncia?.latitude ?? null;
        return v != null ? String(v) : '-';
    }

    getLng(denuncia: any): string {
        const v = denuncia?.longitud ?? denuncia?.longitude ?? null;
        return v != null ? String(v) : '-';
    }

    getFechaFormatted(denuncia: any): string {
        const val = denuncia?.fechaCreacion ?? denuncia?.createdAt ?? denuncia?.created_at ?? null;
        if (!val) return '-';
        try {
            const d = new Date(val);
            const fmt = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            return fmt.format(d);
        } catch (err) {
            return String(val);
        }
    }
}
