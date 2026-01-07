import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBell, faEnvelope, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { AuthFacade } from '@/data/services/auth.facade';
// breadcrumb imports removed: nav was eliminated from template

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, FontAwesomeModule],
    templateUrl: './header.component.html',
})
export class HeaderComponent {
    private router = inject(Router);
    private authFacade = inject(AuthFacade);

    protected readonly faBell = faBell;
    protected readonly faEnvelope = faEnvelope;
    protected readonly faSignOutAlt = faSignOutAlt;

    async onLogout() {
        await this.authFacade.logout();
        this.finalizeLogout();
    }

    private finalizeLogout() {
        this.router.navigate(['/auth/login']);
    }
}
