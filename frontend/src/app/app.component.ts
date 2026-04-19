import { Component, HostListener, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './shared/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule,FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Armor Bridz';
  showUp = false;
  showDown = true;
  isHome = false;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Only show floating buttons on the home route (landing page)
        this.isHome = event.urlAfterRedirects === '/' || event.urlAfterRedirects.split('?')[0] === '/';
      }
    });
  }

  ngOnInit() {
    this.onWindowScroll();
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (!this.isHome) return;

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
