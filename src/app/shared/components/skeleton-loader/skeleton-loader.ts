import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
    selector: 'app-skeleton-loader',
    standalone: true,
    templateUrl: './skeleton-loader.html',
    styleUrl: './skeleton-loader.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonLoaderComponent {
    skeletonClass = input<string>('');
}
