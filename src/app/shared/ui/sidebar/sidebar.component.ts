import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthFacade } from '@/data/services/auth.facade';
import { NotificacionFacade } from '@/data/services/notificacion.facade';
import { MENU_ITEMS } from './menu.config';
import { MenuItem } from './menu.types';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBell, faUser, faUsers } from '@fortawesome/free-solid-svg-icons';

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
    protected readonly faUser = faUser;

    private authFacade = inject(AuthFacade);
    private notificationFacade = inject(NotificacionFacade);

    public noLeidasCount = this.notificationFacade.noLeidasCount;
    public currentUser = this.authFacade.currentUser;
    public menuItems = computed<MenuItem[]>(() => {
        const user = this.currentUser();

        if (!user) return [];
        const userRol = user.rol;
        if (!userRol) return [];

        return MENU_ITEMS
            .filter((item: MenuItem) => item.allowedRoles.includes(userRol))
            .map((item: MenuItem) => ({
                ...item,
                fullPath: [item.path]
            }));
    });

    public badgeLabel = computed(() => {
        const count = this.noLeidasCount();

        return count > 99 ? '99+' : count.toString();
    });
}
