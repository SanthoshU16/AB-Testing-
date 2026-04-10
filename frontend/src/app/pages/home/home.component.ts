import { Component, OnInit, HostListener, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  title = 'Armor Bridz';
  navScrolled = false;
  showBackToTop = false;
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

  chartData = [
    { label: 'Oct', height: '85%', color: 'rgba(37, 99, 235, 0.15)' },
    { label: 'Nov', height: '70%', color: 'rgba(37, 99, 235, 0.20)' },
    { label: 'Dec', height: '55%', color: 'rgba(37, 99, 235, 0.30)' },
    { label: 'Jan', height: '40%', color: 'rgba(37, 99, 235, 0.45)' },
    { label: 'Feb', height: '25%', color: 'rgba(37, 99, 235, 0.65)' },
    { label: 'Mar', height: '15%', color: '#2563EB' }
  ];

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.observeAnimations();
    this.setupLiquidButtons();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.navScrolled = window.scrollY > 20;
    this.showBackToTop = window.scrollY > 300;
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
        button.style.setProperty('--shade-x', `${((1 - percentX) * 100).toFixed(1)}%`);
        button.style.setProperty('--shade-y', `${((1 - percentY) * 100).toFixed(1)}%`);
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
        button.style.removeProperty('--shade-x');
        button.style.removeProperty('--shade-y');
      };

      button.addEventListener('pointerenter', (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') return; // Prevent sticky hover on touch
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
