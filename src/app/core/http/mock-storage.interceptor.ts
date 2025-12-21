import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

export const mockStorageInterceptor: HttpInterceptorFn = (req, next) => {
    const esUrlDeMock = req.url.includes('storage.example.com') || req.url.includes('signed-url');

    if (esUrlDeMock && req.method === 'PUT') {
        console.warn('🚨 [MockInterceptor] Interceptando subida a URL falsa:', req.url);
        return of(new HttpResponse({ status: 200, body: null })).pipe(delay(1500));
    }

    return next(req);
};
