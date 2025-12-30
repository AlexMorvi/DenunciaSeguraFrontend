import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
    selector: 'app-skeleton-loader',
    standalone: true,
    imports: [NgClass],
    templateUrl: './skeleton-loader.html',
    styleUrl: './skeleton-loader.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonLoaderComponent {
    customClass = input<string>('');
}
