import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthFacade } from '@/data/services/auth.facade';
import { NotificacionFacade } from '@/data/services/notificacion.facade';
import { APP_ROLES } from '@/shared/constants/roles.const';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './sidebar.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
    private authFacade = inject(AuthFacade);
    private notificationFacade = inject(NotificacionFacade);

    public noLeidasCount = this.notificationFacade.noLeidasCount;
    public currentUser = this.authFacade.currentUser;

    public basePath = this.authFacade.defaultPath;

    public dashboardLink = computed(() => [this.basePath(), 'dashboard']);
    public notificationsLink = computed(() => [this.basePath(), 'notificaciones']);

    public badgeLabel = computed(() => {
        const count = this.noLeidasCount();

        return count > 99 ? '99+' : count.toString();
    });

    public settingsLink = computed(() => {
        if (this.currentUser()?.rol === APP_ROLES.ADMIN) {
            return ['/admin', 'configuracion-avanzada'];
        }

        return [this.basePath(), 'perfil'];
    });
}
