import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, OnDestroy, output, signal } from '@angular/core';
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
}

@Component({
    selector: 'app-file-upload',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './file-upload.component.html'
})
export class FileUploadComponent implements OnDestroy {
    // === CONFIGURACIÓN ===
    maxSizeBytes = input<number>(MAX_FILE_SIZE_BYTES);
    allowedMimeTypes = input<string[]>(ALLOWED_MIME_TYPES);
    maxFilesCount = input<number>(2);

    // === OUTPUTS ===
    filesChange = output<File[]>();

    // === SIGNALS ===
    files = signal<FileItem[]>([]);
    isDragging = signal(false);
    globalError = signal<string | null>(null);

    maxFileSizeMB = computed(() => Math.round(this.maxSizeBytes() / 1024 / 1024));

    // === CONTROL DE MEMORIA ===
    private activeIntervals: Set<any> = new Set();

    ngOnDestroy(): void {
        // Limpieza crítica para evitar Memory Leaks
        this.activeIntervals.forEach(interval => clearInterval(interval));
        this.activeIntervals.clear();
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
            this.globalError.set(`Solo puedes subir un máximo de ${this.maxFilesCount()} archivos.`);
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

                // Solo generamos preview si es válido y es imagen
                // Y NO es un SVG (Vector de ataque XSS común)
                if (ALLOWED_MIME_TYPES.includes(file.type)) {
                    this.procesarPrevisualizacion(file, itemId);
                }

            } catch (err: any) {
                if (err instanceof FileTooLargeError || err instanceof UnsupportedFileTypeError) {
                    errorMsg = err.message;
                } else {
                    errorMsg = 'Error al procesar el archivo.';
                }
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
        // Validación de Tamaño
        if (file.size > this.maxSizeBytes()) {
            throw new FileTooLargeError(`Excede ${this.maxFileSizeMB()}MB.`);
        }

        // Validación de MIME Type contra la lista permitida
        if (!this.allowedMimeTypes().includes(file.type)) {
            throw new UnsupportedFileTypeError(`Formato no soportado.`);
        }

        // Validación Extra: Bloqueo explícito de SVG por seguridad
        // Los SVG pueden contener scripts incrustados
        if (file.type.includes('svg')) {
            throw new UnsupportedFileTypeError(`Por seguridad, no se admiten archivos SVG.`);
        }
    }
    private procesarPrevisualizacion(file: File, itemId: string): void {
        // 1. Doble check de seguridad (Tamaño)
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
                    console.warn(`Posible Mime Type mismatch o archivo corrupto: ${file.name}`);

                    this.files.update(items =>
                        items.map(item =>
                            item.id === itemId
                                ? {
                                    ...item,
                                    error: 'El archivo parece estar dañado o no es una imagen válida.',
                                    previewUrl: null, // Aseguramos que no haya preview
                                    progress: 0       // Cancelamos visualmente el progreso
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
                this.activeIntervals.delete(interval); // Limpiamos referencia
            }

            this.files.update(currentFiles =>
                currentFiles.map(fileItem =>
                    fileItem.id === itemId ? { ...fileItem, progress: progress } : fileItem
                )
            );
        }, 150);

        // Guardamos la referencia para cancelarla en ngOnDestroy
        this.activeIntervals.add(interval);
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
