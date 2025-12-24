import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DenunciaFacade } from '@/data/services/denuncia.facade';
import { DenunciasTableComponent } from '@/features/dashboard/ui/denuncias-table/denuncias-table.component';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, DenunciasTableComponent],
    templateUrl: './dashboard.page.html',
})

export class AdminDashboardPage {
    public denunciaService = inject(DenunciaFacade);
    private router = inject(Router);

    goToCreate(): void {
        this.router.navigate(['/admin', 'create']);
    }

    protected denuncias = this.denunciaService.denuncias;
}
