import { DestroyRef, Injectable, inject, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LogEntry, LogLevel } from '../model/logging.model';
import { environment } from '@/../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class LoggerService {
    private http = inject(HttpClient);
    private destroyRef = inject(DestroyRef);

    private readonly LOG_ENDPOINT = `${environment.apiUrl}/system/logs`; // TODO: Ajustar ruta del backend
    private readonly BATCH_SIZE = 5;
    private readonly FLUSH_INTERVAL = 10000;

    private lastLogTime = 0;
    private lastLogMessage = '';
    private readonly DEBOUNCE_TIME = 3000;

    private logQueue: LogEntry[] = [];
    private flushTimer: any;

    constructor() {
        this.flushTimer = setInterval(() => this.flushLogs(), this.FLUSH_INTERVAL);
        this.destroyRef.onDestroy(() => clearInterval(this.flushTimer));
        window.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.flushOnExit();
            }
        });
    }

    // Métodos públicos
    logInfo(message: string, ...details: any[]) {
        const now = Date.now();
        if (message === this.lastLogMessage && (now - this.lastLogTime < this.DEBOUNCE_TIME)) {
            return;
        }
        this.lastLogTime = now;
        this.lastLogMessage = message;
        this.log('INFO', message, details);
    }
    logWarn(message: string, ...details: any[]) {
        const now = Date.now();
        if (message === this.lastLogMessage && (now - this.lastLogTime < this.DEBOUNCE_TIME)) {
            return;
        }
        this.lastLogTime = now;
        this.lastLogMessage = message;
        this.log('WARN', message, details);
    }
    logError(message: string, ...details: any[]) {
        const now = Date.now();
        if (message === this.lastLogMessage && (now - this.lastLogTime < this.DEBOUNCE_TIME)) {
            return;
        }
        this.lastLogTime = now;
        this.lastLogMessage = message;
        this.log('ERROR', message, details);
    }

    private log(level: LogLevel, message: string, details: any[]): void {
        const entry: LogEntry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            // INFO: Se puede añadir el id del usuario
            // userId: this.authService.getCurrentUserId(), 
            extraInfo: this.sanitizeData(details)
        };

        if (isDevMode()) {
            const style = level === 'ERROR' ? 'color: red' : 'color: blue';
            console.log(`%c[${level}] ${message}`, style, details);
        }

        this.logQueue.push(entry);

        if (this.logQueue.length >= this.BATCH_SIZE) {
            this.flushLogs();
        }
    }

    private flushLogs(): void {
        if (this.logQueue.length === 0) return;

        const logsToSend = [...this.logQueue];
        this.logQueue = [];

        this.http.post(this.LOG_ENDPOINT, logsToSend).subscribe({
            next: () => { },
            error: (err) => {
                if (isDevMode()) console.error('Fallo al enviar logs al backend', err);
            }
        });
    }

    private flushOnExit(): void {
        if (this.logQueue.length === 0) return;
        const blob = new Blob([JSON.stringify(this.logQueue)], { type: 'application/json' });
        // INFO: El back no debe devolver mucho, un ok 200 es suficiente
        const success = navigator.sendBeacon(this.LOG_ENDPOINT, blob);

        if (success) {
            this.logQueue = [];
        }
    }

    private sanitizeData(data: any[]): any {
        try {
            const jsonString = JSON.stringify(data, (key, value) => {
                if (this.isSensitiveKey(key)) {
                    return '***REDACTED***';
                }
                return value;
            });
            return JSON.parse(jsonString);
        } catch (e) {
            return { info: 'Data could not be serialized (circular reference or error)' };
        }
    }

    private isSensitiveKey(key: string): boolean {
        const sensitiveKeys = [
            // Credenciales y secretos
            'password',
            'pass',
            'token',
            'authorization',
            'auth',
            'creditcard',
            'cardnumber',
            'cvv',
            'cvc',
            'secret',
            'apikey',
            'api_key',
            // PII 
            'email',
            'mail',
            'correo',
            'nombre',
            'name',
            'apellido',
            'lastname',
            'fullname',
            'direccion',
            'address',
            'domicilio',
            'telefono',
            'phone',
            'mobile',
            'celular',
            'dni',
            'cedula',
            'ceduladeidentidad',
            'documento',
            'documentid',
            'nif',
            'nie',
            // Identificadores de usuario
            'userid',
            'user_id',
            'username'
        ];
        const lowerKey = key.toLowerCase();
        return sensitiveKeys.some(k => lowerKey.includes(k));
    }
}
