import { CommonModule } from '@angular/common';
import { afterNextRender, Component, ElementRef, inject, OnDestroy, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import * as L from 'leaflet';
import { CategoriaEnum } from '@/core/api/denuncias/models/categoria-enum';
import { CATEGORIA_ENUM } from '@/core/api/denuncias/models/categoria-enum-array';
import { CrearDenunciaRequest } from '@/core/api/denuncias/models/crear-denuncia-request';
import { NivelAnonimatoEnum } from '@/core/api/denuncias/models/nivel-anonimato-enum';
import { NIVEL_ANONIMATO_ENUM } from '@/core/api/denuncias/models/nivel-anonimato-enum-array';
import {
    DenunciaSubmissionError,
    FormValidationError,
    GeolocationError,
    MapInitializationError,
} from '@/core/errors/create-denuncia.errors';
import { DenunciaFacade } from '@/data/services/denuncia.facade';
import { CategorySelectorComponent } from '@/shared/ui/category-selector/category-selector.component';
import { FileUploadComponent } from '@/shared/ui/file-upload/file-upload.component';
import { SubmitButtonComponent } from '@/shared/ui/submit-button/submit-button.component';
import { ToastService } from '@/core/service/toast.service';
import { LoggerService } from '@/core/service/logger.service';
import { Router } from '@angular/router';

const DEFAULT_COORDS = { lat: -0.1807, lng: -78.4678 }; // Quito
const DEFAULT_ZOOM = 13;
const FOCUSED_ZOOM = 15;

// Configuración de iconos Leaflet (fuera de la clase para no recrear)
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
    imports: [ReactiveFormsModule, CommonModule, SubmitButtonComponent, FileUploadComponent, CategorySelectorComponent],
    templateUrl: './crear-denuncia.page.html',
    styleUrls: ['./crear-denuncia.page.scss']
})
export class CrearDenunciaComponent implements OnDestroy {
    private toast = inject(ToastService);
    private logger = inject(LoggerService);
    private router = inject(Router);

    evidencias = signal<File[]>([]);

    handleUploadError(errorMessage: string) {
        this.toast.showWarning(errorMessage);
        // TODO: Loguear el error de forma adecuada
        this.logger.error('Intento de subida fallido en formulario de denuncia', {
            error: errorMessage,
            timestamp: new Date().toISOString()
        });
    }

    async guardarDenuncia() {
        this.localError.set(null);

        try {
            if (this.form.invalid) {
                this.form.markAllAsTouched();
                const invalidFields = Object.keys(this.form.controls).filter(key => this.form.get(key)?.invalid);
                throw new FormValidationError('Por favor, complete todos los campos obligatorios correctamente.', invalidFields);
            }

            const rawData = this.form.getRawValue();

            const request: CrearDenunciaRequest = {
                titulo: rawData.titulo!.trim(),
                descripcion: rawData.descripcion!.trim(),
                categoria: rawData.categoria!,
                nivelAnonimato: rawData.nivelAnonimato!,
                latitud: rawData.latitud!,
                longitud: rawData.longitud!,
            };

            await this.facade.crearDenuncia(request, this.evidencias());
            this.toast.showSuccess('Denuncia enviada', 'Su denuncia ha sido registrada correctamente.');
            await this.router.navigate(['/ciudadano/dashboard']);
        } catch (error) {
            // TODO: Loggear correctamente el error (utilizando el logger)
            this.logger.error('Error al crear denuncia', error);
            this.toast.showError("No pudimos procesar su solicitud. Por favor, intente nuevamente más tarde.");
        }
    }
    private readonly fb = inject(FormBuilder);
    private readonly facade = inject(DenunciaFacade);

    private readonly mapContainer = viewChild.required<ElementRef>('mapContainer');
    private readonly scrollArea = viewChild.required<ElementRef>('scrollArea');

    readonly isLoading = this.facade.loading;
    readonly errorMessage = this.facade.error;

    readonly imagePreview = signal<string | null>(null);
    readonly selectedFile = signal<File | null>(null);
    readonly currentCoords = signal<{ lat: number; lng: number } | null>(null);
    readonly localError = signal<string | null>(null);

    readonly listadoCategorias = CATEGORIA_ENUM;
    readonly listadoAnonimato = NIVEL_ANONIMATO_ENUM;

    private map: L.Map | undefined;
    private marker: L.Marker | undefined;

    readonly form = this.fb.group({
        titulo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
        descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
        categoria: [null as CategoriaEnum | null, [Validators.required]],
        // INFO: Para establecer una categoría por defecto
        // categoria: ['VIALIDAD' as CategoriaEnum, [Validators.required]],
        nivelAnonimato: ['REAL' as NivelAnonimatoEnum, [Validators.required]],
        latitud: [null as number | null, Validators.required],
        longitud: [null as number | null, Validators.required],
        evidenciaIds: []
    });

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

            L.Marker.prototype.options.icon = ICON_RED_CONFIG;

            this.map.on('click', (e: L.LeafletMouseEvent) => {
                this.actualizarMarcador(e.latlng.lat, e.latlng.lng);
            });

        } catch (error) {
            const mapError = new MapInitializationError('No se pudo cargar el mapa interactivo.', error);
            this.localError.set(mapError.message);
        }
    }

    private localizarUsuario(): void {
        if (!navigator.geolocation) {
            this.localError.set('Su navegador no soporta geolocalización.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                this.map?.setView([latitude, longitude], FOCUSED_ZOOM);
                this.actualizarMarcador(latitude, longitude);
            },
            (err) => {
                const geoError = new GeolocationError('Permiso de ubicación denegado o error de GPS.', err.code, err);
            }
        );
    }

    private actualizarMarcador(lat: number, lng: number): void {
        if (!this.map) return;

        if (!this.marker) {
            this.marker = L.marker([lat, lng], { draggable: true }).addTo(this.map);
            this.marker.on('dragend', (event) => {
                const position = event.target.getLatLng();
                this.sincronizarCoordenadasFormulario(position.lat, position.lng);
            });
        } else {
            this.marker.setLatLng([lat, lng]);
        }

        this.sincronizarCoordenadasFormulario(lat, lng);
    }

    private sincronizarCoordenadasFormulario(lat: number, lng: number): void {
        const latFixed = parseFloat(lat.toFixed(6));
        const lngFixed = parseFloat(lng.toFixed(6));

        this.currentCoords.set({ lat: latFixed, lng: lngFixed });
        this.form.patchValue({ latitud: latFixed, longitud: lngFixed });
        this.form.get('latitud')?.markAsTouched();
    }

    /*     // =================================================================
        // MANEJO DE ARCHIVOS (OWASP: Validación estricta)
        // =================================================================
    
        onFileSelected(event: Event): void {
            this.localError.set(null); // Limpiar errores previos
            const input = event.target as HTMLInputElement;
    
            if (!input.files || input.files.length === 0) return;
    
            const file = input.files[0];
    
            try {
                this.validarArchivo(file);
                this.procesarPrevisualizacion(file);
                this.selectedFile.set(file);
            } catch (error) {
                // Limpiamos el input para que el usuario pueda seleccionar otro
                input.value = '';
                this.selectedFile.set(null);
                this.imagePreview.set(null);
    
                if (error instanceof FileTooLargeError || error instanceof UnsupportedFileTypeError) {
                    this.localError.set(error.message);
                } else {
                    this.localError.set('Error al procesar el archivo.');
                }
            }
        }
    
        private validarArchivo(file: File): void {
            // 1. Validación de Tamaño
            if (file.size > MAX_FILE_SIZE_BYTES) {
                throw new FileTooLargeError(
                    `El archivo excede el tamaño máximo permitido de ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB.`,
                    MAX_FILE_SIZE_BYTES,
                    file.size
                );
            }
    
            // 2. Validación de Tipo (MIME Type)
            if (!ALLOWED_MIME_TYPES.includes(file.type)) {
                throw new UnsupportedFileTypeError(
                    `Formato de archivo no soportado. Tipos permitidos: ${ALLOWED_MIME_TYPES.join(', ')}`,
                    ALLOWED_MIME_TYPES,
                    file.type
                );
            }
        }
    
        private procesarPrevisualizacion(file: File): void {
            const reader = new FileReader();
            reader.onload = (e) => {
                // Sanitización básica: confiamos en que Angular sanitiza el src en el template,
                // pero validamos que sea un string
                const result = e.target?.result;
                if (typeof result === 'string') {
                    this.imagePreview.set(result);
                }
            };
            reader.readAsDataURL(file);
        }
    
        // Limpia la imagen seleccionada actualmente (usado por la plantilla)
        removeSelectedImage(): void {
            this.selectedFile.set(null);
            this.imagePreview.set(null);
            this.localError.set(null);
        }
    
        // Exponer tamaño máximo de archivo a la plantilla en MB
        get maxFileSizeMB(): number {
            return Math.round(MAX_FILE_SIZE_BYTES / 1024 / 1024);
        }
     */
    // =================================================================
    // ENVÍO DEL FORMULARIO
    // =================================================================
}
