import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
    selector: 'app-skeleton-loader',
    imports: [],
    templateUrl: './skeleton-loader.html',
    styleUrl: './skeleton-loader.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonLoaderComponent {
    readonly type = input<'text' | 'title' | 'card' | 'circle'>('text');
}
