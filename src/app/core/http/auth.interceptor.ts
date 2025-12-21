import { HttpInterceptorFn } from '@angular/common/http';
import { SKIP_AUTH } from '../http/http-context';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    if (req.context.get(SKIP_AUTH) === true) {
        return next(req);
    }

    const mockToken = 'soy-un-token-falso-para-el-mock';

    const authReq = req.clone({
        setHeaders: {
            Authorization: `Bearer ${mockToken}`
        }
    });

    return next(authReq);
};
