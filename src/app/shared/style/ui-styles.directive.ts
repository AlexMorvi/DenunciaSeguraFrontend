import { Directive, input, computed } from '@angular/core';

export type TextVariant = 'h1' | 'h2' | 'h3' | 'subtitle' | 'body' | 'light-body' | 'caption' | 'label' | 'link' | 'body-link';

@Directive({
    selector: '[appText]',
    standalone: true,
    host: {
        '[class]': 'variantClasses()'
    }
})
export class UiStyleDirective {
    variant = input<TextVariant>('body', { alias: 'appText' });

    private stylesMap: Record<TextVariant, string> = {
        'h1': 'text-4xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3',
        'h2': 'text-center text-3xl md:text-2xl font-bold text-slate-800 mb-4 tracking-tight',
        'h3': 'text-lg font-semibold text-slate-900 mb-2',
        'subtitle': 'text-m md:text-base text-slate-900 font-bold leading-relaxed break-anywhere',
        'body': 'text-sm md:text-base text-slate-900 font-normal leading-relaxed break-anywhere',
        'light-body': 'text-sm md:text-base text-slate-500 font-normal leading-relaxed break-anywhere',
        'body-link': 'text-center text-sm text-gray-600 mr-2',
        'link': 'inline-flex items-center justify-center gap-2 font-medium text-blue-600 transition-colors rounded-sm hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 text-sm',
        'label': 'text-sm font-semibold text-slate-700 mb-1.5 block',
        'caption': 'text-xs text-slate-500 font-medium text-center',
    };

    protected variantClasses = computed(() => {
        return this.stylesMap[this.variant()] || this.stylesMap['body'];
    });
}
