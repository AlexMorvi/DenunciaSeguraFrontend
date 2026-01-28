import { CommonModule } from '@angular/common';
import { FileUploadErrorEvent } from '@/core/model/file-upload.event';
import { afterNextRender, Component, ElementRef, inject, OnDestroy, signal, viewChild, ViewEncapsulation, computed } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import * as L from 'leaflet';
import { CategoriaDenunciaEnum } from '@/core/api/denuncias/models/categoria-denuncia-enum';
import { NivelAnonimatoEnum } from '@/core/api/denuncias/models/nivel-anonimato-enum';
import { IconDefinition, faRoad, faLightbulb, faTrashAlt, faTint, faSeedling, faEllipsisH, faMapMarkerAlt, faInfoCircle, faPaperPlane, faTimes } from '@fortawesome/free-solid-svg-icons';
import { DenunciaFacade, CreacionDenunciaData } from '@/data/services/denuncia.facade';
import { AuthFacade } from '@/data/services/auth.facade';
import { CategorySelectorComponent } from '@/shared/ui/category-selector/category-selector.component';
import { FileUploadComponent } from '@/shared/ui/file-upload/file-upload.component';
import { SelectComponent } from '@/shared/ui/select/select.component';
import { SubmitButtonComponent } from '@/shared/ui/submit-button/submit-button.component';
import { ToastService } from '@/core/service/toast/toast.service';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { InputComponent } from '@/shared/ui/input/input.component';
import { UiStyleDirective } from "@/shared/style/ui-styles.directive";

const DEFAULT_ZOOM = 13;
const DEFAULT_COORDS = { lat: -0.1807, lng: -78.4678 }; // Quito
const FOCUSED_ZOOM = 15;

const ICON_RED_CONFIG = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

@Component({
    selector: 'app-crear-denuncia',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, SubmitButtonComponent, FileUploadComponent, CategorySelectorComponent, SelectComponent, FontAwesomeModule, InputComponent, UiStyleDirective],
    templateUrl: './crear-denuncia.page.html',
    styleUrls: ['./crear-denuncia.page.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CrearDenunciaComponent implements OnDestroy {
    protected readonly faMapMarkerAlt = faMapMarkerAlt;
    protected readonly faInfoCircle = faInfoCircle;
    protected readonly faPaperPlane = faPaperPlane;
    protected readonly faTimes = faTimes;

    private readonly toast = inject(ToastService);
    private readonly router = inject(Router);

    evidencias = signal<File[]>([]);

    private readonly fb = inject(FormBuilder);
    private readonly facade = inject(DenunciaFacade);
    private readonly authFacade = inject(AuthFacade);

    private readonly mapContainer = viewChild.required<ElementRef>('mapContainer');
    private readonly scrollArea = viewChild.required<ElementRef>('scrollArea');

    readonly isLoading = this.facade.loading;
    readonly errorMessage = this.facade.error;

    readonly imagePreview = signal<string | null>(null);
    readonly selectedFile = signal<File | null>(null);
    readonly currentCoords = signal<{ lat: number; lng: number } | null>(null);

    readonly listadoCategorias: { value: CategoriaDenunciaEnum; label: string; icon: IconDefinition; colorClass: string }[] = [
        { value: 'VIALIDAD', label: 'Bacheo / Vialidad', icon: faRoad, colorClass: 'text-primary' },
        { value: 'ILUMINACION', label: 'Alumbrado', icon: faLightbulb, colorClass: 'text-yellow-500' },
        { value: 'SANIDAD', label: 'Basura / Limpieza', icon: faTrashAlt, colorClass: 'text-green-500' },
        { value: 'AGUA', label: 'Agua', icon: faTint, colorClass: 'text-blue-500' },
        { value: 'JARDINERIA', label: 'Jardinería', icon: faSeedling, colorClass: 'text-emerald-500' },
        { value: 'OTROS', label: 'Otro', icon: faEllipsisH, colorClass: 'text-purple-500' }
    ];
    readonly listadoAnonimato = computed(() => {
        const user = this.authFacade.currentUser();
        if (user?.aliasPublico) {
            return ['PSEUDOANONIMO', 'REAL'];
        }
        return ['REAL'];
    });

    private map: L.Map | undefined;
    private marker: L.Marker | undefined;

    readonly form = this.fb.nonNullable.group({
        titulo: this.fb.nonNullable.control('', [
            Validators.required,
            Validators.minLength(5),
            Validators.maxLength(100)
        ]),
        descripcion: this.fb.nonNullable.control('', [
            Validators.required,
            Validators.minLength(10),
            Validators.maxLength(500)
        ]),
        categoriaDenuncia: new FormControl<CategoriaDenunciaEnum | null>(null, {
            validators: [Validators.required]
        }),
        nivelAnonimato: new FormControl<NivelAnonimatoEnum | null>(null, {
            validators: [Validators.required]
        }),
        latitud: new FormControl<number | null>(null, {
            validators: [Validators.required]
        }),
        longitud: new FormControl<number | null>(null, {
            validators: [Validators.required]
        }),
    });

    async guardarDenuncia() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const rawData = this.form.getRawValue();

        const request: CreacionDenunciaData = {
            titulo: rawData.titulo.trim(),
            descripcion: rawData.descripcion.trim(),
            categoriaDenuncia: rawData.categoriaDenuncia!,
            nivelAnonimato: rawData.nivelAnonimato!,
            latitud: rawData.latitud!,
            longitud: rawData.longitud!
        };

        if (this.evidencias().length > 0) {
            request.archivos = this.evidencias();
        }

        try {
            await this.facade.crearDenuncia(request);

            this.toast.showSuccess('Denuncia enviada', 'Su denuncia ha sido registrada correctamente.');
            await this.router.navigate(['/dashboard']);
        } catch {
            this.toast.showError("No pudimos procesar su solicitud. Por favor, intente nuevamente más tarde.");
        }
    }

    uploadEvidenceStrategy = (_file: File): Promise<string> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(crypto.randomUUID()), 1000);
        });
    }

    constructor() {
        afterNextRender(() => {
            this.scrollArea().nativeElement.scrollTop = 0;
            this.inicializarMapaSeguro();
            this.localizarUsuario();
        });
    }

    ngOnDestroy(): void {
        if (this.map) {
            this.map.remove();
        }
    }

    // =================================================================
    // LÓGICA DE MAPA Y GEOLOCALIZACIÓN
    // =================================================================
    private inicializarMapaSeguro(): void {
        try {
            const container = this.mapContainer().nativeElement;
            if (!container) throw new Error('Contenedor del mapa no encontrado en el DOM.');

            this.map = L.map(container).setView([DEFAULT_COORDS.lat, DEFAULT_COORDS.lng], DEFAULT_ZOOM);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(this.map);


            this.map.on('click', (e: L.LeafletMouseEvent) => {
                this.actualizarMarcador(e.latlng.lat, e.latlng.lng);
            });

        } catch {
            this.toast.showError("No se pudo cargar el mapa interactivo.");
        }
    }

    private localizarUsuario(): void {
        if (!navigator.geolocation) {
            this.toast.showError('Su navegador no soporta geolocalización.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                this.map?.setView([latitude, longitude], FOCUSED_ZOOM);
                this.actualizarMarcador(latitude, longitude);
            },
            () => {
                this.toast.showWarning('Puede seleccionar la ubicación manualmente en el mapa.');
            }
        );
    }

    private actualizarMarcador(lat: number, lng: number): void {
        if (!this.map) return;

        if (this.marker) {
            this.marker.setLatLng([lat, lng]);
        } else {
            this.marker = L.marker([lat, lng], {
                draggable: true,
                icon: ICON_RED_CONFIG
            }).addTo(this.map);

            this.marker.on('dragend', (event) => {
                const position = event.target.getLatLng();
                this.sincronizarCoordenadasFormulario(position.lat, position.lng);
            });
        }

        this.sincronizarCoordenadasFormulario(lat, lng);
    }

    private sincronizarCoordenadasFormulario(lat: number, lng: number): void {
        const latFixed = Number.parseFloat(lat.toFixed(6));
        const lngFixed = Number.parseFloat(lng.toFixed(6));

        this.currentCoords.set({ lat: latFixed, lng: lngFixed });
        this.form.patchValue({ latitud: latFixed, longitud: lngFixed });
        this.form.get('latitud')?.markAsTouched();
    }

    handleUploadError(event: FileUploadErrorEvent) {
        this.toast.showWarning(event.userMessage);
    }
} 
