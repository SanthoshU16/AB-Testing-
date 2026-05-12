import { Component, HostListener, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './shared/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Armor Bridz';
  showUp = false;
  showDown = true;
  isPublic = false;

  // Pages that should show the footer
  private publicPages = ['/', '/about', '/blog', '/career', '/contact', '/pricing', '/terms', '/privacy', '/cookies', '/tutorial', '/demo', '/learning'];
  showFooter = false;
  showFloatingActions = false;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const path = event.urlAfterRedirects.split('?')[0].split('#')[0] || '/';
        const isPublicPath = this.publicPages.includes(path) || 
                            path === '' || 
                            path.startsWith('/phish/') || 
                            path.startsWith('/track/');
        
        const isHubPath = path === '/learning-hub' || path.startsWith('/learning-hub/course/');
        
        // Show footer only on public landing pages (excluding legal, auth, and hub)
        const isLegalPage = path === '/terms' || path === '/privacy';
        const isAuthPage = path === '/sign-in' || path === '/sign-up';
        
        this.showFooter = isPublicPath && !isLegalPage && !isAuthPage;
        
        // Show floating actions on all content pages + hub, but not auth
        this.showFloatingActions = (isPublicPath || isHubPath) && !isAuthPage;
        
        this.isPublic = isPublicPath || isHubPath; // Update isPublic state for scroll listener
      }
    });
  }

  ngOnInit() {
    this.initTheme();
    this.onWindowScroll();
  }

  private initTheme(): void {
    const savedTheme = localStorage.getItem('ab-theme') || 'light';
    const savedAccent = localStorage.getItem('ab-accent') || '#2563EB';

    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark');

    if (savedTheme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
    } else {
      root.classList.add(`theme-${savedTheme}`);
    }

    root.style.setProperty('--accent-color', savedAccent);
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (!this.isPublic) return;

    const scrollPos = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;

    // Show Up if we scrolled down a bit
    this.showUp = scrollPos > 100;

    // Show Down if we aren't at the very bottom
    this.showDown = scrollPos < (maxScroll - 100);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  scrollToBottom(): void {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }
}
