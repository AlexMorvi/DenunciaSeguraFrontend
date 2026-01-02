    // TODO: Utilizar la denuncia actual que envía denuncia page
    // currentDenuncia = input.required<DenunciaStaffViewResponse>();
    currentDenuncia = input.required<any>();
    // TODO: Cargar lista real de operadores desde un servicio
    operadores = signal<string[]>(['1 - Operador Alpha', '2 - Operador Bravo', '3 - Operador Charlie']);
        // TODO: Obtener de forma correcta el operadorId
        const selection = this.form.controls.operadorId.value;

        if (typeof selection !== 'string' || !selection.trim()) {
            this.form.controls.operadorId.setErrors({ invalidOperator: true });
            this.toast.showError('Selecciona un operador válido.');
            return;
        }
