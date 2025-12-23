import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
// breadcrumb imports removed: nav was eliminated from template

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './header.component.html',
})
export class HeaderComponent {
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
