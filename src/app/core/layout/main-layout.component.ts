import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@/shared/ui/header/header.component';
import { SidebarComponent } from '@/shared/ui/sidebar/sidebar.component';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [RouterOutlet, HeaderComponent, SidebarComponent],
    templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent { }
