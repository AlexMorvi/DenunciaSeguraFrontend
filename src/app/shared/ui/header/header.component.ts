import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBell, faEnvelope, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
// breadcrumb imports removed: nav was eliminated from template

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, FontAwesomeModule],
    templateUrl: './header.component.html',
})
export class HeaderComponent {
    private router = inject(Router);

    protected readonly faBell = faBell;
    protected readonly faEnvelope = faEnvelope;
    protected readonly faSignOutAlt = faSignOutAlt;

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
