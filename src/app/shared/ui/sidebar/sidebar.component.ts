// import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterLink, RouterLinkActive } from '@angular/router';
// import { NotificacionFacade } from '@/data/services/notificacion.facade';
// import { AuthFacade } from '@/data/services/auth.facade';

// const ROLES = {
//     ADMIN_PLATAFORMA: 'ADMIN_PLATAFORMA',
//     CIUDADANO: 'CIUDADANO',
// } as const;

// @Component({
//     selector: 'app-sidebar',
//     standalone: true,
//     imports: [CommonModule, RouterLink, RouterLinkActive],
//     templateUrl: './sidebar.component.html',
//     changeDetection: ChangeDetectionStrategy.OnPush,
// })
// export class SidebarComponent {
//     private authFacade = inject(AuthFacade);
//     private notificationFacade = inject(NotificacionFacade);
//     public noLeidasCount = this.notificationFacade.noLeidasCount;

//     currentUser = this.authFacade.currentUser;
//     basePath = computed(() => {
//         const role = this.currentUser()?.rol;
//         switch (role) {
//             case ROLES.ADMIN_PLATAFORMA: return '/admin';
//             case ROLES.CIUDADANO: return '/ciudadano';
//             default: return '/auth';
//         }
//     });

//     dashboardLink = computed(() => [this.basePath(), 'dashboard']);
//     notificationsLink = computed(() => [this.basePath(), 'notificaciones']);

//     settingsLink = computed(() => {
//         if (this.currentUser()?.rol === ROLES.ADMIN_PLATAFORMA) {
//             return ['/admin', 'configuracion-avanzada'];
//         }
//         return [this.basePath(), 'perfil'];
//     });
// }
import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NotificacionFacade } from '@/data/services/notificacion.facade';
import { AuthFacade } from '@/data/services/auth.facade';
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

    public settingsLink = computed(() => {
        if (this.currentUser()?.rol === APP_ROLES.ADMIN) {
            return ['/admin', 'configuracion-avanzada'];
        }

        return [this.basePath(), 'perfil'];
    });
}
