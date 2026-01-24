import { HttpInterceptorFn } from '@angular/common/http';

export const stripTrailingSlashInterceptor: HttpInterceptorFn = (req, next) => {
    // Verificamos si la URL termina en '/' y no es solo la raíz '/'
    if (req.url.endsWith('/') && req.url.length > 1) {
        const newUrl = req.url.slice(0, -1);
        const clonedReq = req.clone({ url: newUrl });
        return next(clonedReq);
    }
    return next(req);
};
