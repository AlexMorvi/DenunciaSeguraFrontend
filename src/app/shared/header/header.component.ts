import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '@/environments/environment';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './header.component.html',
})
export class HeaderComponent {
    @Input() area = 'Ciudadano';
    @Input() page = 'Mis denuncias';
    // private http = inject(HttpClient);
    private router = inject(Router);

    onLogout() {
        // this.http.post(`${environment.apiUrl}/logout`, {}, { withCredentials: true })
        //     .subscribe({
        //         next: () => this.finalizeLogout(),
        //         error: (err) => {
        //             console.warn('El backend reportó error, pero cerramos sesión localmente igual.', err);
        //             this.finalizeLogout();
        //         }
        //     });
    }

    private finalizeLogout() {
        this.router.navigate(['/login']);
    }
}
