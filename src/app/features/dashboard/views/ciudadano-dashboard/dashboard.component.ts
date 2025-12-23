import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Para DatePipe y UpperCasePipe
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '@/app/shared/ui/header/header.component';
import { SidebarComponent } from '@/app/shared/ui/sidebar/sidebar.component';
import { DenunciaFacade } from '@/app/data/services/denuncia.facade';
import { DenunciasTableComponent } from '@/app/shared/components/denuncias-table/denuncias-table.component';

@Component({
    selector: 'app-ciudadano-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, HeaderComponent, DenunciasTableComponent, SidebarComponent],
    templateUrl: './dashboard.component.html',
})

export class CiudadanoDashboardComponent {
    public denunciaService = inject(DenunciaFacade);
    private router = inject(Router);

    goToCreate(): void {
        this.router.navigate(['/ciudadano', 'create']);
    }

    protected denuncias = this.denunciaService.denuncias;

    // Data is loaded by the route resolver (`DenunciasResolver`) before activation.
}
