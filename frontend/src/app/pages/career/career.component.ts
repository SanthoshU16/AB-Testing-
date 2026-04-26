import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { Hero3dDirective } from '../../shared/directives/hero-3d.directive';

@Component({
  selector: 'app-career',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, Hero3dDirective],
  templateUrl: './career.component.html',
  styleUrls: ['./career.component.css']
})
export class CareerComponent implements AfterViewInit {

  perks = [
    { icon: 'bi-rocket-takeoff', title: 'Innovation First', desc: 'Work on cutting-edge security tech that protects millions.' },
    { icon: 'bi-globe', title: 'Global Impact', desc: 'Our platform defends organizations across 40+ countries.' },
    { icon: 'bi-graph-up-arrow', title: 'Career Growth', desc: 'Clear paths for advancement with mentorship and L&D budgets.' },
    { icon: 'bi-book', title: 'Learning Culture', desc: 'Conferences, courses, and certifications — all on us.' },
    { icon: 'bi-heart', title: 'Wellness & Balance', desc: 'Flexible hours, remote-first, and comprehensive health benefits.' },
    { icon: 'bi-people', title: 'Amazing Team', desc: 'Collaborate with world-class engineers and security experts.' }
  ];

  jobs = [
    { title: 'Senior Frontend Engineer', team: 'Engineering', location: 'Remote', type: 'Full-time', tags: ['Angular', 'TypeScript', 'UI/UX'] },
    { title: 'Backend Developer', team: 'Engineering', location: 'London, UK', type: 'Full-time', tags: ['Java', 'Spring Boot', 'APIs'] },
    { title: 'Cybersecurity Analyst', team: 'Security', location: 'Remote', type: 'Full-time', tags: ['Threat Analysis', 'SIEM', 'Incident Response'] },
    { title: 'DevOps Engineer', team: 'Infrastructure', location: 'Remote', type: 'Full-time', tags: ['AWS', 'Docker', 'CI/CD'] },
    { title: 'Product Designer', team: 'Design', location: 'London, UK', type: 'Full-time', tags: ['Figma', 'Design Systems', 'UX Research'] },
    { title: 'Customer Success Manager', team: 'Growth', location: 'Remote', type: 'Full-time', tags: ['SaaS', 'Enterprise', 'Onboarding'] }
  ];

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('in-view');
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }
}
