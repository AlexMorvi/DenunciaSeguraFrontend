import { Injectable } from '@angular/core';
import { toast } from 'ngx-sonner';

@Injectable({ providedIn: 'root' })
export class ToastService {

    showSuccess(title: string, message: string) {
        toast.success(title, {
            description: message,
            duration: 4000,
            classes: {
                toast: '!border-l-4 !border-l-green-500',
                title: '!text-green-700',
            }
        });
    }

    showError(message: string) {
        toast.error('Error', {
            description: message,
            duration: 5000,
            classes: {
                toast: '!border-l-4 !border-l-red-500',
                title: '!text-red-700',
            }
        });
    }

    showWarning(message: string) {
        toast.warning('Advertencia', {
            description: message,
            duration: 5000,
            classes: {
                toast: '!border-l-4 !border-l-amber-500',
                title: '!text-amber-700',
            }
        });
    }

    showInfo(message: string) {
        toast.info('Información', {
            description: message,
            classes: {
                toast: '!border-l-4 !border-l-blue-500',
                title: '!text-blue-700',
            },
        });
    }
}
