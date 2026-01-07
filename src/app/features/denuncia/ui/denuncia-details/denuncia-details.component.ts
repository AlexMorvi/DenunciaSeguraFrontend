import { Component, input, ChangeDetectionStrategy, computed, afterNextRender, viewChild, ElementRef, ViewEncapsulation, inject, DestroyRef, output } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import * as L from 'leaflet';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
    faTriangleExclamation,
    faLayerGroup,
    faCircleExclamation,
    faImages,
    faUser,
    faVideo,
    faMapMarkerAlt,
    faFileAlt,
    faClipboardCheck
} from '@fortawesome/free-solid-svg-icons';
import { DenunciaStaffViewResponse } from '@/core/api/denuncias/models';
import { UiStyleDirective } from '@/shared/style/ui-styles.directive';
import { EvidenciaViewerComponent } from '@/shared/ui/evidencia-viewer/evidencia-viewer.component';
import { LocationEvent, SecurityEvent, SystemEvent } from '@/core/model/app.event';

@Component({
    selector: 'app-denuncia-details',
    standalone: true,
    imports: [TitleCasePipe, UiStyleDirective, FontAwesomeModule, EvidenciaViewerComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './denuncia-details.component.html',
    styleUrls: ['./denuncia-details.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DenunciaDetailsComponent {
    errorEvent = output<SecurityEvent>();

    propagateError(event: SecurityEvent) {
        this.errorEvent.emit(event);
    }

    private destroyRef = inject(DestroyRef);
    //TODO: No utilizar any, sino el tipo de openapi correcto
    denuncia = input.required<any>();
    // denuncia = input.required<DenunciaStaffViewResponse>();

    protected readonly faMapMarkerAlt = faMapMarkerAlt;
    protected readonly faTriangleExclamation = faTriangleExclamation;
    protected readonly faLayerGroup = faLayerGroup;
    protected readonly faCircleExclamation = faCircleExclamation;
    protected readonly faImages = faImages;
    protected readonly faUser = faUser;
    protected readonly faVideo = faVideo;
    protected readonly faClipboardCheck = faClipboardCheck;
    protected readonly faFileAlt = faFileAlt;

    googleMapsUrl = computed(() => {
        const d = this.denuncia();
        const lat = Number(d.latitud);
        const lng = Number(d.longitud);

        // Validación pura
        const isValid = Number.isFinite(lat) && Math.abs(lat) <= 90 &&
            Number.isFinite(lng) && Math.abs(lng) <= 180;

        if (!isValid) return null;

        // Nota: Corregí la URL que tenías, parecía tener un typo en el '0{encode...}'
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lat)},${encodeURIComponent(lng)}`;
    });


    private map: L.Map | undefined;
    private marker: L.Marker | undefined;
    private readonly mapContainer = viewChild.required<ElementRef>('mapContainer');

    // Icon config reused from crear-denuncia to avoid missing default markers
    private static readonly ICON_RED_CONFIG = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    constructor() {
        afterNextRender(() => {
            this.initMapIfCoords();
        });
    }

    ngOnDestroy(): void {
        if (this.map) {
            this.map.remove(); // Esto desconecta Leaflet del DOM
            this.map = undefined;
        }
    }

    private initMapIfCoords(): void {
        if (this.map) {
            this.map.remove();
            this.map = undefined;
        }
        const denuncia = this.denuncia();
        const lat = Number(denuncia.latitud);
        const lng = Number(denuncia.longitud);

        const isLatValid = Number.isFinite(lat) && Math.abs(lat) <= 90;
        const isLngValid = Number.isFinite(lng) && Math.abs(lng) <= 180;

        if (!isLatValid || !isLngValid) {
            const event: LocationEvent = {
                userMessage: 'Coordenadas inválidas. No se puede mostrar el mapa.',
                technicalMessage: 'Coordenadas de denuncia inválidas o corruptas',
                severity: 'WARNING',
                logData: {
                    received_lat: denuncia.latitud,
                    received_lng: denuncia.longitud,
                    denuncia_id: denuncia.id
                }
            };
            this.propagateError(event);
            return;
        }

        const container = this.mapContainer().nativeElement as HTMLElement | null;
        if (!container) return;

        try {
            this.map = L.map(container, { scrollWheelZoom: false }).setView([lat, lng], 15);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.map);

            this.marker = L.marker([lat, lng], {
                icon: DenunciaDetailsComponent.ICON_RED_CONFIG
            }).addTo(this.map);

            this.destroyRef.onDestroy(() => {
                this.map?.remove();
                this.map = undefined;
            });

        } catch (err: any) {
            const event: SystemEvent = {
                userMessage: "No se pudo cargar el mapa interactivo.",
                technicalMessage: `Fallo crítico al inicializar Leaflet: ${err?.message ?? String(err)}`,
                severity: 'ERROR',
                logData: {
                    stack: err?.stack,
                    context: 'DenunciaDetailsMap',
                    denuncia_id: denuncia.id
                }
            };
            this.propagateError(event);
        }
    }
}
