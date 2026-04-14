import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    // Wait for the initial auth check to complete
    if (this.authService.isLoading) {
      await new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          if (!this.authService.isLoading) {
            clearInterval(interval);
            resolve();
          }
        }, 50);
      });
    }

    if (this.authService.isAuthenticated) {
      return true;
    }

    this.router.navigate(['/sign-in']);
    return false;
  }
}
