import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition, faSpinner, faCircle } from '@fortawesome/free-solid-svg-icons';

type ButtonVariant = 'small' | 'medium' | 'full';
type ButtonAppearance = 'primary' | 'secondary' | 'danger';

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

    @Input() isLoading = false;
    @Input() isDisabled = false;
    @Input({ required: true }) label = '';
    @Input() loadingLabel = 'Cargando...';
    @Input() icon: IconDefinition | null = null;
    @Input() btnType: 'submit' | 'button' | 'reset' = 'submit';
    @Input() variant: ButtonVariant = 'full';
    @Input() appearance: ButtonAppearance = 'primary';

    get rootClasses(): string {
        const base = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1';

        const disabledState = 'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none';

        const sizes = {
            small: 'px-3 py-1.5 text-xs',
            medium: 'px-4 py-2 text-sm',
            full: 'w-full px-5 py-2.5 text-sm'
        };

        const colors = {
            primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
            secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-200',
            danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
        };

        return `${base} ${disabledState} ${sizes[this.variant]} ${colors[this.appearance]}`;
    }

    get iconSizeClasses(): string {
        return this.variant === 'small' ? 'text-xs' : 'text-sm';
    }
}
