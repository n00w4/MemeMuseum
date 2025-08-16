import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

const getCookie = (name: string): string | null => {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (const element of ca) {
    let c = element;
    while (c.startsWith(' ')) c = c.substring(1, c.length);
    if (c.startsWith(nameEQ)) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export function csrfInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const csrfToken = getCookie('XSRF-TOKEN');

  if (csrfToken && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const csrfReq = req.clone({
      setHeaders: {
        'X-XSRF-TOKEN': csrfToken,
      },
    });
    return next(csrfReq);
  }

  return next(req);
}