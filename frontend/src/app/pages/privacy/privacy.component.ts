import { Component, HostListener, OnInit, AfterViewInit, ElementRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.css']
})
export class PrivacyComponent implements OnInit, AfterViewInit {

  activeSection = 't1';
  private revealObserver: IntersectionObserver | null = null;

  constructor(private el: ElementRef, private ngZone: NgZone) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => this.initRevealObserver(), 300);
    });
  }

  @HostListener('window:scroll', [])
  onScroll() {
    const sections = ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9'];

    for (let id of sections) {
      const el = document.getElementById(id);
      if (el) {
        const top = el.getBoundingClientRect().top;

        if (top <= 140 && top >= -200) {
          this.activeSection = id;
        }
      }
    }
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