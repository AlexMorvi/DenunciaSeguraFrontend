import { Component, ElementRef, inject, signal, viewChild, afterNextRender, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DenunciaFacade } from '@/app/data/services/denuncia.facade';
import { HeaderComponent } from '@/app/shared/header/header.component';
import { SidebarComponent } from '@/app/shared/sidebar/sidebar.component';
import { SubmitButtonComponent } from '@/app/shared/submit-button/submit-button.component';

// Modelos y Constantes
import { CrearDenunciaRequest } from '@/app/core/api/denuncias/models/crear-denuncia-request';
import { CategoriaEnum } from '@/app/core/api/denuncias/models/categoria-enum';
import { NivelAnonimatoEnum } from '@/app/core/api/denuncias/models/nivel-anonimato-enum';
import { CATEGORIA_ENUM } from '@/app/core/api/denuncias/models/categoria-enum-array';
import { NIVEL_ANONIMATO_ENUM } from '@/app/core/api/denuncias/models/nivel-anonimato-enum-array';

// Errores de Dominio
import {
    FormValidationError,
    FileTooLargeError,
    UnsupportedFileTypeError,
    MapInitializationError,
    GeolocationError,
    DenunciaSubmissionError
} from '@/app/core/errors/create-denuncia.errors'; // Asumiendo ruta

import * as L from 'leaflet';

// CONSTANTES DE CONFIGURACIÓN (Evitamos Magic Numbers/Strings)
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
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
    imports: [ReactiveFormsModule, CommonModule, HeaderComponent, SidebarComponent, SubmitButtonComponent],
    templateUrl: './crear-denuncia.component.html',
    styleUrls: ['./crear-denuncia.component.scss']
})
export class CrearDenunciaComponent implements OnDestroy {
    // Inyecciones
    private readonly fb = inject(FormBuilder);
    private readonly facade = inject(DenunciaFacade);

    // ViewChild
    private readonly mapContainer = viewChild.required<ElementRef>('mapContainer');
    private readonly scrollArea = viewChild.required<ElementRef>('scrollArea');

    // Signals de Estado
    readonly isLoading = this.facade.loading;
    readonly errorMessage = this.facade.error; // Facade maneja el error global, pero podemos tener uno local si se requiere

    // Signals Locales
    readonly imagePreview = signal<string | null>(null);
    readonly selectedFile = signal<File | null>(null);
    readonly currentCoords = signal<{ lat: number; lng: number } | null>(null);
    readonly localError = signal<string | null>(null); // Para errores de validación síncronos

    // Listados
    readonly listadoCategorias = CATEGORIA_ENUM;
    readonly listadoAnonimato = NIVEL_ANONIMATO_ENUM;

    // Leaflet
    private map: L.Map | undefined;
    private marker: L.Marker | undefined;

    // Formulario
    readonly form = this.fb.group({
        titulo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]], // OWASP: Max length limits
        descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
        categoria: [null as CategoriaEnum | null, [Validators.required]],
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

            // Fijar icono por defecto
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
        // Redondeamos para evitar precisión innecesaria y problemas de punto flotante
        const latFixed = parseFloat(lat.toFixed(6));
        const lngFixed = parseFloat(lng.toFixed(6));

        this.currentCoords.set({ lat: latFixed, lng: lngFixed });
        this.form.patchValue({ latitud: latFixed, longitud: lngFixed });
        this.form.get('latitud')?.markAsTouched(); // Feedback visual inmediato
    }

    // =================================================================
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

    // =================================================================
    // ENVÍO DEL FORMULARIO
    // =================================================================

    async enviarDenuncia(): Promise<void> {
        this.localError.set(null);

        try {
            // 1. Validar Estado del Formulario
            if (this.form.invalid) {
                this.form.markAllAsTouched();
                const invalidFields = Object.keys(this.form.controls).filter(key => this.form.get(key)?.invalid);
                throw new FormValidationError('Por favor, complete todos los campos obligatorios correctamente.', invalidFields);
            }

            const rawData = this.form.getRawValue();

            // 2. Construir Request DTO
            const request: CrearDenunciaRequest = {
                titulo: rawData.titulo!.trim(), // Sanitize: Trim whitespace
                descripcion: rawData.descripcion!.trim(),
                categoria: rawData.categoria!,
                nivelAnonimato: rawData.nivelAnonimato!,
                latitud: rawData.latitud!,
                longitud: rawData.longitud!,
            };

            // 3. Llamar al Facade
            // El facade ya maneja sus propios errores internos, pero aquí capturamos el rechazo final
            await this.facade.crearDenuncia(request, this.selectedFile());

        } catch (error) {
            // Manejo centralizado de errores de UI
            this.handleSubmissionError(error);
        }
    }

    private handleSubmissionError(error: unknown): void {
        if (error instanceof FormValidationError) {
            this.localError.set(error.message);
            console.warn('[CrearDenuncia] Validación fallida:', error.invalidFields);
        } else if (error instanceof DenunciaSubmissionError) {
            this.localError.set(error.message);
        } else {
            // Error desconocido o inesperado
            console.error('[CrearDenuncia] Error inesperado:', error);
            this.localError.set('Ocurrió un error inesperado al enviar la denuncia. Intente nuevamente.');
        }
    }
}
