import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth, user, User } from '@angular/fire/auth';
import { from, switchMap, take } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  
  // Only add token to /api/ requests
  if (!req.url.includes('/api/')) {
    return next(req);
  }

  return user(auth).pipe(
    take(1),
    switchMap(u => {
      const currentUser = u as User | null;
      if (currentUser) {
        return from(currentUser.getIdToken()).pipe(
          switchMap(token => {
            const authReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`
              }
            });
            return next(authReq);
          })
        );
      }
      return next(req);
    })
  );
};
