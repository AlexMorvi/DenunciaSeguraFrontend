import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DenunciaFacade } from '@/data/services/denuncia.facade';
import { DenunciasTableComponent } from '@/features/dashboard/ui/denuncias-table/denuncias-table.component';
import { SkeletonLoaderComponent } from '@/shared/components/skeleton-loader/skeleton-loader';

@Component({
    selector: 'app-ciudadano-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, DenunciasTableComponent, SkeletonLoaderComponent],
    templateUrl: './dashboard.page.html',
    styleUrls: ['./dashboard.page.scss']
})

export class CiudadanoDashboardPage implements OnInit {
    public denunciaService = inject(DenunciaFacade);
    private router = inject(Router);
    public isLoading = this.denunciaService.loading;
    protected denuncias = this.denunciaService.denuncias;

    ngOnInit(): void {
        this.denunciaService.loadAll();
    }

    goToCreate(): void {
        this.router.navigate(['/ciudadano', 'denuncias', 'nueva']);
    }
}
