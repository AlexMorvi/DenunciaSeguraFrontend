import { AuthFacade } from '@/data/services/auth.facade';
import { DenunciaFacade } from '@/data/services/denuncia.facade';
import { DenunciasTableComponent } from '@/features/dashboard/ui/denuncias-table/denuncias-table.component';
import { SkeletonLoaderComponent } from '@/shared/components/skeleton-loader/skeleton-loader';
import { ROLES } from '@/shared/constants/roles.const';
import { UiStyleDirective } from '@/shared/style/ui-styles.directive';
import { SubmitButtonComponent } from '@/shared/ui/submit-button/submit-button.component';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
    faCheckCircle,
    faClipboardList,
    faFolderOpen,
    faPlus
} from '@fortawesome/free-solid-svg-icons';
import { StatCard } from '../interfaz/stat.model';
import { EstadisticasComponent } from '../ui/estadisticas/estadisticas.component';
// import { NotificacionFacade } from '@/data/services/notificacion.facade';

@Component({
    selector: 'app-ciudadano-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, DenunciasTableComponent, SkeletonLoaderComponent, SubmitButtonComponent, FontAwesomeModule, UiStyleDirective, EstadisticasComponent],
    templateUrl: './dashboard.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class CiudadanoDashboardPage implements OnInit {
    public denunciaService = inject(DenunciaFacade);
    private readonly router = inject(Router);
    private readonly authFacade = inject(AuthFacade);
    // private readonly notificacionFacade = inject(NotificacionFacade);

    public isLoading = computed(() =>
        this.denunciaService.loading() || this.authFacade.loading()
    );

    protected denuncias = this.denunciaService.denuncias;
    protected readonly faPlus = faPlus;

    userName = computed(() => this.authFacade.currentUser()?.nombre || "Usuario");
    showCreateButton = computed(() => this.authFacade.currentUser()?.rol === ROLES.CIUDADANO);

    ngOnInit(): void {
        this.denunciaService.loadAll();
    }

    goToCreate(): void {
        this.router.navigate(['denuncias', 'nueva']);
    }

    public stats = computed<StatCard[]>(() => {
        const allDenuncias = this.denuncias();
        const total = allDenuncias.length;

        const enProgreso = allDenuncias.filter(d => d.estadoDenuncia === 'EN_PROCESO').length;
        const resueltas = allDenuncias.filter(d => d.estadoDenuncia === 'RESUELTA').length;
        const rechazadas = allDenuncias.filter(d => d.estadoDenuncia === 'RECHAZADA').length;


        const finalizadas = resueltas + rechazadas;
        const tasaExito = finalizadas > 0 ? Math.round((resueltas / finalizadas) * 100) : 0;

        const hoy = new Date();
        const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const nuevasEsteMes = allDenuncias.filter(d => {
            const fechaCreacion = new Date(d.creadoEn!);
            return fechaCreacion >= primerDiaMes;
        }).length;
        const subtextTotal = nuevasEsteMes > 0 ? `↗ +${nuevasEsteMes} este mes` : 'No hay reportes nuevos este mes';

        return [
            {
                label: 'TOTAL REPORTES',
                value: total,
                subtext: subtextTotal,
                subtextClass: 'text-slate-500',
                icon: faFolderOpen,
                iconBgClass: 'bg-blue-50',
                iconColorClass: 'text-blue-200'
            },
            {
                label: 'EN PROGRESO',
                value: enProgreso,
                subtext: 'Requieren seguimiento',
                subtextClass: 'text-orange-500 font-medium',
                icon: faClipboardList,
                iconBgClass: 'bg-orange-50',
                iconColorClass: 'text-orange-200'
            },
            {
                label: 'RESUELTAS',
                value: resueltas,
                subtext: `${tasaExito}% tasa de éxito`,
                subtextClass: 'text-green-600 font-medium',
                icon: faCheckCircle,
                iconBgClass: 'bg-green-50',
                iconColorClass: 'text-green-200'
            }
        ];
    });
}
