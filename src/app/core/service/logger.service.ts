import { Injectable, isDevMode } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoggerService {

    error(message: string, error: unknown, context?: Record<string, any>) {
        if (isDevMode()) {
            console.group('[Error Reportado]');
            console.error(message);
            console.error(error);
            if (context) console.warn('Contexto:', context);
            console.groupEnd();
        } else {
            // EN PRODUCCIÓN:
            // TODO: Mandar los errores al backend usando api
        }
    }
}
