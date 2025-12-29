import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, input, output, signal } from '@angular/core';

import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '@/shared/constants/limit.const';

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
    imports: [CommonModule],
    templateUrl: './file-upload.component.html'
})
export class FileUploadComponent {
    private destroyRef = inject(DestroyRef);
    // === CONFIGURACIÓN ===
    maxSizeBytes = input<number>(MAX_FILE_SIZE_BYTES);
    allowedMimeTypes = input<string[]>(ALLOWED_MIME_TYPES);
    maxFilesCount = input<number>(2);

    // === OUTPUTS ===
    filesChange = output<File[]>();
    uploadError = output<string>();

    // === SIGNALS ===
    files = signal<FileItem[]>([]);
    isDragging = signal(false);
    globalError = signal<string | null>(null);

    private uploadIntervals = new Map<string, any>();

    maxFileSizeMB = computed(() => Math.round(this.maxSizeBytes() / 1024 / 1024));

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

        if (currentCount + incomingCount > this.maxFilesCount()) {
            const msg = `Solo puedes subir un máximo de ${this.maxFilesCount()} archivos.`;
            this.globalError.set(msg);
            this.uploadError.emit(msg);
            return;
        }

        this.processFiles(fileList);
    }

    private processFiles(fileList: FileList) {
        const newItems: FileItem[] = [];

        Array.from(fileList).forEach(file => {
            const itemId = crypto.randomUUID();
            let errorMsg: string | null = null;

            try {
                this.validarArchivo(file);

                if (ALLOWED_MIME_TYPES.includes(file.type)) {
                    this.procesarPrevisualizacion(file, itemId);
                }

            } catch (err: any) {
                // TODO: Mejorar el sistema de logging
                if (err instanceof FileTooLargeError || err instanceof UnsupportedFileTypeError) {
                    errorMsg = err.message;
                } else {
                    errorMsg = "El archivo no pudo ser procesado. Verifique que sea un formato válido e intente nuevamente.";
                }

                this.uploadError.emit(errorMsg);
            }

            newItems.push({
                id: itemId,
                file: file,
                previewUrl: null,
                error: errorMsg,
                progress: errorMsg ? 0 : 0
            });

            if (!errorMsg) this.simulateUpload(itemId);
        });

        this.files.update(current => [...current, ...newItems]);
        this.emitValidFiles();
    }

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

    // === UI UTILS ===
    formatBytes(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
}
