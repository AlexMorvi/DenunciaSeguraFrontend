import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DenunciaFacade } from '@/data/services/denuncia.facade';
import { DenunciasTableComponent } from '@/features/dashboard/ui/denuncias-table/denuncias-table.component';

@Component({
    selector: 'app-ciudadano-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, DenunciasTableComponent],
    templateUrl: './dashboard.page.html',
    styleUrls: ['./dashboard.page.scss']
})

export class CiudadanoDashboardPage {
    public denunciaService = inject(DenunciaFacade);
    private router = inject(Router);

    goToCreate(): void {
        this.router.navigate(['/ciudadano', 'create']);
    }

    protected denuncias = this.denunciaService.denuncias;

    // Data is loaded by the route resolver (`DenunciasResolver`) before activation.
}
