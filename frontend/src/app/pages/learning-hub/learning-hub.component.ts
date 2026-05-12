import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

import { AuthService } from '../../services/auth.service';
import { UserProfile } from '../../models/user.model';

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  modules: number;
  enrolled: number;
  rating: number;
  badge: string;
  gradient: string;
  icon: string;
  image: string;
  curriculum: string[];
  progress?: number;
}

@Component({
  selector: 'app-learning-hub',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './learning-hub.component.html',
  styleUrls: ['./learning-hub.component.css']
})
export class LearningHubComponent implements OnInit, AfterViewInit, OnDestroy {

  userName = '';
  activeTab: 'all' | 'beginner' | 'intermediate' | 'advanced' = 'all';
  searchQuery = '';
  expandedCourseId: number | null = null;
  private authSub?: Subscription;
  private profileSub?: Subscription;
  private revealObserver: IntersectionObserver | null = null;
  private btnCleanups: (() => void)[] = [];

  courses: Course[] = [
    // ── BEGINNER ──
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
      icon: 'bi-shield-lock',
      image: 'assets/images/courses/beginner.png',
      curriculum: [
        'Introduction to the Cybersecurity Landscape',
        'Understanding Threat Actors & Attack Vectors',
        'Network Security Fundamentals & Firewalls',
        'Operating System Hardening Basics',
        'Security Policies & Governance Overview',
        'Final Assessment & Certification'
      ],
      progress: 0
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
      icon: 'bi-envelope-exclamation',
      image: 'assets/images/courses/beginner.png',
      curriculum: [
        'Anatomy of a Phishing Email',
        'URL Analysis & Link Inspection Techniques',
        'SMS Phishing (Smishing) Detection',
        'Social Media Impersonation Tactics',
        'Hands-On: Spot the Phish Simulator'
      ],
      progress: 0
    },
    {
      id: 3,
      title: 'Password Security & Authentication',
      description: 'Master the fundamentals of password hygiene, multi-factor authentication, and credential management best practices.',
      category: 'fundamentals',
      level: 'Beginner',
      duration: '2 hours',
      modules: 6,
      enrolled: 15200,
      rating: 4.7,
      badge: 'Foundation',
      gradient: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
      icon: 'bi-key',
      image: 'assets/images/courses/beginner.png',
      curriculum: [
        'Password Entropy & Strength Analysis',
        'Multi-Factor Authentication Deep Dive',
        'Password Manager Setup & Best Practices',
        'Credential Stuffing & Brute Force Defense',
        'SSO & OAuth Security Principles'
      ],
      progress: 0
    },
    // ── INTERMEDIATE ──
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
      icon: 'bi-person-lock',
      image: 'assets/images/courses/intermediate.png',
      curriculum: [
        'Psychology of Manipulation & Persuasion',
        'Pretexting, Baiting & Tailgating Scenarios',
        'Vishing: Voice-Based Attack Techniques',
        'Building a Human Firewall Culture',
        'Red Team Social Engineering Exercises',
        'Measuring & Reporting Awareness Metrics'
      ],
      progress: 0
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
      icon: 'bi-exclamation-triangle',
      image: 'assets/images/courses/intermediate.png',
      curriculum: [
        'Incident Classification & Severity Levels',
        'Detection & Initial Triage Procedures',
        'Containment Strategies for Active Threats',
        'Digital Forensics & Evidence Handling',
        'Post-Incident Review & Lessons Learned',
        'Building an IR Playbook for Your Org'
      ],
      progress: 0
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
      icon: 'bi-file-earmark-lock',
      image: 'assets/images/courses/intermediate.png',
      curriculum: [
        'GDPR Core Principles & Legal Bases',
        'Data Subject Rights & Consent Management',
        'Data Protection Impact Assessments',
        'Cross-Border Data Transfer Rules',
        'Breach Notification Requirements'
      ],
      progress: 0
    },
    {
      id: 7,
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
      icon: 'bi-lock',
      image: 'assets/images/courses/intermediate.png',
      curriculum: [
        'Ransomware Attack Lifecycle Analysis',
        'Endpoint Detection & Response (EDR)',
        'Backup Strategies & Disaster Recovery',
        'Negotiation vs. No-Pay Decision Framework',
        'Ransomware Simulation Lab Exercise',
        'Recovery Automation & Playbook Design'
      ],
      progress: 0
    },
    // ── ADVANCED ──
    {
      id: 8,
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
      icon: 'bi-bullseye',
      image: 'assets/images/courses/advanced.png',
      curriculum: [
        'BEC & CEO Fraud Attack Patterns',
        'Header Analysis & Email Forensics',
        'AI-Powered Phishing Detection Systems',
        'Whaling: Targeting C-Suite Executives',
        'Building Advanced Mail Gateway Rules',
        'Live Threat Hunting Lab'
      ],
      progress: 0
    },
    {
      id: 9,
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
      icon: 'bi-envelope-check',
      image: 'assets/images/courses/advanced.png',
      curriculum: [
        'SPF, DKIM & DMARC Configuration',
        'Advanced Threat Protection (ATP) Setup',
        'Email Gateway Architecture Design',
        'Sandboxing & URL Rewriting Strategies',
        'Zero-Trust Email Security Model'
      ],
      progress: 0
    },
    {
      id: 10,
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
      icon: 'bi-mortarboard',
      image: 'assets/images/courses/advanced.png',
      curriculum: [
        'Program Strategy & Stakeholder Buy-In',
        'Content Design for Maximum Engagement',
        'Gamification & Behavioral Nudges',
        'Phishing Simulation Campaign Management',
        'KPI Dashboards & ROI Measurement',
        'Continuous Improvement Frameworks'
      ],
      progress: 0
    },
    {
      id: 11,
      title: 'Threat Intelligence & Hunting',
      description: 'Learn to proactively identify, analyze, and respond to emerging cyber threats using advanced intelligence frameworks.',
      category: 'incident-response',
      level: 'Advanced',
      duration: '9 hours',
      modules: 18,
      enrolled: 2100,
      rating: 4.9,
      badge: 'Expert',
      gradient: 'linear-gradient(135deg, #0F172A 0%, #334155 100%)',
      icon: 'bi-binoculars',
      image: 'assets/images/courses/advanced.png',
      curriculum: [
        'Threat Intelligence Lifecycle & MITRE ATT&CK',
        'OSINT Techniques for Cyber Threat Analysis',
        'Indicator of Compromise (IoC) Analysis',
        'Proactive Threat Hunting Methodologies',
        'SIEM Correlation Rules & Alert Tuning',
        'Building a Threat Intel Program from Scratch'
      ],
      progress: 0
    }
  ];

  get beginnerCourses(): Course[] {
    return this.courses.filter(c => c.level === 'Beginner');
  }

  get intermediateCourses(): Course[] {
    return this.courses.filter(c => c.level === 'Intermediate');
  }

  get advancedCourses(): Course[] {
    return this.courses.filter(c => c.level === 'Advanced');
  }

  get filteredCourses(): Course[] {
    let list = this.courses;
    if (this.activeTab !== 'all') {
      const level = this.activeTab.charAt(0).toUpperCase() + this.activeTab.slice(1);
      list = list.filter(c => c.level === level);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }
    return list;
  }

  get totalModules(): number {
    return this.courses.reduce((sum, c) => sum + c.modules, 0);
  }

  get totalHours(): number {
    return this.courses.reduce((sum, c) => sum + parseInt(c.duration, 10), 0);
  }

  constructor(
    private el: ElementRef,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authSub = this.authService.currentUser$.subscribe(user => {
      // fallback
    });
    this.profileSub = this.authService.userProfile$.subscribe(profile => {
      if (profile) {
        const full = (profile.firstName || '') + (profile.lastName ? ' ' + profile.lastName : '');
        this.userName = full.trim() || 'Learner';
      }
    });
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => this.initRevealObserver(), 300);
      setTimeout(() => this.initLiquidButtons(), 400);
    });
  }

  ngOnDestroy(): void {
    this.revealObserver?.disconnect();
    this.authSub?.unsubscribe();
    this.profileSub?.unsubscribe();
    this.btnCleanups.forEach(fn => fn());
  }

  setTab(tab: 'all' | 'beginner' | 'intermediate' | 'advanced'): void {
    this.activeTab = tab;
    this.cdr.detectChanges();
    setTimeout(() => this.reobserveRevealElements(), 50);
  }

  onSearch(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.cdr.detectChanges();
    setTimeout(() => this.reobserveRevealElements(), 50);
  }

  formatEnrolled(num: number): string {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  }

  toggleCurriculum(courseId: number): void {
    this.expandedCourseId = this.expandedCourseId === courseId ? null : courseId;
  }

  isCourseLocked(id: number): boolean {
    if (id === 1) return false;
    const prevId = id - 1;
    const saved = localStorage.getItem(`ab_course_${prevId}_progress`);
    if (saved) {
      const data = JSON.parse(saved);
      return !data.quizSubmitted || data.quizScore < 70;
    }
    return true;
  }

  getCourseProgress(id: number): number {
    const saved = localStorage.getItem(`ab_course_${id}_progress`);
    if (saved) {
      const data = JSON.parse(saved);
      return data.completedLessons?.length || 0;
    }
    return 0;
  }

  isCourseCompleted(id: number): boolean {
    const saved = localStorage.getItem(`ab_course_${id}_progress`);
    if (saved) {
      const data = JSON.parse(saved);
      return data.quizSubmitted && data.quizScore >= 70;
    }
    return false;
  }

  getCTA(courseId: number): string {
    if (this.isCourseLocked(courseId)) return 'Course Locked';
    if (this.isCourseCompleted(courseId)) return 'Completed';
    return this.getCourseProgress(courseId) > 0 ? 'Resume' : 'Start Course';
  }

  getLevelColor(level: string): string {
    switch (level) {
      case 'Beginner': return '#16A34A';
      case 'Intermediate': return '#D97706';
      case 'Advanced': return '#DC2626';
      default: return '#2563EB';
    }
  }

  getOverlayGradient(gradient: string): string {
    const parts = gradient.split(',');
    const colorPart = parts.length > 1 ? parts[1].trim().split(' ')[0] : '#000';
    return 'linear-gradient(180deg, ' + colorPart + ' 0%, transparent 100%)';
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
      newElements.forEach(el => el.classList.add('in-view'));
      return;
    }

    newElements.forEach(el => this.revealObserver?.observe(el));
  }

  /** Cursor-aware 3D tilt for .card-cta buttons */
  private initLiquidButtons(): void {
    const host = this.el.nativeElement as HTMLElement;
    const buttons = host.querySelectorAll<HTMLElement>('.card-cta');

    buttons.forEach(button => {
      let rect: DOMRect | null = null;
      let rafId = 0;
      let lastX = 0;
      let lastY = 0;

      const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

      const update = () => {
        rafId = 0;
        if (!rect) return;
        const x = clamp(lastX - rect.left, 0, rect.width);
        const y = clamp(lastY - rect.top, 0, rect.height);
        const pX = rect.width ? x / rect.width : 0.5;
        const pY = rect.height ? y / rect.height : 0.5;
        button.style.setProperty('--tilt-x', `${((0.5 - pY) * 10).toFixed(2)}deg`);
        button.style.setProperty('--tilt-y', `${((pX - 0.5) * 12).toFixed(2)}deg`);
      };

      const schedule = () => { if (!rafId) rafId = requestAnimationFrame(update); };
      const reset = () => {
        rect = null;
        button.classList.remove('is-hovered');
        button.style.removeProperty('--tilt-x');
        button.style.removeProperty('--tilt-y');
      };

      const onEnter = () => { rect = button.getBoundingClientRect(); button.classList.add('is-hovered'); };
      const onMove = (e: MouseEvent) => { lastX = e.clientX; lastY = e.clientY; schedule(); };
      const onLeave = () => reset();

      button.addEventListener('mouseenter', onEnter);
      button.addEventListener('mousemove', onMove);
      button.addEventListener('mouseleave', onLeave);

      this.btnCleanups.push(() => {
        button.removeEventListener('mouseenter', onEnter);
        button.removeEventListener('mousemove', onMove);
        button.removeEventListener('mouseleave', onLeave);
      });
    });
  }
}
