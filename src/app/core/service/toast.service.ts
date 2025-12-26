import { Injectable } from '@angular/core';
import { toast } from 'ngx-sonner';

@Injectable({ providedIn: 'root' })
export class ToastService {

    // Estilo para ÉXITO (Verde)
    showSuccess(title: string, message: string) {
        toast.success(title, {
            description: message,
            duration: 4000,
            classes: {
                // Borde izquierdo verde grueso
                toast: '!border-l-4 !border-l-green-500',
                // Título verde oscuro y el icono verde vibrante
                title: '!text-green-700',
                // icon: '!text-green-500'
            }
        });
    }

    // Estilo para ERROR (Rojo)
    showError(message: string) {
        toast.error('Error', {
            description: message,
            duration: 5000,
            classes: {
                // Borde izquierdo rojo grueso
                toast: '!border-l-4 !border-l-red-500',
                // Título rojo oscuro y icono rojo vibrante
                title: '!text-red-700',
                // icon: '!text-red-500'
            }
        });
    }

    // Estilo para ADVERTENCIA (Ámbar/Amarillo)
    showWarning(message: string) {
        toast.warning('Advertencia', {
            description: message,
            duration: 5000,
            classes: {
                // Borde izquierdo ámbar grueso
                toast: '!border-l-4 !border-l-amber-500',
                // Título ámbar oscuro y icono ámbar vibrante
                title: '!text-amber-700',
                // icon: '!text-amber-500'
            }
        });
    }

    // Estilo para INFO (Azul - Opcional)
    showInfo(message: string) {
        toast.info('Información', {
            description: message,
            classes: {
                toast: '!border-l-4 !border-l-blue-500',
                title: '!text-blue-700',
                // icon: '!text-blue-500'
            },
        });
    }
}
