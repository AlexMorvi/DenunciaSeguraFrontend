import { Component, input, ChangeDetectionStrategy } from '@angular/core';
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

@Component({
    selector: 'app-denuncia-details',
    standalone: true,
    imports: [DatePipe, TitleCasePipe, UiStyleDirective, FontAwesomeModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './denuncia-details.component.html',
})
export class DenunciaDetailsComponent {
    denuncia = input.required<any>();
    // denuncia = input.required<DenunciaStaffViewResponse>();

    // Icons

    protected readonly faMapMarkerAlt = faMapMarkerAlt;
    protected readonly faTriangleExclamation = faTriangleExclamation;
    protected readonly faLayerGroup = faLayerGroup;
    protected readonly faCircleExclamation = faCircleExclamation;
    protected readonly faImages = faImages;
    protected readonly faVideo = faVideo;
    protected readonly faClipboardCheck = faClipboardCheck;
}
