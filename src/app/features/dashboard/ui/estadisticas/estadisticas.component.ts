import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { StatCard } from '../../interfaz/stat.model';

@Component({
    selector: 'app-estadisticas',
    standalone: true,
    imports: [CommonModule, FontAwesomeModule],
    templateUrl: './estadisticas.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EstadisticasComponent {
    stats = input<StatCard[] | null>();
}

