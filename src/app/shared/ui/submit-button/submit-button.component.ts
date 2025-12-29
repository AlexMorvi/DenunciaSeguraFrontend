import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition, faSpinner, faCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-submit-button',
    standalone: true,
    imports: [CommonModule, FontAwesomeModule],
    templateUrl: './submit-button.componente.html',
    styles: [`
        :host {
            display: block;
        }
    `]
})
export class SubmitButtonComponent {
    protected readonly faSpinner = faSpinner;
    protected readonly faDefault: IconDefinition = faCircle;

    @Input() isLoading: boolean = false;
    @Input() isDisabled: boolean = false;
    @Input({ required: true }) label: string = '';
    @Input() loadingLabel: string = 'Cargando...';
    @Input() icon: IconDefinition | null = null;
    @Input() variant: 'full' | 'medium' | 'small' = 'full';
    @Input() appearance: 'primary' | 'secondary' = 'primary';
    @Input() btnType: 'submit' | 'button' | 'reset' = 'submit';

    get buttonClasses(): string {
        const shared = 'inline-flex items-center justify-center rounded-lg transition-all duration-200 shadow-sm hover:shadow-md';

        const variantSizes: Record<'small' | 'medium' | 'full', string> = {
            small: 'px-3 py-3 text-xs',
            medium: 'px-5 py-3 text-sm',
            full: 'w-full py-3'
        };

        if (this.appearance === 'primary') {
            if (this.variant === 'full') {
                return `${variantSizes.full} bg-blue-500 text-white rounded-lg font-medium flex items-center justify-center space-x-2 ${shared}`;
            }

            const ring = this.variant === 'medium' ? 'focus:ring-4 focus:ring-blue-300' : 'focus:ring-3 focus:ring-blue-300';
            return `${variantSizes[this.variant]} border border-transparent font-medium text-white bg-blue-600 hover:bg-blue-700 ${ring} ${shared}`;
        }

        // secondary
        if (this.appearance === 'secondary') {
            if (this.variant === 'full') {
                return `${variantSizes.full} px-4 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200`;
            }

            return `${variantSizes[this.variant]} border border-gray-300 font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 ${shared}`;
        }

        return '';
    }

}
