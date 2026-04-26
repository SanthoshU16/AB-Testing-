import { Component, HostListener, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UserProfile } from '../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Input() activePage: string = '';

  navScrolled = false;
  mobileMenuOpen = false;
  mobileDropdowns: { [key: string]: boolean } = {};

  // Auth state
  isLoggedIn = false;
  userProfile: UserProfile | null = null;
  userMenuOpen = false;

  private subs: Subscription[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.subs.push(
      this.authService.currentUser$.subscribe(user => {
        this.isLoggedIn = !!user;
      }),
      this.authService.userProfile$.subscribe(profile => {
        this.userProfile = profile;
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.navScrolled = window.scrollY > 20;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-wrapper')) {
      this.userMenuOpen = false;
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    document.body.style.overflow = this.mobileMenuOpen ? 'hidden' : '';
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
    this.mobileDropdowns = {};
    document.body.style.overflow = '';
  }

  toggleMobileDropdown(key: string): void {
    this.mobileDropdowns[key] = !this.mobileDropdowns[key];
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  getUserInitials(): string {
    if (!this.userProfile) return '?';
    const first = this.userProfile.firstName?.charAt(0) || '';
    const last = this.userProfile.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  }

  getUserDisplayName(): string {
    if (!this.userProfile) return 'User';
    return `${this.userProfile.firstName || ''} ${this.userProfile.lastName || ''}`.trim() || 'User';
  }

  async signOut(): Promise<void> {
    this.userMenuOpen = false;
    this.closeMobileMenu();
    await this.authService.signOut();
  }
}
