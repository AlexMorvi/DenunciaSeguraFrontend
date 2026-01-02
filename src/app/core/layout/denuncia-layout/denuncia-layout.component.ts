import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
    selector: 'app-denuncia-layout',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './denuncia-layout.component.html',
    styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
  `]
})
export class DenunciaLayoutComponent {
    hasActionsPanel = input(true);
}
