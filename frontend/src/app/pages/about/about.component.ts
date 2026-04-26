import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, NgZone, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { Hero3dDirective } from '../../shared/directives/hero-3d.directive';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, Hero3dDirective],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit, AfterViewInit, OnDestroy {

  isLoggedIn = false;
  private authSub?: Subscription;

  values = [
    { icon: 'bi-shield-check', title: 'Security First', desc: 'Every decision we make starts with the question: does this make our customers safer?' },
    { icon: 'bi-people', title: 'People Focused', desc: 'We build for humans, not machines. Intuitive, accessible, and empowering.' },
    { icon: 'bi-lightning', title: 'Move Fast', desc: 'The threat landscape evolves daily. So do we — shipping improvements weekly.' },
    { icon: 'bi-graph-up-arrow', title: 'Data Driven', desc: 'We measure everything so you can prove your security ROI with confidence.' }
  ];

  stats = [
    { target: 500, prefix: '', suffix: '+', decimal: 0, label: 'Organizations Protected', displayValue: '0' },
    { target: 10, prefix: '', suffix: 'M+', decimal: 0, label: 'Simulations Delivered', displayValue: '0' },
    { target: 99.9, prefix: '', suffix: '%', decimal: 1, label: 'Uptime SLA', displayValue: '0.0' },
    { target: 45, prefix: '', suffix: '%', decimal: 0, label: 'Avg. Risk Reduction', displayValue: '0' }
  ];

  team = [
    { name: 'Alex Chen', role: 'CEO & Co-Founder', bio: 'Former CISO at Fortune 500. 15+ years in cybersecurity.' },
    { name: 'Sarah Mitchell', role: 'CTO & Co-Founder', bio: 'Ex-Google engineer. Built security systems at scale.' },
    { name: 'James Park', role: 'VP of Product', bio: 'Product leader from Palo Alto Networks and CrowdStrike.' },
    { name: 'Lisa Wang', role: 'Head of Research', bio: 'PhD in AI Security. Published 30+ research papers.' }
  ];

  @ViewChild('statsPill') statsPill!: ElementRef;
  private hasAnimated = false;
  private isReady = false;
  private revealObserver: IntersectionObserver | null = null;
  private statsObserver: IntersectionObserver | null = null;

  constructor(
    private el: ElementRef,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Initialize stats to 0
    this.stats.forEach(s => s.displayValue = s.decimal > 0 ? '0.0' : '0');
    // Subscribe to auth state
    this.authSub = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
  }

  ngAfterViewInit(): void {
    // Delay observer setup slightly to allow *ngFor to finish rendering
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.initRevealObserver();
        this.initStatsObserver();
        this.isReady = true;
      }, 500);
    });
  }

  ngOnDestroy(): void {
    this.revealObserver?.disconnect();
    this.statsObserver?.disconnect();
    this.authSub?.unsubscribe();
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
      { threshold: 0.1, rootMargin: '0px 0px -20px 0px' }
    );

    elements.forEach(el => this.revealObserver?.observe(el));
  }

  private initStatsObserver(): void {
    if (!this.statsPill) return;

    this.statsObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !this.hasAnimated) {
          this.hasAnimated = true;
          this.ngZone.run(() => {
            this.animateAllStats();
            this.cdr.markForCheck();
          });
          this.statsObserver?.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );

    this.statsObserver.observe(this.statsPill.nativeElement);
  }

  animateAllStats(): void {
    this.stats.forEach((stat, index) => {
      setTimeout(() => {
        this.startCounting(stat);
      }, (index * 150));
    });
  }

  private startCounting(stat: any): void {
    const duration = 2000;
    const frames = 60;
    const interval = duration / frames;
    let currentFrame = 0;

    const easeOutExpo = (t: number) => {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };

    const timer = setInterval(() => {
      currentFrame++;
      const progress = currentFrame / frames;
      const easedProgress = easeOutExpo(progress);
      const value = easedProgress * stat.target;

      this.ngZone.run(() => {
        if (stat.decimal > 0) {
          stat.displayValue = `${stat.prefix}${value.toFixed(stat.decimal)}${stat.suffix}`;
        } else {
          stat.displayValue = `${stat.prefix}${Math.floor(value).toLocaleString()}${stat.suffix}`;
        }
        this.cdr.detectChanges();
      });

      if (currentFrame === frames) {
        clearInterval(timer);
      }
    }, interval);
  }
}