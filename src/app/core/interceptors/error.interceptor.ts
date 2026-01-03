import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../service/toast/toast.service';
import { LoggerService } from '../service/logging/logger.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const toast = inject(ToastService);
    const logger = inject(LoggerService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let userMessage = 'Ocurrió un error inesperado. Por favor intente más tarde.';

            logger.logError('API Error', { url: req.url, status: error.status, message: error.message });

            if (error.status === 400) {
                userMessage = error.error?.message || 'Datos inválidos verifique su información.';
            } else if (error.status === 401) {
                userMessage = 'Sesión expirada.';
            } else if (error.status === 403) {
                userMessage = 'No tiene permisos para realizar esta acción.';
            } else if (error.status >= 500) {
                userMessage = 'Error en el servidor. Estamos trabajando en ello.';
            }

            toast.showError(userMessage);

            return throwError(() => error);
        })
    );
};
