import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';

interface PricingPlan {
  name: string;
  badge?: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  cta: string;
  features: string[];
  highlighted: boolean;
  color: string;
}

interface FaqItem {
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-upgrade-plan',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './upgrade-plan.component.html',
  styleUrls: ['./upgrade-plan.component.css']
})
export class UpgradePlanComponent implements OnInit, AfterViewInit, OnDestroy {
  isAnnual = true;
  currentPlan = 'Starter';
  private observer?: IntersectionObserver;

  plans: PricingPlan[] = [
    {
      name: 'Starter',
      monthlyPrice: 0,
      annualPrice: 0,
      description: 'Perfect for small teams getting started with security awareness training.',
      cta: 'Current Plan',
      highlighted: false,
      color: '#2563EB',
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
      cta: 'Upgrade to Pro',
      highlighted: true,
      color: 'var(--accent-color, #2563EB)',
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
      highlighted: false,
      color: '#0A2540',
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

  constructor(
    private authService: AuthService,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    this.currentPlan = 'Starter';
  }

  ngAfterViewInit(): void {
    // Use setTimeout to ensure DOM is rendered, then trigger reveal animations
    setTimeout(() => {
      this.setupRevealAnimations();
    }, 100);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  toggleBilling(): void {
    this.isAnnual = !this.isAnnual;
  }

  toggleFaq(index: number): void {
    this.faqs[index].open = !this.faqs[index].open;
  }

  getSavings(plan: PricingPlan): number {
    if (plan.monthlyPrice === 0) return 0;
    return Math.round((1 - plan.annualPrice / plan.monthlyPrice) * 100);
  }

  isCurrentPlan(planName: string): boolean {
    return this.currentPlan === planName;
  }

  getCtaText(plan: PricingPlan): string {
    if (this.isCurrentPlan(plan.name)) return 'Current Plan';
    return plan.cta;
  }

  private setupRevealAnimations(): void {
    const revealElements = this.el.nativeElement.querySelectorAll('.reveal');

    // Use IntersectionObserver with the correct scrollable root
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.05, rootMargin: '50px 0px 0px 0px' }
    );

    revealElements.forEach((el: Element) => {
      this.observer!.observe(el);
    });

    // Immediately reveal elements that are already visible in the viewport
    setTimeout(() => {
      revealElements.forEach((el: Element) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('in-view');
        }
      });
    }, 200);
  }
}
