import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function numericValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) return null;
        const isValid = /^\d+$/.test(control.value);
        return isValid ? null : { numeric: true };
    };
}
