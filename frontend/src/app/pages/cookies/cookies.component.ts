import { Component, HostListener, OnInit, AfterViewInit, ElementRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-cookies',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './cookies.component.html',
  styleUrls: ['./cookies.component.css']
})
export class CookiesComponent implements OnInit, AfterViewInit {

  activeSection = 't1';
  private revealObserver: IntersectionObserver | null = null;

  constructor(
    private el: ElementRef, 
    private ngZone: NgZone,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.fragment.subscribe(frag => {
      if (frag) {
        this.scrollToElement(frag);
      }
    });
  }

  navigateToFragment(event: Event, fragment: string): void {
    event.preventDefault();
    this.router.navigate([], { 
      relativeTo: this.route, 
      fragment: fragment,
      replaceUrl: true
    });
    this.scrollToElement(fragment);
  }

  private scrollToElement(id: string): void {
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const headerOffset = 140;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 50);
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => this.initRevealObserver(), 300);
    });
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    const sections = ['t1', 't2', 't3', 't4', 't5', 't6'];
    const threshold = window.innerHeight * 0.4;
    
    let currentActive = sections[0];
    for (const id of sections) {
      const element = document.getElementById(id);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= threshold) {
          currentActive = id;
        }
      }
    }
    
    this.activeSection = currentActive;
  }

  private initRevealObserver(): void {
    const hostEl = this.el.nativeElement as HTMLElement;
    const elements = hostEl.querySelectorAll('.reveal');
    if (elements.length === 0) return;

    this.revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.ngZone.run(() => {
              entry.target.classList.add('in-view');
            });
            this.revealObserver?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    elements.forEach(el => this.revealObserver?.observe(el));
  }
}
