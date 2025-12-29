import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

@Component({
    selector: 'app-auth-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, NgOptimizedImage],
    templateUrl: './auth-layout.component.html',
    styleUrls: ['./auth-layout.component.scss']
})
export class AuthLayoutComponent {
    // Año actual para el footer, por ejemplo.
    currentYear = new Date().getFullYear();
}
