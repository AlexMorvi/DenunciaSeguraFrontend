import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition, faEnvelope, faLock, faArrowRight, faUsers, faKey, faCheckCircle, faInfoCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { UiStyleDirective } from '@/shared/style/ui-styles.directive';
import { AuthFacade } from '@/data/services/auth.facade';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
    standalone: true,
    imports: [RouterLink, FontAwesomeModule, UiStyleDirective],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
    protected readonly faEnvelope: IconDefinition = faEnvelope;
    protected readonly faLock: IconDefinition = faLock;
    protected readonly faArrowRight: IconDefinition = faArrowRight;
    protected readonly faUsers: IconDefinition = faUsers;
    protected readonly faKey: IconDefinition = faKey;
    protected readonly faCheckCircle: IconDefinition = faCheckCircle;
    protected readonly faInfoCircle: IconDefinition = faInfoCircle;
    protected readonly faExclamationCircle: IconDefinition = faExclamationCircle;

    private readonly router = inject(Router);
    private readonly authFacade = inject(AuthFacade);
    private readonly oauthService = inject(OAuthService);

    protected readonly isLoading = this.authFacade.loading;

    ingresar() {
        this.oauthService.initLoginFlow();
    }

    goToForgotPassword() { this.router.navigate(['/forgot-password']); }
    goToRegister() { this.router.navigate(['/crear-cuenta']); }
}
