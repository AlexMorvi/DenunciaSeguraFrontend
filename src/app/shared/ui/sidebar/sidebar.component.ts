import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthFacade } from '@/data/services/auth.facade';
import { NotificacionFacade } from '@/data/services/notificacion.facade';
import { ROLES } from '@/shared/constants/roles.const';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBell, faUsers } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive, FontAwesomeModule],
    templateUrl: './sidebar.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
    protected readonly faBell = faBell;
    protected readonly faUsers = faUsers;

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
        if (this.currentUser()?.rol === ROLES.ADMIN) {
            return ['/admin', 'configuracion-avanzada'];
        }

        return [this.basePath(), 'perfil'];
    });
}
