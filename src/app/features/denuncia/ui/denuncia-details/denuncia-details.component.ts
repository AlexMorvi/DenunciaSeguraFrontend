import { Component, input, ChangeDetectionStrategy, computed } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
    faTriangleExclamation,
    faLayerGroup,
    faCircleExclamation,
    faImages,
    faVideo,
    faLocationDot,
    faMapMarkerAlt,
    faClipboardCheck
} from '@fortawesome/free-solid-svg-icons';
import { DenunciaStaffViewResponse } from '@/core/api/denuncias/models';
import { UiStyleDirective } from '@/shared/style/ui-styles.directive';
import { SecureImageComponent } from "@/shared/ui/img/img.component";

@Component({
    selector: 'app-denuncia-details',
    standalone: true,
    imports: [DatePipe, TitleCasePipe, UiStyleDirective, FontAwesomeModule, SecureImageComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './denuncia-details.component.html',
})
export class DenunciaDetailsComponent {
    //TODO: No utilizar any, sino el tipo de openapi correcto
    denuncia = input.required<any>();
    // denuncia = input.required<DenunciaStaffViewResponse>();

    protected readonly faMapMarkerAlt = faMapMarkerAlt;
    protected readonly faTriangleExclamation = faTriangleExclamation;
    protected readonly faLayerGroup = faLayerGroup;
    protected readonly faCircleExclamation = faCircleExclamation;
    protected readonly faImages = faImages;
    protected readonly faVideo = faVideo;
    protected readonly faClipboardCheck = faClipboardCheck;

    googleMapsUrl = computed(() => {
        const d = this.denuncia();

        const lat = Number(d.lat);
        const lng = Number(d.lng);

        const isLatValid = Number.isFinite(lat) && lat >= -90 && lat <= 90;
        const isLngValid = Number.isFinite(lng) && lng >= -180 && lng <= 180;

        if (!isLatValid || !isLngValid) {
            // TODO: Loguear correctamente esto
            console.warn(`[Security/Geo] Coordenadas fuera de rango o inválidas. ID: ${d.id}`);
            return null;
        }

        return `https://www.google.com/maps?q=${encodeURIComponent(lat)},${encodeURIComponent(lng)}`;
    });
}
