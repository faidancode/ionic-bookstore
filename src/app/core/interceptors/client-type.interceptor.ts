import { HttpInterceptorFn } from '@angular/common/http';

export const clientTypeInterceptor: HttpInterceptorFn = (req, next) => {
    const cloned = req.clone({
        setHeaders: {
            'x-client-type': 'mobile',
            'Accept': 'application/json',
        },
    });

    return next(cloned);
};