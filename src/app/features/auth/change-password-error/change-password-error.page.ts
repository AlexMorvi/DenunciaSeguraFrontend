// import { Component, Input, signal, inject } from '@angular/core';
// import { Router } from '@angular/router';
// import { SubmitButtonComponent } from '@/shared/ui/submit-button/submit-button.component';
// import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// import { faExclamationTriangle, faRedo, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
// import { ToastService } from '@/core/service/toast/toast.service';
// import { AuthFacade } from '@/data/services/auth.facade';

// @Component({
//     selector: 'app-change-password-error',
//     standalone: true,
//     imports: [SubmitButtonComponent, FontAwesomeModule],
//     templateUrl: './change-password-error.page.html',
// })
// export class ChangePasswordErrorComponent {
//     protected readonly faExclamationTriangle = faExclamationTriangle;
//     protected readonly faRedo = faRedo;
//     protected readonly faArrowLeft = faArrowLeft;

//     private toast = inject(ToastService);
//     private router = inject(Router);
//     private readonly authFacade = inject(AuthFacade);

//     protected readonly isLoading = this.authFacade.loading;


// }
