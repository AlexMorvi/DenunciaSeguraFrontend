import { Component, signal, inject, OnInit } from '@angular/core';
import { DenunciaStaffViewResponse } from '@/core/api/denuncias/models/denuncia-staff-view-response';
import { DenunciaLayoutComponent } from '@/core/layout/denuncia-layout/denuncia-layout.component';
import { DenunciaDetailsComponent } from '@/shared/ui/denuncia-details/denuncia-details.component';
import { ActionsSupervisorComponent } from '@/shared/ui/actions-panel/action-supervisor/actions-supervisor.component';
import { ActionsOperadorComponent } from '@/shared/ui/actions-panel/action-operador/actions-operador.component';
import { ActionsJefeComponent } from '@/shared/ui/actions-panel/action-jefe/actions-jefe.component';
import { DenunciaFacade } from '@/data/services/denuncia.facade';
import { AuthFacade } from '@/data/services/auth.facade';

@Component({
    selector: 'app-denuncia-page',
    standalone: true,
    imports: [DenunciaLayoutComponent, DenunciaDetailsComponent, ActionsSupervisorComponent, ActionsJefeComponent, ActionsOperadorComponent],
    templateUrl: './denuncia.page.html',
})
export class DenunciaPageComponent implements OnInit {
    denunciaService = inject(DenunciaFacade);
    authService = inject(AuthFacade);

    // TODO: Lo comentado es la implementación final, por ahora devuelve siempre true
    isJefe() {
        //     // const rol = this.authService.currentUser()?.rol;
        //     // return rol === 'JEFE_INTERNO' || rol === 'JEFE_EXTERNO';
        //     return true;
    }
    isOperador() {
        // const rol = this.authService.currentUser()?.rol;
        // return rol === 'OPERADOR_INTERNO' || rol === 'OPERADOR_EXTERNO';
        return true;
    }
    isSupervisor() {
        // const rol = this.authService.currentUser()?.rol;
        // return rol === 'SUPERVISOR_DENUNCIAS';
    }

    // TODO: utilizar el tipo correcto
    denunciaSignal = signal<any>({
        // denunciaSignal = signal<DenunciaStaffViewResponse>({
        id: 4921,
        titulo: 'Bache profundo en vía principal',
        descripcion: 'He notado un bache de gran tamaño que ha ido creciendo...',
        estado: 'RECIBIDA',
        fechaCreacion: new Date().toISOString(),
        autor: 'Juan Pérez',
        categoria: 'Infraestructura Vial',
        subcategoria: 'Mantenimiento de Pavimento',
        lat: -0.18,
        lng: -78.4,
        prioridad: 'Alta',
        evidencias: [
            { type: 'image', url: 'assets/bache1.jpg' },
            { type: 'image', url: 'assets/bache2.jpg' }
        ],
        ubicacion: { lat: -0.18, lng: -78.4, address: 'Av. Siempre Viva 123' }
    });

    ngOnInit() {
        this.denunciaService.getById(4921).then(data => this.denunciaSignal.set(data));
    }

    // MANEJO DE ACCIONES (Lógica de Negocio)
    // handleStatusUpdate(cambios: { prioridad: any }) { } /* {
    //     // 1. Llamada a API (simulada)
    //     console.log('Actualizando prioridad en API...', cambios);

    //     // 2. Actualización Optimista del UI (Sincronización Inmediata)
    //     this.denunciaSignal.update(state => ({
    //         ...state,
    //         prioridad: cambios.prioridad
    //     }));
    //     // Al actualizar el signal, el componente de la izquierda (Details) 
    //     // detectará el cambio y se repintará automáticamente.*/


    // handleAssignment(notas: string) {/* 
    //     console.log('Guardando asignación:', notas);
    //     // Simular cambio de estado a 'En Proceso'
    //     this.denunciaSignal.update(state => ({
    //         ...state,
    //         estado: 'En Proceso'
    //     })); */
    // }
}
