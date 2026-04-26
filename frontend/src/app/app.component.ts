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

  // Pages that should show the footer and floating scroll buttons
  private publicPages = ['/', '/about', '/blog', '/career', '/contact', '/pricing', '/terms', '/privacy'];
  showFooter = false;
  showFloatingActions = false;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const path = event.urlAfterRedirects.split('?')[0].split('#')[0] || '/';
        this.isPublic = this.publicPages.includes(path) || path === '';
        
        // Show footer and floating actions only on public landing pages (excluding legal and auth pages)
        const isLegalPage = path === '/terms' || path === '/privacy';
        const isAuthPage = path === '/sign-in' || path === '/sign-up';
        this.showFooter = this.isPublic && !isLegalPage && !isAuthPage;
        this.showFloatingActions = this.isPublic && !isLegalPage && !isAuthPage;
      }
    });
  }

  ngOnInit() {
    this.onWindowScroll();
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
