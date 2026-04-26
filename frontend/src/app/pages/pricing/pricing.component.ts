import { Component, OnInit, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { Hero3dDirective } from '../../shared/directives/hero-3d.directive';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export interface PricingPlan {
  name: string;
  badge?: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  cta: string;
  ctaRoute: string;
  features: string[];
  highlighted: boolean;
  color: string;
  glowColor: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, Hero3dDirective],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css']
})
export class PricingComponent implements OnInit, AfterViewInit, OnDestroy {
  currentYear = new Date().getFullYear();
  isAnnual = true;
  isLoggedIn = false;
  private authSub?: Subscription;

  constructor(private authService: AuthService) {}

  plans: PricingPlan[] = [
    {
      name: 'Starter',
      monthlyPrice: 0,
      annualPrice: 0,
      description: 'Perfect for small teams getting started with security awareness training.',
      cta: 'Get Started Free',
      ctaRoute: '/sign-up',
      highlighted: false,
      color: '#2563EB',
      glowColor: 'rgba(37, 99, 235, 0.15)',
      features: [
        'Up to 25 employees',
        '5 phishing campaigns/month',
        '10 email templates',
        'Basic click-rate reporting',
        'Email support',
        'Standard landing pages'
      ]
    },
    {
      name: 'Professional',
      badge: 'Most Popular',
      monthlyPrice: 79,
      annualPrice: 59,
      description: 'For growing security teams who need automation, analytics, and depth.',
      cta: 'Start Free Trial',
      ctaRoute: '/sign-up',
      highlighted: true,
      color: '#1f57d6',
      glowColor: 'rgba(37, 99, 235, 0.35)',
      features: [
        'Up to 500 employees',
        'Unlimited campaigns',
        '100+ phishing templates',
        'Real-time analytics dashboard',
        'AI risk scoring per user',
        'Department-level reporting',
        'Automated training assignments',
        'Priority email & chat support',
        'Custom landing pages',
        'CSV bulk import'
      ]
    },
    {
      name: 'Enterprise',
      monthlyPrice: 0,
      annualPrice: 0,
      description: 'Custom solutions for large organizations with advanced compliance needs.',
      cta: 'Contact Sales',
      ctaRoute: '/contact',
      highlighted: false,
      color: '#0A2540',
      glowColor: 'rgba(10, 37, 64, 0.15)',
      features: [
        'Unlimited employees',
        'Unlimited campaigns',
        'Custom template builder',
        'Advanced analytics & BI exports',
        'SSO / SAML integration',
        'ISO 27001 & SOC 2 reports',
        'Dedicated success manager',
        'SLA & uptime guarantee',
        'Custom domain sending',
        'White-label reports',
        'API access',
        'On-premise option'
      ]
    }
  ];

  faqs: FaqItem[] = [
    {
      question: 'Is there a free trial available?',
      answer: 'Yes! The Professional plan comes with a full 14-day free trial — no credit card required. You get access to all features so you can explore everything before committing.',
      open: false
    },
    {
      question: 'Can I change plans at any time?',
      answer: 'Absolutely. You can upgrade, downgrade, or cancel your plan at any time directly from your account settings. Upgrades take effect immediately; downgrades apply at the next billing cycle.',
      open: false
    },
    {
      question: 'How does annual billing work?',
      answer: 'With annual billing you pay upfront for 12 months and receive a 25% discount compared to monthly pricing. Your subscription renews automatically each year unless you cancel.',
      open: false
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit and debit cards (Visa, Mastercard, Amex), bank transfers for Enterprise contracts, and popular payment platforms including Stripe-powered payments.',
      open: false
    },
    {
      question: 'Is my employee data safe?',
      answer: 'Security is our core mission. We never store real credentials, all data is encrypted at rest and in transit, and our infrastructure is GDPR-aligned. Enterprise customers also get dedicated data residency options.',
      open: false
    },
    {
      question: 'Do you offer discounts for nonprofits or startups?',
      answer: 'Yes — we offer special pricing for registered nonprofits, educational institutions, and early-stage startups. Contact our sales team to find out what applies to your organization.',
      open: false
    }
  ];

  featureComparison = [
    { feature: 'Employees', starter: '25', pro: '500', enterprise: 'Unlimited' },
    { feature: 'Campaigns/month', starter: '5', pro: 'Unlimited', enterprise: 'Unlimited' },
    { feature: 'Email templates', starter: '10', pro: '100+', enterprise: 'Custom' },
    { feature: 'Real-time analytics', starter: false, pro: true, enterprise: true },
    { feature: 'AI risk scoring', starter: false, pro: true, enterprise: true },
    { feature: 'Department reports', starter: false, pro: true, enterprise: true },
    { feature: 'Automated training', starter: false, pro: true, enterprise: true },
    { feature: 'SSO / SAML', starter: false, pro: false, enterprise: true },
    { feature: 'Compliance reports', starter: false, pro: false, enterprise: true },
    { feature: 'API access', starter: false, pro: false, enterprise: true },
    { feature: 'Dedicated manager', starter: false, pro: false, enterprise: true },
    { feature: 'White-label', starter: false, pro: false, enterprise: true },
  ];

  ngOnInit(): void {
    this.authSub = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      // Update plan CTA routes based on auth state
      if (this.isLoggedIn) {
        this.plans.forEach(plan => {
          if (plan.ctaRoute === '/sign-up') {
            plan.ctaRoute = '/intro';
            if (plan.cta === 'Start Free Trial') plan.cta = 'Explore more';
            if (plan.cta === 'Get Started Free') plan.cta = 'Explore more';
          }
        });
      } else {
        // Reset to defaults when logged out
        this.plans[0].ctaRoute = '/sign-up';
        this.plans[0].cta = 'Get Started Free';
        this.plans[1].ctaRoute = '/sign-up';
        this.plans[1].cta = 'Start Free Trial';
      }
    });
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.observeAnimations();
    this.setupLiquidButtons();
  }

  toggleBilling(): void {
    this.isAnnual = !this.isAnnual;
  }

  toggleFaq(index: number): void {
    this.faqs[index].open = !this.faqs[index].open;
  }

  getPrice(plan: PricingPlan): string {
    if (plan.monthlyPrice === 0) return plan.name === 'Starter' ? 'Free' : 'Custom';
    const price = this.isAnnual ? plan.annualPrice : plan.monthlyPrice;
    return `$${price}`;
  }

  getSavings(plan: PricingPlan): number {
    return Math.round((1 - plan.annualPrice / plan.monthlyPrice) * 100);
  }

  observeAnimations(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          } else {
            entry.target.classList.remove('in-view');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal, .reveal-scale').forEach(el => observer.observe(el));
  }

  private setupLiquidButtons(): void {
    const buttons = Array.from(document.querySelectorAll<HTMLElement>('.liquid-btn'));
    buttons.forEach(button => {
      if (button.dataset['liquidBound'] === 'true') return;
      button.dataset['liquidBound'] = 'true';

      let rect: DOMRect | null = null;
      let rafId = 0;
      let lastX = 0;
      let lastY = 0;

      const clamp = (value: number, min: number, max: number) =>
        Math.min(Math.max(value, min), max);

      const update = () => {
        rafId = 0;
        if (!rect) return;
        const x = clamp(lastX - rect.left, 0, rect.width);
        const y = clamp(lastY - rect.top, 0, rect.height);
        const percentX = rect.width ? x / rect.width : 0.5;
        const percentY = rect.height ? y / rect.height : 0.5;

        const tiltX = (0.5 - percentY) * 12;
        const tiltY = (percentX - 0.5) * 14;

        button.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
        button.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
        button.style.setProperty('--shine-x', `${(percentX * 100).toFixed(1)}%`);
        button.style.setProperty('--shine-y', `${(percentY * 100).toFixed(1)}%`);
      };

      const scheduleUpdate = () => {
        if (rafId) return;
        rafId = requestAnimationFrame(update);
      };

      const reset = () => {
        rect = null;
        button.classList.remove('is-hovered');
        button.style.removeProperty('--tilt-x');
        button.style.removeProperty('--tilt-y');
        button.style.removeProperty('--shine-x');
        button.style.removeProperty('--shine-y');
      };

      button.addEventListener('pointerenter', (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') return;
        rect = button.getBoundingClientRect();
        button.classList.add('is-hovered');
      });

      button.addEventListener('pointermove', (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') return;
        if (!rect) rect = button.getBoundingClientRect();
        lastX = event.clientX;
        lastY = event.clientY;
        scheduleUpdate();
      });

      button.addEventListener('pointerleave', (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') return;
        reset();
      });
    });
  }
}
