import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  // The local Bancor scanner service doesn't allow the Authorization header in
  // its CORS preflight — device calls must go out without auth headers.
  if (req.url.includes('localhost:6077') || req.url.startsWith('/scanner-api')) {
    return next(req);
  }

  const token = sessionStorage.getItem('access_token');
   
  const isFormData = req.body instanceof FormData;
  
  if (token) {
    // For FormData, don't set Content-Type (browser will set it with boundary)
    const headers: any = {
      Authorization: `Bearer ${token}`,
      'Accept': 'application/json'
    };
    
    // Only set Content-Type for non-FormData requests
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    const authReq = req.clone({
      setHeaders: headers
    });
    return next(authReq);
  }
  
  // For requests without token
  const headers: any = {
    'Accept': 'application/json'
  };
  
  // Only set Content-Type for non-FormData requests
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  const modifiedReq = req.clone({
    setHeaders: headers
  });
  
  return next(modifiedReq);
};
