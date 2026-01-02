    // TODO: utilizar este signal para la denuncia actual
    // denuncia = this.denunciaService.currentDenuncia;
    currentUser = this.authService.currentUser;
    // TODO: Lo comentado es la implementación final, por ahora devuelve siempre true
    isJefe = computed(() => {
        // const rol = this.authService.currentUser()?.rol;
        // return [ROLES.JEFE_INTERNO, ROLES.JEFE_EXTERNO].includes(rol as any);
        return true;
    });

    isSupervisor = computed(() => {
        // const rol = this.authService.currentUser()?.rol;
        // return this.authService.currentUser()?.rol === ROLES.SUPERVISOR;
        return false;
    });

    isOperador = computed(() => {
        // const rol = this.authService.currentUser()?.rol;
        // return [ROLES.OPERADOR_INTERNO, ROLES.OPERADOR_EXTERNO].includes(rol as any);
        return false;
    });

    // TODO: eliminar este signal temporal y utilizar el de la fachada
    denuncia = signal<any>({
        id: 4921,
        titulo: 'Bache profundo en vía principal',
        descripcion: 'He notado un bache de gran tamaño que ha ido creciendo...',
        estado: 'RECIBIDA',
        fechaCreacion: new Date().toISOString(),
        autor: 'Juan Pérez',
        categoria: 'Infraestructura Vial',
        subcategoria: 'Mantenimiento de Pavimento',
        lat: -0.18,
        lng: -78.4,
        prioridad: 'Alta',
        evidencias: [
            { type: 'image', url: 'assets/bache1.jpg' },
            { type: 'image', url: 'assets/bache2.jpg' }
        ],
        ubicacion: { lat: -0.18, lng: -78.4, address: 'Av. Siempre Viva 123' }
    });
