import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';
import { COURSE_CONTENT, CourseContent, LessonContent, QuizQuestion } from './course-content.data';

@Component({
  selector: 'app-course-learn',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FormsModule],
  templateUrl: './course-learn.component.html',
  styleUrls: ['./course-learn.component.css']
})
export class CourseLearnComponent implements OnInit, OnDestroy {
  courseId = 0;
  course: CourseContent | null = null;
  currentLessonIndex = 0;
  userName = '';
  sidebarOpen = true;

  // Quiz state
  quizAnswers: { [key: number]: number } = {};
  quizSubmitted = false;
  quizScore = 0;

  // Certificate state
  showCertificate = false;
  certificateDate = '';

  private profileSub?: Subscription;
  private storageKey = '';

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
      this.courseId = +params['id'];
      this.course = COURSE_CONTENT.find(c => c.id === this.courseId) || null;
      if (!this.course) {
        this.router.navigate(['/learning-hub']);
        return;
      }
      this.storageKey = `ab_course_${this.courseId}_progress`;
      this.loadProgress();

      // Check for certificate query param
      this.route.queryParams.subscribe(params => {
        if (params['cert'] === 'true' && this.courseCompleted) {
          this.goToCertificate();
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.profileSub?.unsubscribe();
  }

  // ── Progress Persistence ──
  private loadProgress(): void {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      const data = JSON.parse(saved);
      this.currentLessonIndex = data.currentLesson || 0;
      if (this.course) {
        this.course.lessons.forEach((lesson, i) => {
          lesson.completed = data.completedLessons?.includes(i) || false;
        });
      }
      if (data.quizAnswers) this.quizAnswers = data.quizAnswers;
      if (data.quizSubmitted) {
        this.quizSubmitted = true;
        this.quizScore = data.quizScore || 0;
      }
    }
  }

  private saveProgress(): void {
    if (!this.course) return;
    const completedLessons = this.course.lessons
      .map((l, i) => l.completed ? i : -1)
      .filter(i => i >= 0);
    const data = {
      currentLesson: this.currentLessonIndex,
      completedLessons,
      quizAnswers: this.quizAnswers,
      quizSubmitted: this.quizSubmitted,
      quizScore: this.quizScore
    };
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  // ── Navigation ──
  get currentLesson(): LessonContent | null {
    return this.course?.lessons[this.currentLessonIndex] || null;
  }

  get isQuizPage(): boolean {
    return this.course ? this.currentLessonIndex === this.course.lessons.length : false;
  }

  get isCertificatePage(): boolean {
    return this.course ? this.currentLessonIndex === this.course.lessons.length + 1 : false;
  }

  get totalSteps(): number {
    return (this.course?.lessons.length || 0) + 1; // lessons + quiz
  }

  get completedCount(): number {
    return this.course?.lessons.filter(l => l.completed).length || 0;
  }

  get progressPercent(): number {
    if (!this.course) return 0;
    const total = this.course.lessons.length + 1;
    const done = this.completedCount + (this.quizSubmitted ? 1 : 0);
    return Math.round((done / total) * 100);
  }

  get allLessonsCompleted(): boolean {
    return this.course?.lessons.every(l => l.completed) || false;
  }

  get courseCompleted(): boolean {
    return this.allLessonsCompleted && this.quizSubmitted && this.quizScore >= 70;
  }

  isLessonLocked(index: number): boolean {
    if (!this.course || index === 0) return false;
    return !this.course.lessons[index - 1].completed;
  }

  isQuizLocked(): boolean {
    return !this.allLessonsCompleted;
  }

  goToLesson(index: number): void {
    if (this.isLessonLocked(index)) return;
    this.currentLessonIndex = index;
    this.saveProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToQuiz(): void {
    if (!this.course || this.isQuizLocked()) return;
    this.currentLessonIndex = this.course.lessons.length;
    this.saveProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToCertificate(): void {
    if (!this.course) return;
    this.currentLessonIndex = this.course.lessons.length + 1;
    this.showCertificate = true;
    this.certificateDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  markLessonComplete(): void {
    if (this.currentLesson) {
      this.currentLesson.completed = true;
      this.saveProgress();
      // Auto-advance to next
      if (this.course && this.currentLessonIndex < this.course.lessons.length - 1) {
        this.goToLesson(this.currentLessonIndex + 1);
      } else if (this.allLessonsCompleted) {
        this.goToQuiz();
      }
    }
  }

  nextLesson(): void {
    if (!this.course) return;
    if (this.currentLessonIndex < this.course.lessons.length - 1) {
      this.goToLesson(this.currentLessonIndex + 1);
    } else {
      this.goToQuiz();
    }
  }

  prevLesson(): void {
    if (this.currentLessonIndex > 0) {
      this.goToLesson(this.currentLessonIndex - 1);
    }
  }

  // ── Quiz ──
  selectAnswer(qIndex: number, optIndex: number): void {
    if (this.quizSubmitted) return;
    this.quizAnswers[qIndex] = optIndex;
  }

  get quizQuestions(): QuizQuestion[] {
    return this.course?.quiz || [];
  }

  get allQuestionsAnswered(): boolean {
    return this.quizQuestions.every((_, i) => this.quizAnswers[i] !== undefined);
  }

  submitQuiz(): void {
    if (!this.course || !this.allQuestionsAnswered) return;
    let correct = 0;
    this.course.quiz.forEach((q, i) => {
      if (this.quizAnswers[i] === q.correctIndex) correct++;
    });
    this.quizScore = Math.round((correct / this.course.quiz.length) * 100);
    this.quizSubmitted = true;
    this.saveProgress();
  }

  retakeQuiz(): void {
    this.quizAnswers = {};
    this.quizSubmitted = false;
    this.quizScore = 0;
    this.saveProgress();
  }

  isCorrectAnswer(qIndex: number, optIndex: number): boolean {
    return this.quizSubmitted && this.course?.quiz[qIndex]?.correctIndex === optIndex;
  }

  isWrongAnswer(qIndex: number, optIndex: number): boolean {
    return this.quizSubmitted && this.quizAnswers[qIndex] === optIndex && !this.isCorrectAnswer(qIndex, optIndex);
  }

  downloadCertificate(): void {
    const data = document.querySelector('.cl-cert') as HTMLElement;
    if (!data) return;

    // @ts-ignore
    html2canvas(data, { scale: 3, useCORS: true, allowTaint: true, logging: false }).then(canvas => {
      const imgWidth = 297; // A4 Landscape width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const contentDataURL = canvas.toDataURL('image/png');
      
      // @ts-ignore
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('l', 'mm', 'a4'); // landscape
      const position = (210 - imgHeight) / 2; // center vertically
      pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
      pdf.save(`${this.course?.title || 'Course'}_Certificate.pdf`);
    });
  }

  goBack(): void {
    this.router.navigate(['/learning-hub/course', this.courseId]);
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
