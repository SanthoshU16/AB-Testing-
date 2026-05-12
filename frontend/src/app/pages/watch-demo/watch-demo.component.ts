import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-watch-demo',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './watch-demo.component.html',
  styleUrls: ['./watch-demo.component.css']
})
export class WatchDemoComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  activeDemo = 0;
  private subs: Subscription[] = [];

  demos = [
    {
      id: 'overview',
      title: 'Platform Overview',
      subtitle: 'See the full Armor Bridz experience in action',
      desc: 'A complete walkthrough of the Armor Bridz platform — from your first login to launching campaigns, tracking results, and generating compliance reports.',
      icon: 'bi-play-circle-fill',
      duration: '3 min',
      video: 'demo-video.mov'
    },
    {
      id: 'campaigns',
      title: 'Launching Campaigns',
      subtitle: 'Create and deploy phishing simulations',
      desc: 'Learn how to build realistic phishing campaigns using pre-built templates, target specific employee groups, and schedule delivery for maximum impact.',
      icon: 'bi-send-fill',
      duration: '2 min',
      video: 'demo-video.mov'
    },
    {
      id: 'analytics',
      title: 'Analytics & Reporting',
      subtitle: 'Real-time insights and compliance exports',
      desc: 'Discover how the analytics dashboard tracks click rates, credential attempts, and risk scores — then export audit-ready reports in one click.',
      icon: 'bi-graph-up-arrow',
      duration: '2 min',
      video: 'demo-video.mov'
    },
    {
      id: 'learning',
      title: 'Learning Hub',
      subtitle: 'Train your team with structured courses',
      desc: 'Explore the Learning Hub\'s 11 cybersecurity courses, auto-locked progression system, and certificate generation that keeps your team sharp.',
      icon: 'bi-mortarboard-fill',
      duration: '2 min',
      video: 'demo-video.mov'
    },
    {
      id: 'employees',
      title: 'Employee Management',
      subtitle: 'Import, organize, and track your team',
      desc: 'See how to add employees via CSV or manually, assign them to departments, and monitor individual vulnerability scores across campaigns.',
      icon: 'bi-people-fill',
      duration: '1 min',
      video: 'demo-video.mov'
    }
  ];

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.subs.push(
      this.authService.currentUser$.subscribe(user => {
        this.isLoggedIn = !!user;
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  selectDemo(index: number): void {
    this.activeDemo = index;
    // Scroll video into view
    setTimeout(() => {
      document.getElementById('demo-player')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }
}
