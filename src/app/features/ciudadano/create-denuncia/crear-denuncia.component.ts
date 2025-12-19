import { Component, ElementRef, inject, signal, viewChild, afterNextRender, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

// 1. IMPORTACIONES DE CAPA DE NEGOCIO (Facade) Y MODELOS
import { DenunciaFacade } from '@/app/data/services/denuncia.facade';
// Ajusta estas rutas a tu estructura exacta 'core/api/...'
import { CrearDenunciaRequest } from '@/app/core/api/denuncias/models/crear-denuncia-request';
import { CategoriaEnum } from '@/app/core/api/denuncias/models/categoria-enum';
import { NivelAnonimatoEnum } from '@/app/core/api/denuncias/models/nivel-anonimato-enum';

// IMPORTACIÓN DE ARRAYS (Para los <select> en el HTML sin errores de tipo)
import { CATEGORIA_ENUM } from '@/app/core/api/denuncias/models/categoria-enum-array';
import { NIVEL_ANONIMATO_ENUM } from '@/app/core/api/denuncias/models/nivel-anonimato-enum-array';

// 2. COMPONENTES DE UI
import { HeaderComponent } from '@/app/shared/header/header.component';
import { SidebarComponent } from '@/app/shared/sidebar/sidebar.component';
import { SubmitButtonComponent } from '@/app/shared/submit-button/submit-button.component';

// 3. LIBRERÍAS EXTERNAS
import * as L from 'leaflet';

// Configuración de icono Leaflet (Fix visual estándar)
const iconoRojo = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconoRojo;

@Component({
    selector: 'app-crear-denuncia',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, HeaderComponent, SidebarComponent, SubmitButtonComponent],
    templateUrl: './crear-denuncia.component.html',
    styleUrls: ['./crear-denuncia.component.scss']
})
export class CrearDenunciaComponent implements OnDestroy {
    // ==========================================
    // INYECCIÓN DE DEPENDENCIAS
    // ==========================================
    private fb = inject(FormBuilder);
    private facade = inject(DenunciaFacade);

    // Referencia al contenedor del mapa (Signal API)
    private mapContainer = viewChild.required<ElementRef>('mapContainer');

    // ==========================================
    // ESTADO (SIGNALS)
    // ==========================================
    // Estado que viene del Facade (Loading y Errores de API)
    isLoading = this.facade.loading;
    errorMessage = this.facade.error;

    // Estado local de UI
    imagePreview = signal<string | null>(null); // Para mostrar la foto al usuario
    selectedFile = signal<File | null>(null);   // El archivo real para enviar
    currentCoords = signal<{ lat: number; lng: number } | null>(null);

    // Listas para los Dropdowns (Importadas de los -array.ts)
    listadoCategorias = CATEGORIA_ENUM;
    listadoAnonimato = NIVEL_ANONIMATO_ENUM;

    // Instancias de Leaflet
    private map: L.Map | undefined;
    private marker: L.Marker | undefined;

    // ==========================================
    // FORMULARIO REACTIVO
    // ==========================================
    form = this.fb.group({
        titulo: ['', [Validators.required, Validators.minLength(5)]],
        descripcion: ['', [Validators.required, Validators.minLength(10)]],
        // Tipamos explícitamente los enums para evitar conflictos
        categoria: [null as CategoriaEnum | null, [Validators.required]],
        nivelAnonimato: ['REAL' as NivelAnonimatoEnum, [Validators.required]],
        // Inputs ocultos controlados por el mapa
        latitud: [null as number | null, Validators.required],
        longitud: [null as number | null, Validators.required],
        // Input visual (no se envía directo en el JSON, se procesa aparte)
        evidenciaIds: []
    });

    constructor() {
        // Inicialización segura del mapa (Compatible con SSR)
        afterNextRender(() => {
            this.initMap();
            this.locateUser();
        });
    }

    // ==========================================
    // LÓGICA DEL MAPA
    // ==========================================
    private initMap(): void {
        const container = this.mapContainer().nativeElement;
        // Coordenadas default (ej. Centro de la ciudad)
        const defaultLat = -0.1807;
        const defaultLng = -78.4678;

        this.map = L.map(container).setView([defaultLat, defaultLng], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.map);

        // Click en mapa mueve el marcador
        this.map.on('click', (e: L.LeafletMouseEvent) => {
            this.updateMarker(e.latlng.lat, e.latlng.lng);
        });
    }

    private updateMarker(lat: number, lng: number): void {
        if (!this.marker) {
            this.marker = L.marker([lat, lng], { draggable: true }).addTo(this.map!);
            // Listener al arrastrar marcador
            this.marker.on('dragend', (event) => {
                const { lat, lng } = event.target.getLatLng();
                this.updateFormCoords(lat, lng);
            });
        } else {
            this.marker.setLatLng([lat, lng]);
        }
        this.updateFormCoords(lat, lng);
    }

    private updateFormCoords(lat: number, lng: number) {
        // Actualizamos Signal visual
        this.currentCoords.set({ lat, lng });
        // Actualizamos Formulario para validación
        this.form.patchValue({ latitud: lat, longitud: lng });
    }

    private locateUser(): void {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    this.map?.setView([latitude, longitude], 15);
                    this.updateMarker(latitude, longitude);
                },
                (err) => console.warn('No se pudo geolocalizar', err)
            );
        }
    }

    // ==========================================
    // MANEJO DE ARCHIVOS (INPUT FILE)
    // ==========================================
    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;

        if (input.files && input.files[0]) {
            const file = input.files[0];

            // Validaciones básicas (opcional: tamaño, tipo)
            if (file.size > 5 * 1024 * 1024) { // 5MB
                alert('La imagen es demasiado pesada');
                return;
            }

            // 1. Guardamos el archivo "crudo" en un signal para enviarlo luego
            this.selectedFile.set(file);

            // 2. Generamos preview visual
            const reader = new FileReader();
            reader.onload = (e) => this.imagePreview.set(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    }

    // ==========================================
    // ENVÍO AL FACADE
    // ==========================================
    enviarDenuncia(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const { titulo, descripcion, categoria, nivelAnonimato, latitud, longitud } = this.form.getRawValue();

        // Construcción del Request DTO
        // NOTA: No asignamos 'evidenciaIds' aquí. El componente no sabe de IDs.
        // Solo pasa la intención y el archivo crudo.
        const request: CrearDenunciaRequest = {
            titulo: titulo!,
            descripcion: descripcion!,
            categoria: categoria!,
            nivelAnonimato: nivelAnonimato!,
            latitud: latitud!,
            longitud: longitud!,
            // evidenciaIds: [] -> Esto lo llenará el Facade después de subir la foto
        };

        // Llamada al Facade: Pasamos el DTO de datos + El archivo (si existe)
        this.facade.crearDenuncia(request, this.selectedFile());
    }

    ngOnDestroy(): void {
        this.map?.remove();
    }
}
// import { Component, ElementRef, inject, signal, viewChild, afterNextRender, OnDestroy } from '@angular/core';
// import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
// import { CommonModule } from '@angular/common'; // Para pipes si fuera standalone sin imports globales
// import { HeaderComponent } from '@/app/shared/header/header.component';
// import { SidebarComponent } from '@/app/shared/sidebar/sidebar.component';
// import { SubmitButtonComponent } from '@/app/shared/submit-button/submit-button.component';
// import * as L from 'leaflet';

// const iconoRojo = L.icon({
//     iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
//     shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
//     iconSize: [25, 41],
//     iconAnchor: [12, 41],
//     popupAnchor: [1, -34],
//     shadowSize: [41, 41]
// });

// L.Marker.prototype.options.icon = iconoRojo;

// @Component({
//     selector: 'app-crear-denuncia',
//     standalone: true,
//     imports: [ReactiveFormsModule, CommonModule, HeaderComponent, SidebarComponent, SubmitButtonComponent],
//     templateUrl: './crear-denuncia.component.html',
//     styleUrls: ['./crear-denuncia.component.scss']
// })
// export class CrearDenunciaComponent implements OnDestroy {
//     private fb = inject(FormBuilder);

//     private mapContainer = viewChild.required<ElementRef>('mapContainer');

//     categorias = signal<string[]>(['ALUMBRADO_PUBLICO', 'BASURA', 'SEGURIDAD', 'VIALIDAD', 'OTRO']);
//     imagePreview = signal<string | null>(null);
//     currentCoords = signal<{ lat: number; lng: number } | null>(null);
//     isSubmitting = signal(false);

//     private map: L.Map | undefined;
//     private marker: L.Marker | undefined;

//     denunciaForm = this.fb.group({
//         titulo: ['', [Validators.required, Validators.minLength(5)]],
//         descripcion: ['', [Validators.required, Validators.minLength(10)]],
//         categoria: ['', Validators.required],
//         latitud: [null as number | null, Validators.required],
//         longitud: [null as number | null, Validators.required],
//         foto: [null as File | null]
//     });

//     constructor() {
//         afterNextRender(() => {
//             this.initMap();
//             this.locateUser();
//         });
//     }

//     // ==========================================
//     // LÓGICA DEL MAPA (LEAFLET)
//     // ==========================================
//     private initMap(): void {
//         const container = this.mapContainer().nativeElement;

//         // Coordenadas iniciales (Quito)
//         const initialLat = -0.1807;
//         const initialLng = -78.4678;
//         const zoomLevel = 13;

//         this.map = L.map(container).setView([initialLat, initialLng], zoomLevel);

//         L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//             attribution: '&copy; OpenStreetMap contributors'
//         }).addTo(this.map);

//         // Evento CLICK en el mapa: mueve el marcador
//         this.map.on('click', (e: L.LeafletMouseEvent) => {
//             this.updateMarker(e.latlng.lat, e.latlng.lng);
//         });
//     }

//     private updateMarker(lat: number, lng: number): void {
//         // 1. Si no existe marcador, crearlo
//         if (!this.marker) {
//             this.marker = L.marker([lat, lng], { draggable: true }).addTo(this.map!);

//             // Evento DRAGEND: cuando se arrastra el marcador
//             this.marker.on('dragend', (event) => {
//                 const position = event.target.getLatLng();
//                 this.updateFormCoords(position.lat, position.lng);
//             });
//         } else {
//             // 2. Si existe, moverlo
//             this.marker.setLatLng([lat, lng]);
//         }

//         // 3. Actualizar formulario y señales
//         this.updateFormCoords(lat, lng);
//     }

//     private updateFormCoords(lat: number, lng: number) {
//         // Actualizar signal visual
//         this.currentCoords.set({ lat, lng });

//         // Actualizar controles del formulario (para que el validador funcione)
//         this.denunciaForm.patchValue({
//             latitud: lat,
//             longitud: lng
//         });
//     }

//     private locateUser(): void {
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(
//                 (position) => {
//                     const lat = position.coords.latitude;
//                     const lng = position.coords.longitude;

//                     this.map?.setView([lat, lng], 15);
//                     this.updateMarker(lat, lng);
//                 },
//                 (error) => {
//                     console.warn('Geolocalización denegada o fallida:', error);
//                     // Opcional: Centrar en default si falla
//                 }
//             );
//         }
//     }

//     // ==========================================
//     // LÓGICA DE ARCHIVOS (IMAGEN)
//     // ==========================================
//     onFileSelected(event: Event): void {
//         const input = event.target as HTMLInputElement;
//         if (input.files && input.files[0]) {
//             const file = input.files[0];

//             // 1. Guardar el archivo en el formulario
//             this.denunciaForm.patchValue({ foto: file });

//             // 2. Generar preview con FileReader
//             const reader = new FileReader();
//             reader.onload = (e) => {
//                 this.imagePreview.set(e.target?.result as string);
//             };
//             reader.readAsDataURL(file);
//         }
//     }

//     // ==========================================
//     // ENVÍO DEL FORMULARIO
//     // ==========================================
//     onSubmit(): void {
//         if (this.denunciaForm.valid) {
//             this.isSubmitting.set(true);
//             const formData = this.denunciaForm.value;

//             console.log('Datos a enviar al Backend:', formData);

//             // AQUÍ LLAMARÍAS A TU SERVICIO (Service.crearDenuncia(formData)...)

//             // Simulación de delay
//             setTimeout(() => {
//                 this.isSubmitting.set(false);
//                 alert('Denuncia enviada correctamente');
//             }, 1000);
//         } else {
//             this.denunciaForm.markAllAsTouched();
//         }
//     }

//     ngOnDestroy(): void {
//         if (this.map) {
//             this.map.remove();
//         }
//     }
// }

