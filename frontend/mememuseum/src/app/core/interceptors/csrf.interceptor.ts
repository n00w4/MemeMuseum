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

  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const clonedRequest = req.clone({
      setHeaders: csrfToken ? { 'X-XSRF-TOKEN': csrfToken } : {},
      withCredentials: true,
    });
    return next(clonedRequest);
  }

  if (!req.withCredentials) {
    return next(req.clone({ withCredentials: true }));
  }

  return next(req);
}
