import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';
import { COURSE_CONTENT } from '../course-learn/course-content.data';

interface Module {
  title: string;
  duration: string;
  type: 'reading' | 'reading' | 'quiz' | 'lab';
  completed: boolean;
}

interface CourseDetail {
  id: number;
  title: string;
  description: string;
  level: string;
  duration: string;
  modules: Module[];
  enrolled: number;
  rating: number;
  badge: string;
  gradient: string;
  icon: string;
  image: string;
  instructor: string;
  lastUpdated: string;
  whatYouLearn: string[];
  prerequisites: string[];
}

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.css']
})
export class CourseDetailComponent implements OnInit, OnDestroy {
  course: CourseDetail | null = null;
  userName = '';
  activeModuleIndex = 0;
  private profileSub?: Subscription;

  private allCourses: CourseDetail[] = [
    {
      id: 1, title: 'Cybersecurity Essentials',
      description: 'Build a strong foundation in cybersecurity concepts, threat landscapes, and defense strategies for modern organizations. This comprehensive course covers everything from basic terminology to advanced defense frameworks.',
      level: 'Beginner', duration: '4 hours', enrolled: 8420, rating: 4.9,
      badge: 'Foundation', gradient: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
      icon: 'bi-shield-lock', image: 'assets/images/courses/beginner.png',
      instructor: 'Armor Bridz Academy', lastUpdated: 'May 2026',
      whatYouLearn: [
        'Understand the modern cybersecurity threat landscape',
        'Identify common attack vectors and threat actors',
        'Apply network security fundamentals in real scenarios',
        'Implement OS hardening techniques',
        'Design basic security policies for organizations'
      ],
      prerequisites: ['No prior experience required', 'Basic computer literacy'],
      modules: [
        { title: 'Introduction to Cybersecurity', duration: '20 min', type: 'reading', completed: false },
        { title: 'Final Quiz', duration: '15 min', type: 'quiz', completed: false }
      ]
    },
    {
      id: 2, title: 'Phishing Attack Recognition',
      description: 'Learn to identify sophisticated phishing attempts across email, SMS, and social media platforms before they cause damage. Practice with real-world examples and interactive simulations.',
      level: 'Beginner', duration: '3 hours', enrolled: 12350, rating: 4.8,
      badge: 'Essential', gradient: 'linear-gradient(135deg, #DC2626 0%, #F97316 100%)',
      icon: 'bi-envelope-exclamation', image: 'assets/images/courses/beginner.png',
      instructor: 'Armor Bridz Academy', lastUpdated: 'May 2026',
      whatYouLearn: [
        'Dissect phishing emails and identify red flags',
        'Analyze URLs for malicious intent',
        'Detect SMS-based phishing (smishing) attacks',
        'Recognize social media impersonation tactics',
        'Use tools to verify sender authenticity'
      ],
      prerequisites: ['Basic email and internet usage'],
      modules: [
        { title: 'Anatomy of Phishing', duration: '20 min', type: 'reading', completed: false },
        { title: 'Final Quiz', duration: '15 min', type: 'quiz', completed: false }
      ]
    },
    {
      id: 3, title: 'Password Security & Authentication',
      description: 'Master the fundamentals of password hygiene, multi-factor authentication, and credential management best practices to protect your digital identity.',
      level: 'Beginner', duration: '2 hours', enrolled: 15200, rating: 4.7,
      badge: 'Foundation', gradient: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
      icon: 'bi-key', image: 'assets/images/courses/beginner.png',
      instructor: 'Armor Bridz Academy', lastUpdated: 'April 2026',
      whatYouLearn: ['Create strong, memorable passwords', 'Set up multi-factor authentication', 'Use password managers effectively', 'Defend against credential attacks'],
      prerequisites: ['No prior experience required'],
      modules: [
        { title: 'Password Strength Fundamentals', duration: '20 min', type: 'reading', completed: false },
        { title: 'Final Quiz', duration: '15 min', type: 'quiz', completed: false }
      ]
    },
    {
      id: 4, title: 'Social Engineering Tactics & Prevention',
      description: 'Understand the psychology behind social engineering attacks and learn how to build human firewalls in your organization.',
      level: 'Intermediate', duration: '5 hours', enrolled: 7830, rating: 4.7,
      badge: 'Professional', gradient: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
      icon: 'bi-person-lock', image: 'assets/images/courses/intermediate.png',
      instructor: 'Armor Bridz Academy', lastUpdated: 'May 2026',
      whatYouLearn: ['Understand psychological manipulation techniques', 'Identify pretexting and baiting scenarios', 'Build organizational awareness programs', 'Conduct social engineering assessments'],
      prerequisites: ['Cybersecurity Essentials or equivalent knowledge'],
      modules: [
        { title: 'Psychology of Manipulation', duration: '20 min', type: 'reading', completed: false },
        { title: 'Final Quiz', duration: '15 min', type: 'quiz', completed: false }
      ]
    },
    {
      id: 5, title: 'Incident Response Playbook',
      description: 'Step-by-step guide to responding to security incidents, from initial detection through containment and post-mortem analysis.',
      level: 'Intermediate', duration: '7 hours', enrolled: 4220, rating: 4.8,
      badge: 'Professional', gradient: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)',
      icon: 'bi-exclamation-triangle', image: 'assets/images/courses/intermediate.png',
      instructor: 'Armor Bridz Academy', lastUpdated: 'May 2026',
      whatYouLearn: ['Classify incidents by severity', 'Execute containment strategies', 'Perform digital forensics', 'Write post-incident reports'],
      prerequisites: ['Cybersecurity Essentials', 'Basic networking knowledge'],
      modules: [
        { title: 'Incident Classification', duration: '20 min', type: 'reading', completed: false },
        { title: 'Final Quiz', duration: '15 min', type: 'quiz', completed: false }
      ]
    },
    {
      id: 6, title: 'GDPR & Data Privacy Compliance',
      description: 'Navigate the complex landscape of data privacy regulations and ensure your organization meets compliance requirements.',
      level: 'Intermediate', duration: '4 hours', enrolled: 6120, rating: 4.6,
      badge: 'Compliance', gradient: 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)',
      icon: 'bi-file-earmark-lock', image: 'assets/images/courses/intermediate.png',
      instructor: 'Armor Bridz Academy', lastUpdated: 'April 2026',
      whatYouLearn: ['Understand GDPR core principles', 'Manage data subject rights', 'Conduct data protection impact assessments', 'Handle breach notifications'],
      prerequisites: ['Basic understanding of data management'],
      modules: [
        { title: 'GDPR Core Principles', duration: '20 min', type: 'reading', completed: false },
        { title: 'Final Quiz', duration: '15 min', type: 'quiz', completed: false }
      ]
    },
    {
      id: 7, title: 'Ransomware Prevention & Recovery',
      description: 'Comprehensive strategies to prevent ransomware attacks, minimize damage, and recover critical systems and data.',
      level: 'Intermediate', duration: '5 hours', enrolled: 9150, rating: 4.7,
      badge: 'Professional', gradient: 'linear-gradient(135deg, #EA580C 0%, #F59E0B 100%)',
      icon: 'bi-lock', image: 'assets/images/courses/intermediate.png',
      instructor: 'Armor Bridz Academy', lastUpdated: 'May 2026',
      whatYouLearn: ['Understand ransomware lifecycle', 'Deploy EDR solutions', 'Design backup strategies', 'Execute recovery playbooks'],
      prerequisites: ['Cybersecurity Essentials', 'Incident Response basics'],
      modules: [
        { title: 'Ransomware Lifecycle', duration: '20 min', type: 'reading', completed: false },
        { title: 'Final Quiz', duration: '15 min', type: 'quiz', completed: false }
      ]
    },
    {
      id: 8, title: 'Advanced Spear Phishing Defense',
      description: 'Master the art of detecting targeted phishing attacks that bypass traditional filters, including BEC and whaling techniques.',
      level: 'Advanced', duration: '6 hours', enrolled: 5640, rating: 4.9,
      badge: 'Expert', gradient: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)',
      icon: 'bi-bullseye', image: 'assets/images/courses/advanced.png',
      instructor: 'Armor Bridz Academy', lastUpdated: 'May 2026',
      whatYouLearn: ['Detect BEC & CEO fraud patterns', 'Perform email header forensics', 'Build AI-powered detection rules', 'Design advanced mail gateway policies'],
      prerequisites: ['Phishing Attack Recognition', 'Email administration experience'],
      modules: [
        { title: 'BEC & CEO Fraud Patterns', duration: '20 min', type: 'reading', completed: false },
        { title: 'Final Quiz', duration: '15 min', type: 'quiz', completed: false }
      ]
    },
    {
      id: 9, title: 'Email Security Architecture',
      description: 'Design and implement robust email security systems including SPF, DKIM, DMARC, and advanced threat protection.',
      level: 'Advanced', duration: '5 hours', enrolled: 3450, rating: 4.9,
      badge: 'Expert', gradient: 'linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)',
      icon: 'bi-envelope-check', image: 'assets/images/courses/advanced.png',
      instructor: 'Armor Bridz Academy', lastUpdated: 'May 2026',
      whatYouLearn: ['Configure SPF, DKIM & DMARC', 'Design email gateway architecture', 'Implement sandboxing strategies', 'Deploy zero-trust email security'],
      prerequisites: ['Email administration', 'DNS management experience'],
      modules: [
        { title: 'Email Security Landscape', duration: '20 min', type: 'reading', completed: false },
        { title: 'Final Quiz', duration: '15 min', type: 'quiz', completed: false }
      ]
    },
    {
      id: 10, title: 'Security Awareness Program Design',
      description: 'Learn to design, implement, and measure effective security awareness training programs that create lasting behavioral change.',
      level: 'Advanced', duration: '8 hours', enrolled: 2890, rating: 4.8,
      badge: 'Expert', gradient: 'linear-gradient(135deg, #9333EA 0%, #C084FC 100%)',
      icon: 'bi-mortarboard', image: 'assets/images/courses/advanced.png',
      instructor: 'Armor Bridz Academy', lastUpdated: 'May 2026',
      whatYouLearn: ['Build stakeholder buy-in', 'Design engaging content', 'Run phishing simulations', 'Measure program ROI'],
      prerequisites: ['Security fundamentals', 'Management experience preferred'],
      modules: [
        { title: 'Program Strategy', duration: '20 min', type: 'reading', completed: false },
        { title: 'Final Quiz', duration: '15 min', type: 'quiz', completed: false }
      ]
    },
    {
      id: 11, title: 'Threat Intelligence & Hunting',
      description: 'Learn to proactively identify, analyze, and respond to emerging cyber threats using advanced intelligence frameworks.',
      level: 'Advanced', duration: '9 hours', enrolled: 2100, rating: 4.9,
      badge: 'Expert', gradient: 'linear-gradient(135deg, #0F172A 0%, #334155 100%)',
      icon: 'bi-binoculars', image: 'assets/images/courses/advanced.png',
      instructor: 'Armor Bridz Academy', lastUpdated: 'May 2026',
      whatYouLearn: ['Apply MITRE ATT&CK framework', 'Use OSINT for threat analysis', 'Hunt threats proactively', 'Build a threat intel program'],
      prerequisites: ['Incident Response Playbook', 'SIEM experience'],
      modules: [
        { title: 'Threat Intelligence Lifecycle', duration: '20 min', type: 'reading', completed: false },
        { title: 'Final Quiz', duration: '15 min', type: 'quiz', completed: false }
      ]
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.profileSub = this.authService.userProfile$.subscribe(profile => {
      if (profile) {
        this.userName = (profile.firstName || 'Learner') + (profile.lastName ? ' ' + profile.lastName : '');
      }
    });

    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.course = this.allCourses.find(c => c.id === id) || null;
      if (!this.course) {
        this.router.navigate(['/learning-hub']);
        return;
      }
      // Load progress from localStorage
      const saved = localStorage.getItem(`ab_course_${id}_progress`);
      if (saved && this.course) {
        const data = JSON.parse(saved);
        if (data.completedLessons) {
          this.course.modules.forEach((mod, i) => {
            mod.completed = data.completedLessons.includes(i);
          });
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.profileSub?.unsubscribe();
  }

  get completedCount(): number {
    return this.course?.modules.filter(m => m.completed).length || 0;
  }

  get progressPercent(): number {
    if (!this.course) return 0;
    return Math.round((this.completedCount / this.course.modules.length) * 100);
  }

  getModuleIcon(type: string): string {
    switch (type) {
      case 'video':
      case 'reading': return 'bi-book';
      case 'quiz': return 'bi-patch-question';
      case 'lab': return 'bi-terminal';
      default: return 'bi-circle';
    }
  }

  getModuleTypeLabel(type: string): string {
    switch (type) {
      case 'video':
      case 'reading': return 'Reading';
      case 'quiz': return 'Quiz';
      case 'lab': return 'Hands-on Lab';
      default: return 'Lesson';
    }
  }

  isModuleLocked(index: number): boolean {
    if (index === 0) return false;
    return !this.course?.modules[index - 1].completed;
  }

  isCourseCompleted(): boolean {
    const id = this.course?.id;
    if (!id) return false;
    const saved = localStorage.getItem(`ab_course_${id}_progress`);
    if (saved) {
      const data = JSON.parse(saved);
      return data.quizSubmitted && data.quizScore >= 70;
    }
    return false;
  }

  getCTA(): string {
    if (this.isCourseCompleted()) return 'Completed';
    return this.completedCount > 0 ? 'Continue Learning' : 'Start Learning';
  }

  viewCertificate(): void {
    if (!this.course) return;
    this.router.navigate(['/learning-hub/course', this.course.id, 'learn'], { queryParams: { cert: 'true' } });
  }

  formatEnrolled(num: number): string {
    return num >= 1000 ? (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K' : num.toString();
  }

  goBack(): void {
    this.router.navigate(['/learning-hub'], { fragment: 'course-catalog' });
  }
}
