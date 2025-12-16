// src/app/services/denuncia.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@/environments/environment';
import { Denuncia } from '@/app/features/ciudadano/dashboard/denuncia.interface';
import { tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DenunciaService {
    // private http = inject(HttpClient);
    // URL base a tu API Spring Boot
    private apiUrl = `${environment.apiUrl}/api/ciudadano/denuncias`;

    // Signal para almacenar el estado actual de las denuncias en el frontend
    // Esto permite que múltiples componentes reaccionen a cambios en la lista
    denuncias = signal<Denuncia[]>([]);

    getAll() {
        // return this.http.get<Denuncia[]>(this.apiUrl).pipe(
        //     // Actualizamos la signal cuando llegan los datos reales
        //     tap(data => this.denuncias.set(data))
        // );
    }
}
