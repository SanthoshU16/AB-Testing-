import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { UserProfile } from '../../models/user.model';

@Component({
  selector: 'app-admin-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-topbar.component.html',
  styleUrls: ['./admin-topbar.component.css']
})
export class AdminTopbarComponent implements OnInit {
  userProfile: UserProfile | null = null;
  pageTitle: string = 'Dashboard';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updatePageTitle(event.urlAfterRedirects);
    });
  }

  ngOnInit(): void {
    this.authService.userProfile$.subscribe(profile => {
      this.userProfile = profile;
    });
    this.updatePageTitle(this.router.url);
  }

  updatePageTitle(url: string) {
    const segments = url.split('/').filter(s => s);
    if (segments.length > 1) {
      const lastSegment = segments[segments.length - 1];
      this.pageTitle = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
    } else {
      this.pageTitle = 'Dashboard'; // Fallback
    }
  }

  async onSignOut(): Promise<void> {
    await this.authService.signOut();
  }
}
