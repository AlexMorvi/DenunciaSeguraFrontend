import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

    // 1. Definimos un token falso. 
    // Prism no valida que sea un JWT real criptográficamente, solo valida que el header EXISTA.
    const mockToken = 'soy-un-token-falso-para-el-mock';

    // 2. Clonamos la petición y le pegamos el header Authorization
    const authReq = req.clone({
        setHeaders: {
            Authorization: `Bearer ${mockToken}`
        }
    });

    // 3. Enviamos la petición clonada
    return next(authReq);
};
