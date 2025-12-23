import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NotificacionFacade } from '@/app/data/services/notificacion.facade';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './sidebar.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
    private notifFacade = inject(NotificacionFacade);

    public noLeidasCount = this.notifFacade.noLeidasCount;
}
