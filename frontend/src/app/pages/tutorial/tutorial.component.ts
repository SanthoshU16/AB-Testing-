import { Component, OnInit, AfterViewInit, OnDestroy, NgZone, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tutorial',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.css']
})
export class TutorialComponent implements OnInit, AfterViewInit, OnDestroy {
  activeStep = 0;
  isLoggedIn = false;
  private observer: IntersectionObserver | null = null;
  private subs: Subscription[] = [];

  steps = [
    {
      icon: 'bi-people-fill',
      color: '#5E5CE6',
      title: 'Add Your Team',
      desc: 'Import employees via CSV or add them manually. Each employee gets a unique tracking profile so you can monitor their vulnerability in real time.'
    },
    {
      icon: 'bi-send-fill',
      color: '#007AFF',
      title: 'Launch a Campaign',
      desc: 'Pick from pre-built phishing templates or craft your own. Schedule delivery, select your targets, and Armor Bridz handles the rest.'
    },
    {
      icon: 'bi-graph-up-arrow',
      color: '#34C759',
      title: 'Track Results',
      desc: 'Watch the analytics dashboard update in real time — who opened, who clicked, and who submitted credentials. Risk scores are calculated automatically.'
    },
    {
      icon: 'bi-mortarboard-fill',
      color: '#FF9F0A',
      title: 'Train & Educate',
      desc: 'Assign cybersecurity courses from the Learning Hub. Employees progress through lessons, pass quizzes, and earn certificates.'
    },
    {
      icon: 'bi-clipboard2-data-fill',
      color: '#FF375F',
      title: 'Generate Reports',
      desc: 'Export detailed PDF/CSV reports for auditors, executives, or your security board. Full compliance-ready documentation at one click.'
    }
  ];

  features = [
    { icon: 'bi-shield-lock-fill', label: 'Phishing Simulations', color: '#5E5CE6' },
    { icon: 'bi-people-fill', label: 'Employee Management', color: '#007AFF' },
    { icon: 'bi-envelope-check-fill', label: 'Email Templates', color: '#34C759' },
    { icon: 'bi-graph-up', label: 'Live Analytics', color: '#FF9F0A' },
    { icon: 'bi-mortarboard-fill', label: 'Learning Hub', color: '#FF375F' },
    { icon: 'bi-clipboard2-data-fill', label: 'Compliance Reports', color: '#30D158' },
    { icon: 'bi-bell-fill', label: 'Smart Notifications', color: '#BF5AF2' },
    { icon: 'bi-person-badge-fill', label: 'Role-Based Access', color: '#FF6961' },
  ];

  constructor(
    private ngZone: NgZone,
    private el: ElementRef,
    private authService: AuthService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.subs.push(
      this.authService.currentUser$.subscribe(user => {
        this.isLoggedIn = !!user;
      })
    );

    // Handle fragment-based scrolling from other pages
    this.subs.push(
      this.route.fragment.subscribe(fragment => {
        if (fragment) {
          // Find target immediately to stop its animation shift
          setTimeout(() => {
            const target = document.getElementById(fragment);
            if (target) {
              target.classList.add('in-view'); // Force it to final position immediately
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 300);
        } else {
          window.scrollTo(0, 0);
        }
      })
    );
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => this.initObserver(), 200);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.subs.forEach(s => s.unsubscribe());
  }

  private initObserver(): void {
    const elements = (this.el.nativeElement as HTMLElement).querySelectorAll('.reveal');
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          this.ngZone.run(() => e.target.classList.add('in-view'));
          this.observer?.unobserve(e.target);
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => this.observer?.observe(el));

    // Safety fallback
    setTimeout(() => {
      (this.el.nativeElement as HTMLElement).querySelectorAll('.reveal:not(.in-view)').forEach(el => {
        el.classList.add('in-view');
      });
    }, 3000);
  }

  setStep(i: number): void { this.activeStep = i; }
}
