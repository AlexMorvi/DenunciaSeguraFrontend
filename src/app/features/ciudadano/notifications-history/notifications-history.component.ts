
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para DatePipe y UpperCasePipe
import { HeaderComponent } from '@/app/shared/header/header.component';
import { SidebarComponent } from '@/app/shared/sidebar/sidebar.component';
import { NotificationsListComponent } from '@/app/features/ciudadano/notifications-list/notifications-list.component';

@Component({
    selector: 'app-notifications-history',
    standalone: true,
    imports: [CommonModule, HeaderComponent, SidebarComponent, NotificationsListComponent],
    templateUrl: 'notifications-history.component.html',
})

export class CiudadanoNotificationsHistoryComponent {

}
