import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Para DatePipe y UpperCasePipe
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '@/app/shared/header/header.component';
import { SidebarComponent } from '@/app/shared/sidebar/sidebar.component';
import { DenunciaService } from '@/app/data/services/denuncia.service';
import { DenunciasTableComponent } from '@/app/shared/denuncias-table/denuncias-table.component';

@Component({
    selector: 'app-ciudadano-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, HeaderComponent, DenunciasTableComponent, SidebarComponent],
    templateUrl: './dashboard.component.html',
})

export class CiudadanoDashboardComponent {
    public denunciaService = inject(DenunciaService);
    private router = inject(Router);

    goToCreate(): void {
        this.router.navigate(['/ciudadano', 'create']);
    }

    protected denuncias = this.denunciaService.denuncias;
}
