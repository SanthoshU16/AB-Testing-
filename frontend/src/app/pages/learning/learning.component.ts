import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-learning',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './learning.component.html',
  styleUrls: ['./learning.component.css']
})
export class LearningComponent implements OnInit, AfterViewInit, OnDestroy {

  isLoggedIn = false;
  private authSub?: Subscription;
  private revealObserver: IntersectionObserver | null = null;

  activeCategory = 'all';

  categories = [
    { id: 'all', label: 'All Courses', icon: 'bi-grid' },
    { id: 'fundamentals', label: 'Fundamentals', icon: 'bi-book' },
    { id: 'phishing', label: 'Phishing Defense', icon: 'bi-shield-exclamation' },
    { id: 'social-engineering', label: 'Social Engineering', icon: 'bi-people' },
    { id: 'incident-response', label: 'Incident Response', icon: 'bi-lightning' },
    { id: 'compliance', label: 'Compliance', icon: 'bi-check2-circle' }
  ];

  courses = [
    {
      id: 1,
      title: 'Cybersecurity Essentials',
      description: 'Build a strong foundation in cybersecurity concepts, threat landscapes, and defense strategies for modern organizations.',
      category: 'fundamentals',
      level: 'Beginner',
      duration: '4 hours',
      modules: 12,
      enrolled: 8420,
      rating: 4.9,
      badge: 'Foundation',
      gradient: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
      icon: 'bi-shield-lock'
    },
    {
      id: 2,
      title: 'Phishing Attack Recognition',
      description: 'Learn to identify sophisticated phishing attempts across email, SMS, and social media platforms before they cause damage.',
      category: 'phishing',
      level: 'Beginner',
      duration: '3 hours',
      modules: 8,
      enrolled: 12350,
      rating: 4.8,
      badge: 'Essential',
      gradient: 'linear-gradient(135deg, #DC2626 0%, #F97316 100%)',
      icon: 'bi-envelope-exclamation'
    },
    {
      id: 3,
      title: 'Advanced Spear Phishing Defense',
      description: 'Master the art of detecting targeted phishing attacks that bypass traditional filters, including BEC and whaling techniques.',
      category: 'phishing',
      level: 'Advanced',
      duration: '6 hours',
      modules: 15,
      enrolled: 5640,
      rating: 4.9,
      badge: 'Expert',
      gradient: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)',
      icon: 'bi-bullseye'
    },
    {
      id: 4,
      title: 'Social Engineering Tactics & Prevention',
      description: 'Understand the psychology behind social engineering attacks and learn how to build human firewalls in your organization.',
      category: 'social-engineering',
      level: 'Intermediate',
      duration: '5 hours',
      modules: 10,
      enrolled: 7830,
      rating: 4.7,
      badge: 'Professional',
      gradient: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
      icon: 'bi-person-lock'
    },
    {
      id: 5,
      title: 'Incident Response Playbook',
      description: 'Step-by-step guide to responding to security incidents, from initial detection through containment and post-mortem analysis.',
      category: 'incident-response',
      level: 'Intermediate',
      duration: '7 hours',
      modules: 14,
      enrolled: 4220,
      rating: 4.8,
      badge: 'Professional',
      gradient: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)',
      icon: 'bi-exclamation-triangle'
    },
    {
      id: 6,
      title: 'GDPR & Data Privacy Compliance',
      description: 'Navigate the complex landscape of data privacy regulations and ensure your organization meets compliance requirements.',
      category: 'compliance',
      level: 'Intermediate',
      duration: '4 hours',
      modules: 9,
      enrolled: 6120,
      rating: 4.6,
      badge: 'Compliance',
      gradient: 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)',
      icon: 'bi-file-earmark-lock'
    },
    {
      id: 7,
      title: 'Email Security Architecture',
      description: 'Design and implement robust email security systems including SPF, DKIM, DMARC, and advanced threat protection.',
      category: 'fundamentals',
      level: 'Advanced',
      duration: '5 hours',
      modules: 11,
      enrolled: 3450,
      rating: 4.9,
      badge: 'Expert',
      gradient: 'linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)',
      icon: 'bi-envelope-check'
    },
    {
      id: 8,
      title: 'Security Awareness Program Design',
      description: 'Learn to design, implement, and measure effective security awareness training programs that create lasting behavioral change.',
      category: 'social-engineering',
      level: 'Advanced',
      duration: '8 hours',
      modules: 16,
      enrolled: 2890,
      rating: 4.8,
      badge: 'Expert',
      gradient: 'linear-gradient(135deg, #9333EA 0%, #C084FC 100%)',
      icon: 'bi-mortarboard'
    },
    {
      id: 9,
      title: 'Ransomware Prevention & Recovery',
      description: 'Comprehensive strategies to prevent ransomware attacks, minimize damage, and recover critical systems and data.',
      category: 'incident-response',
      level: 'Intermediate',
      duration: '5 hours',
      modules: 12,
      enrolled: 9150,
      rating: 4.7,
      badge: 'Professional',
      gradient: 'linear-gradient(135deg, #EA580C 0%, #F59E0B 100%)',
      icon: 'bi-lock'
    }
  ];

  filteredCourses = [...this.courses];
  showFullCatalog = false;

  get displayedCourses() {
    return this.showFullCatalog ? this.filteredCourses : this.filteredCourses.slice(0, 3);
  }

  constructor(
    private el: ElementRef,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authSub = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => this.initRevealObserver(), 300);
    });
  }

  ngOnDestroy(): void {
    this.revealObserver?.disconnect();
    this.authSub?.unsubscribe();
  }

  exploreCourses(): void {
    this.showFullCatalog = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.scrollToCatalog();
      this.reobserveRevealElements();
    }, 50);
  }

  filterCourses(categoryId: string): void {
    this.activeCategory = categoryId;
    if (categoryId === 'all') {
      this.filteredCourses = [...this.courses];
    } else {
      this.filteredCourses = this.courses.filter(c => c.category === categoryId);
    }
    this.cdr.detectChanges();
    // Re-observe new elements after Angular renders them
    setTimeout(() => this.reobserveRevealElements(), 50);
  }

  formatEnrolled(num: number): string {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  }

  scrollToCatalog(): void {
    const catalogEl = document.getElementById('course-catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      { threshold: 0.05, rootMargin: '0px 0px -10px 0px' }
    );

    elements.forEach(el => this.revealObserver?.observe(el));

    // Safety fallback: make everything visible after 2s
    setTimeout(() => {
      hostEl.querySelectorAll('.reveal:not(.in-view)').forEach(el => {
        el.classList.add('in-view');
      });
    }, 2000);
  }

  private reobserveRevealElements(): void {
    const hostEl = this.el.nativeElement as HTMLElement;
    const newElements = hostEl.querySelectorAll('.reveal:not(.in-view)');

    if (!this.revealObserver || newElements.length === 0) {
      // If observer isn't ready, just show them immediately
      newElements.forEach(el => el.classList.add('in-view'));
      return;
    }

    newElements.forEach(el => this.revealObserver?.observe(el));
  }
}
