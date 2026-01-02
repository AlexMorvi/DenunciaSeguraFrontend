        if (!rawUrl.startsWith('https://')) {
            // TODO: En desarrollo localhost podría ser http, ajusta según environment
            // TODO: Loggear correctamente este incidente
            console.warn('[Security] Bloqueado (No HTTPS):', rawUrl);
            return { url: null, error: 'Fuente no segura' };
        }
            // TODO: añadir el url de los dominios permitidos en producción
            const allowList = ['tu-bucket.s3.amazonaws.com', 'api.tudominio.com', 'storage.googleapis.com'];
            if (!isAllowed) {
                // TODO: Loggear correctamente este incidente
                console.warn('[Security] Dominio no autorizado:', urlObj.hostname);
                return { url: null, error: 'Dominio externo no permitido' };
            }
        } catch (e) {
            // TODO: Loguear correctamente esto
            return { url: null, error: 'URL mal formada' };
        }
