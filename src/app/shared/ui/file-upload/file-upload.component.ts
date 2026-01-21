import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, input, output, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPaperclip, faCloudUploadAlt, faCheckCircle, faXmark, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '@/shared/constants/limit.const';
import { FileUploadErrorEvent } from '@/core/model/file-upload.event';

// --- Clases de Error ---
class FileTooLargeError extends Error {
    constructor(message: string) { super(message); this.name = "FileTooLargeError"; }
}

class UnsupportedFileTypeError extends Error {
    constructor(message: string) { super(message); this.name = "UnsupportedFileTypeError"; }
}

export interface FileItem {
    id: string;
    file: File;
    previewUrl: string | null;
    error: string | null;
    progress: number;
    completed?: boolean;
}

@Component({
    selector: 'app-file-upload',
    standalone: true,
    imports: [CommonModule, FontAwesomeModule],
    templateUrl: './file-upload.component.html'
})
export class FileUploadComponent {
    private readonly destroyRef = inject(DestroyRef);

    // === CONFIGURACIÓN ===
    maxSizeBytes = input<number>(MAX_FILE_SIZE_BYTES);
    allowedMimeTypes = input<string[]>(ALLOWED_MIME_TYPES);
    maxFilesCount = input<number>(3);
    uploadFn = input.required<(file: File) => Promise<string>>();

    // === OUTPUTS ===
    filesChange = output<File[]>();
    fileUploaded = output<string>();
    uploadError = output<FileUploadErrorEvent>();

    // === SIGNALS ===
    files = signal<FileItem[]>([]);
    isDragging = signal(false);
    globalError = signal<string | null>(null);

    private readonly uploadIntervals = new Map<string, any>();

    maxFileSizeMB = computed(() => Math.round(this.maxSizeBytes() / 1024 / 1024));

    // Icons
    protected readonly faPaperclip = faPaperclip;
    protected readonly faCloudUploadAlt = faCloudUploadAlt;
    protected readonly faCheckCircle = faCheckCircle;
    protected readonly faXmark = faXmark;
    protected readonly faInfoCircle = faInfoCircle;

    constructor() {
        this.destroyRef.onDestroy(() => {
            this.uploadIntervals.forEach((intervalId) => clearInterval(intervalId));
            this.uploadIntervals.clear();
        });
    }

    // === EVENTOS DEL DOM ===
    onDragOver(e: DragEvent) {
        e.preventDefault(); e.stopPropagation();
        this.isDragging.set(true);
    }

    onDragLeave(e: DragEvent) {
        e.preventDefault(); e.stopPropagation();
        this.isDragging.set(false);
    }

    onDrop(e: DragEvent) {
        e.preventDefault(); e.stopPropagation();
        this.isDragging.set(false);
        const dropped = e.dataTransfer?.files;
        if (dropped) this.handleFileBatch(dropped);
    }

    onFileSelected(e: Event) {
        this.globalError.set(null);
        const input = e.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.handleFileBatch(input.files);
            input.value = '';
        }
    }

    // === LÓGICA PRINCIPAL ===
    readonly isImage = (file: File): boolean => {
        return file.type.startsWith('image/');
    };

    private handleFileBatch(fileList: FileList) {
        const currentCount = this.files().length;
        const incomingCount = fileList.length;
        const excedeLimite = currentCount + incomingCount > this.maxFilesCount();

        if (excedeLimite) {
            this.uploadError.emit({
                userMessage: `Solo puedes subir ${this.maxFilesCount()} archivos.`,

                technicalMessage: 'Upload Batch Limit Exceeded',
                severity: 'WARNING',
                logData: {
                    limit: this.maxFilesCount(),
                    current: currentCount,
                    attempted: incomingCount
                }
            });
            return;
        }
        this.processFiles(fileList);
    }


    /*     private processFiles(fileList: FileList) {
            const newItems: FileItem[] = [];
    
            Array.from(fileList).forEach(file => {
                const itemId = crypto.randomUUID();
                let errorEvent: FileUploadErrorEvent | null = null;
    
                try {
                    this.validarArchivo(file);
    
                    if (ALLOWED_MIME_TYPES.includes(file.type)) {
                        this.procesarPrevisualizacion(file, itemId);
                    }
    
                } catch (err: any) {
                    const isSizeError = err instanceof FileTooLargeError;
                    const isTypeError = err instanceof UnsupportedFileTypeError;
    
                    const userMsg = isSizeError || isTypeError
                        ? err.message
                        : 'El archivo no pudo ser procesado. Verifique el formato e intente nuevamente.';
    
                    errorEvent = {
                        userMessage: userMsg,
                        technicalMessage: 'File Validation Failed',
                        severity: 'WARNING',
                        logData: {
                            fileName: file.name,
                            fileType: file.type,
                            fileSize: file.size,
                            reason: isSizeError ? 'SIZE_LIMIT' : (isTypeError ? 'INVALID_TYPE' : 'UNKNOWN'),
                            originalError: !isSizeError && !isTypeError ? err.toString() : null
                        }
                    };
                }
    
                newItems.push({
                    id: itemId,
                    file: file,
                    previewUrl: null,
                    error: errorEvent?.userMessage ?? null,
                    progress: errorEvent ? 0 : 0
                });
    
                if (errorEvent) {
                    this.uploadError.emit(errorEvent);
                } else if (this.uploadFn()) {
                    this.realUpload(itemId, file);
                } else {
                    this.simulateUpload(itemId);
                }
            });
    
            this.files.update(current => [...current, ...newItems]);
            this.emitValidFiles();
        } */

    private validarArchivo(file: File): void {
        if (file.size > this.maxSizeBytes()) {
            throw new FileTooLargeError(`Excede ${this.maxFileSizeMB()}MB.`);
        }

        if (!this.allowedMimeTypes().includes(file.type)) {
            throw new UnsupportedFileTypeError(`Formato no soportado.`);
        }

        if (file.type.includes('svg')) {
            throw new UnsupportedFileTypeError(`Por seguridad, no se admiten archivos SVG.`);
        }
    }

    private procesarPrevisualizacion(file: File, itemId: string): void {
        if (file.size > this.maxSizeBytes()) return;

        const reader = new FileReader();

        reader.onload = (e) => {
            const result = e.target?.result;

            if (typeof result === 'string') {
                const isDataUrlImage = result.startsWith('data:image/');

                if (isDataUrlImage) {
                    this.files.update(items =>
                        items.map(item => item.id === itemId ? { ...item, previewUrl: result } : item)
                    );
                } else {

                    this.files.update(items =>
                        items.map(item =>
                            item.id === itemId
                                ? {
                                    ...item,
                                    error: 'El archivo parece estar dañado o no es una imagen válida.',
                                    previewUrl: null,
                                    progress: 0
                                }
                                : item
                        )
                    );
                }
            }
        };

        reader.readAsDataURL(file);
    }

    removeFile(id: string) {
        const intervalId = this.uploadIntervals.get(id);
        if (intervalId) {
            clearInterval(intervalId);
            this.uploadIntervals.delete(id);
        }

        this.files.update(items => items.filter(i => i.id !== id));
        this.emitValidFiles();
    }

    private emitValidFiles() {
        const validFiles = this.files()
            .filter(i => !i.error)
            .map(i => i.file);

        this.filesChange.emit(validFiles);
    }

    private async realUpload(itemId: string, file: File) {
        // Simular progreso visual hasta 90%
        const progressInterval = setInterval(() => {
            this.files.update(items =>
                items.map(i => {
                    if (i.id === itemId && i.progress < 90) {
                        return { ...i, progress: i.progress + 5 };
                    }
                    return i;
                })
            );
        }, 200);
        this.uploadIntervals.set(itemId, progressInterval);

        try {
            const uploader = this.uploadFn();
            if (!uploader) throw new Error("No uploader function");

            const id = await uploader(file);

            clearInterval(progressInterval);
            this.uploadIntervals.delete(itemId);

            this.files.update(items =>
                items.map(i => i.id === itemId ? { ...i, progress: 100, completed: true } : i)
            );
            this.fileUploaded.emit(id);
            this.emitValidFiles();
        } catch (error: any) {
            clearInterval(progressInterval);
            this.uploadIntervals.delete(itemId);

            this.files.update(items =>
                items.map(i => i.id === itemId ? { ...i, error: error.message || 'Error al subir', progress: 0 } : i)
            );
        }
    }

    private simulateUpload(itemId: string) {
        let progress = 0;

        const interval = setInterval(() => {
            progress += Math.random() * 20;

            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                this.uploadIntervals.delete(itemId);
                this.files.update(currentFiles =>
                    currentFiles.map(fileItem =>
                        fileItem.id === itemId
                            ? { ...fileItem, progress: 100, completed: true }
                            : fileItem
                    )
                );
                return;
            }

            this.files.update(currentFiles =>
                currentFiles.map(fileItem =>
                    fileItem.id === itemId ? { ...fileItem, progress: progress } : fileItem
                )
            );
        }, 150);

        this.uploadIntervals.set(itemId, interval);
    }

    formatBytes(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        // CAMBIO AQUÍ: Usar Number.parseFloat
        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // === UI UTILS ===
    private processFiles(fileList: FileList) {
        const newItems: FileItem[] = [];

        Array.from(fileList).forEach(file => {
            const itemId = crypto.randomUUID();
            let errorEvent: FileUploadErrorEvent | null = null;

            try {
                this.validarArchivo(file);
                if (ALLOWED_MIME_TYPES.includes(file.type)) {
                    this.procesarPrevisualizacion(file, itemId);
                }
            } catch (err: any) {
                // Extraemos la lógica compleja a una función auxiliar
                errorEvent = this.generateErrorEvent(file, err);
            }

            newItems.push({
                id: itemId,
                file: file,
                previewUrl: null,
                error: errorEvent?.userMessage ?? null, // Simplificado
                progress: 0 // Si hay error o no, inicia en 0
            });

            this.handleUploadTrigger(itemId, file, errorEvent);
        });

        this.files.update(current => [...current, ...newItems]);
        this.emitValidFiles();
    }

    // ---------------------------------------------------------
    // Nuevos métodos auxiliares (Helpers)
    // ---------------------------------------------------------

    private generateErrorEvent(file: File, err: any): FileUploadErrorEvent {
        const isSizeError = err instanceof FileTooLargeError;
        const isTypeError = err instanceof UnsupportedFileTypeError;
        const isKnownError = isSizeError || isTypeError;

        // Resolvemos el mensaje de usuario
        const userMsg = isKnownError
            ? err.message
            : 'El archivo no pudo ser procesado. Verifique el formato e intente nuevamente.';

        // Resolvemos la razón técnica (Adiós al ternario anidado)
        let reason = 'UNKNOWN';
        if (isSizeError) reason = 'SIZE_LIMIT';
        else if (isTypeError) reason = 'INVALID_TYPE';

        return {
            userMessage: userMsg,
            technicalMessage: 'File Validation Failed',
            severity: 'WARNING',
            logData: {
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                reason: reason,
                originalError: isKnownError ? null : err.toString()
            }
        };
    }

    private handleUploadTrigger(itemId: string, file: File, errorEvent: FileUploadErrorEvent | null) {
        if (errorEvent) {
            this.uploadError.emit(errorEvent);
            return;
        }

        if (this.uploadFn()) {
            this.realUpload(itemId, file);
        } else {
            this.simulateUpload(itemId);
        }
    }
}
