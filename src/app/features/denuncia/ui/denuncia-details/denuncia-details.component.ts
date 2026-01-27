import { Component, input, ChangeDetectionStrategy, computed, afterNextRender, viewChild, ElementRef, ViewEncapsulation, inject, DestroyRef, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    faClipboardCheck,
    faWrench
} from '@fortawesome/free-solid-svg-icons';
import { UiStyleDirective } from '@/shared/style/ui-styles.directive';
import { EvidenciaViewerComponent } from '@/shared/ui/evidencia-viewer/evidencia-viewer.component';
import { LocationEvent, SecurityEvent, SystemEvent } from '@/core/model/app.event';
import { DenunciaResponse, EvidenciaDto } from '@/core/api/denuncias/models';
import { EvidenceFacade } from '@/data/services/evidence.facade';
import { ESTADO_BADGE_CLASSES } from '@/shared/constants/estados.const';

@Component({
    selector: 'app-denuncia-details',
    standalone: true,
    imports: [CommonModule, UiStyleDirective, FontAwesomeModule, EvidenciaViewerComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './denuncia-details.component.html',
    styleUrls: ['./denuncia-details.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DenunciaDetailsComponent {
    errorEvent = output<SecurityEvent>();
    private readonly evidenceFacade = inject(EvidenceFacade);

    protected evidencias = signal<EvidenciaDto[]>([]);
    protected evidenciasResolucion = signal<EvidenciaDto[]>([]);
    protected nombreReportado = signal<string>('Anónimo');

    propagateError(event: SecurityEvent) {
        this.errorEvent.emit(event);
    }

    private readonly destroyRef = inject(DestroyRef);
    denuncia = input.required<DenunciaResponse | null>();

    protected readonly faMapMarkerAlt = faMapMarkerAlt;
    protected readonly faTriangleExclamation = faTriangleExclamation;
    protected readonly faLayerGroup = faLayerGroup;
    protected readonly faCircleExclamation = faCircleExclamation;
    protected readonly faImages = faImages;
    protected readonly faUser = faUser;
    protected readonly faVideo = faVideo;
    protected readonly faClipboardCheck = faClipboardCheck;
    protected readonly faFileAlt = faFileAlt;
    protected readonly faWrench = faWrench;

    getStatusClass(estado?: string | null): string {
        return ESTADO_BADGE_CLASSES[estado as string] || 'bg-gray-100 text-gray-800';
    }

    googleMapsUrl = computed(() => {
        const d = this.denuncia();
        if (!d) return null;
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

        effect(async () => {
            const currentDenuncia = this.denuncia();
            if (!currentDenuncia?.id) {
                this.evidencias.set([]);
                this.evidenciasResolucion.set([]);
                return;
            }

            if (currentDenuncia.nivelAnonimato === 'REAL') {
                this.nombreReportado.set(currentDenuncia.ciudadano?.nombre || 'Desconocido');
            } else if (currentDenuncia.nivelAnonimato === 'PSEUDOANONIMO') {
                this.nombreReportado.set(currentDenuncia.ciudadano?.alias || 'PSEUDOANONIMO');
            } else {
                this.nombreReportado.set('Anónimo');
            }

            try {
                const results = await this.evidenceFacade.getEvidences({
                    tipo: 'DENUNCIA',
                    id: currentDenuncia.id
                });
                this.evidencias.set(results as unknown as EvidenciaDto[]);
            } catch {
                this.evidencias.set([]);
            }

            try {
                const resultsRes = await this.evidenceFacade.getEvidences({
                    tipo: 'RESOLUCION',
                    id: currentDenuncia.id
                });
                this.evidenciasResolucion.set(resultsRes as unknown as EvidenciaDto[]);
            } catch {
                this.evidenciasResolucion.set([]);
                this.map?.remove();
                this.map = undefined;
            }
        });
    }

    private initMapIfCoords(): void {
        if (this.map) {
            this.map.remove();
            this.map = undefined;
        }
        const denuncia = this.denuncia();
        if (!denuncia) return;
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

    getEntidadLabel(entidad?: string | null): string {
        if (!entidad) return 'No asignada';
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
