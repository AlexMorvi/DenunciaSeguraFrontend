import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para DatePipe y UpperCasePipe
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '@/app/shared/header/header.component';
import { SidebarComponent } from '@/app/shared/sidebar/sidebar.component';
import { DenunciaService } from '@/app/features/ciudadano/dashboard/denuncia.service';
import { DenunciasTableComponent } from '@/app/shared/denuncias-table/denuncias-table.component';

@Component({
    selector: 'app-ciudadano-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, HeaderComponent, DenunciasTableComponent, SidebarComponent],
    templateUrl: './dashboard.component.html',
})
// export class DenunciasListComponent implements OnInit {
export class CiudadanoDashboardComponent implements OnInit {
    public denunciaService = inject(DenunciaService);

    goToCreate(): void {
        // Placeholder for navigation to the 'create denuncia' page
    }
    ngOnInit(): void {
        // Aquí se dispara la petición HTTP
        // this.denunciaService.getAll().subscribe({
        //     error: (err) => console.error('Error cargando denuncias', err)
        // });
    }
}
