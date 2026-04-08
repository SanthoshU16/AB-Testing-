import { Component, OnInit, HostListener, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'Armor Bridz';
  navScrolled = false;
  mobileMenuOpen = false;

  stats = [
    { prefix: '', target: 91, suffix: '%', current: '0', isFloat: false, label: 'of breaches start with phishing' },
    { prefix: '$', target: 4.9, suffix: 'M', current: '0.0', isFloat: true, label: 'average cost per breach' },
    { prefix: '', target: 197, suffix: '', current: '0', isFloat: false, label: 'days to detect a breach' },
    { prefix: '', target: 3, suffix: '×', current: '0', isFloat: false, label: 'faster response with training' }
  ];
  statsAnimated = false;

  features = [
    {
      icon: 'bi-send-check',
      title: 'Smart Campaigns',
      description: 'Create and schedule targeted phishing simulations with precision. Select departments, set timing, and watch results flow in.',
      color: '#2563EB'
    },
    {
      icon: 'bi-envelope-paper',
      title: 'Realistic Templates',
      description: 'Choose from 100+ industry-tested phishing templates or build custom scenarios that mirror real-world threats.',
      color: '#1E40AF'
    },
    {
      icon: 'bi-graph-up-arrow',
      title: 'Live Analytics',
      description: 'Real-time dashboards showing opens, clicks, and credential attempts. Identify trends before they become problems.',
      color: '#0A2540'
    },
    {
      icon: 'bi-person-badge',
      title: 'Risk Scoring',
      description: 'AI-powered risk classification categorizes employees into risk tiers, enabling focused remediation.',
      color: '#EAB308'
    },
    {
      icon: 'bi-file-earmark-bar-graph',
      title: 'Compliance Reports',
      description: 'One-click audit reports for ISO 27001, SOC 2, and internal security reviews. Always be audit-ready.',
      color: '#DC2626'
    },
    {
      icon: 'bi-shield-lock',
      title: 'Zero Data Risk',
      description: 'No real credentials stored. Fully encrypted, GDPR-aligned infrastructure with enterprise-grade security.',
      color: '#16A34A'
    }
  ];

  steps = [
    { num: '01', icon: 'bi-plus-circle', title: 'Create', desc: 'Design campaigns using customizable, battle-tested templates.' },
    { num: '02', icon: 'bi-people', title: 'Target', desc: 'Select users or departments and schedule delivery.' },
    { num: '03', icon: 'bi-eye', title: 'Monitor', desc: 'Track opens, clicks, and attempts in real time.' },
    { num: '04', icon: 'bi-bar-chart', title: 'Improve', desc: 'Analyze results and strengthen your security posture.' }
  ];

  compliancePoints = [
    'No real passwords are ever stored or logged',
    'End-to-end encryption for all data in transit and at rest',
    'Supports ISO 27001 security awareness requirements',
    'Fully GDPR-aligned data handling and privacy controls',
    'Safe simulation environment — zero employee risk'
  ];

  certifications = [
    { icon: 'bi-award', name: 'ISO 27001', desc: 'Information security management' },
    { icon: 'bi-shield-check', name: 'SOC 2 Type II', desc: 'Security & availability controls' },
    { icon: 'bi-lock', name: 'GDPR Compliant', desc: 'European data protection aligned' },
    { icon: 'bi-building-check', name: 'Enterprise Ready', desc: 'SSO, SCIM, and audit logging' }
  ];

  chartData = [
    { label: 'Oct', height: '85%', color: 'rgba(37, 99, 235, 0.15)' },
    { label: 'Nov', height: '70%', color: 'rgba(37, 99, 235, 0.20)' },
    { label: 'Dec', height: '55%', color: 'rgba(37, 99, 235, 0.30)' },
    { label: 'Jan', height: '40%', color: 'rgba(37, 99, 235, 0.45)' },
    { label: 'Feb', height: '25%', color: 'rgba(37, 99, 235, 0.65)' },
    { label: 'Mar', height: '15%', color: '#2563EB' }
  ];

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.observeAnimations();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.navScrolled = window.scrollY > 20;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    document.body.style.overflow = this.mobileMenuOpen ? 'hidden' : '';
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  animationGeneration = 0;

  observeAnimations(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            if (entry.target.classList.contains('stats-grid')) {
              this.animateStats();
            }
          } else {
            entry.target.classList.remove('in-view');
            if (entry.target.classList.contains('stats-grid')) {
              this.statsAnimated = false;
              this.animationGeneration++; // abort ongoing animation
              this.stats.forEach(s => s.current = s.isFloat ? '0.0' : '0');
            }
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal, .reveal-scale').forEach(el => observer.observe(el));
  }

  animateStats(): void {
    if (this.statsAnimated) return;
    this.statsAnimated = true;
    this.animationGeneration++;
    const currentGen = this.animationGeneration;

    this.stats.forEach(stat => {
      const duration = 2000;
      const startTime = performance.now();

      const update = (currentTime: number) => {
        if (currentGen !== this.animationGeneration) return;

        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        
        const currentVal = stat.target * ease;
        stat.current = stat.isFloat ? currentVal.toFixed(1) : Math.floor(currentVal).toString();

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          stat.current = stat.target.toString();
        }
      };
      
      requestAnimationFrame(update);
    });
  }

  scrollTo(id: string): void {
    this.closeMobileMenu();
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }
}
