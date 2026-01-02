    // currentDenuncia = input.required<DenunciaStaffViewResponse>();
    currentDenuncia = input.required<any>();

        } catch (err) {
            // TODO: mejorar manejo de errores
            this.logger.error('Error al marcar denuncia como resuelta', err);
            this.toast.showError('No se pudo marcar la denuncia como resuelta. Intente nuevamente.');
            throw err;
        } finally {
            this.form.controls.comentarios.reset();
        }
