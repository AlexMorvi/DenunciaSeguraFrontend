import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
    faUserSecret,
    faBolt,
    faMapLocationDot,
    faCamera
} from '@fortawesome/free-solid-svg-icons';
import { UiStyleDirective } from "@/shared/style/ui-styles.directive";

@Component({
    selector: 'app-auth-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, NgOptimizedImage, FontAwesomeModule, UiStyleDirective],
    templateUrl: './auth-layout.component.html',
    styleUrls: ['./auth-layout.component.scss']
})
export class AuthLayoutComponent {
    // Año actual para el footer, por ejemplo.
    currentYear = new Date().getFullYear();

    protected readonly features = [
        { icon: faUserSecret, label: '100% Anónimo' },
        { icon: faBolt, label: 'Tiempo Real' },
        { icon: faMapLocationDot, label: 'Geolocalización' },
        { icon: faCamera, label: 'Evidencia' }
    ];
}
