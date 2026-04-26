import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { Hero3dDirective } from '../../shared/directives/hero-3d.directive';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, Hero3dDirective],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent implements AfterViewInit {

  featured = {
    tag: 'Featured',
    title: 'How Phishing Attacks Work in 2026',
    desc: 'Explore the latest tactics used by attackers and learn how modern organizations stay one step ahead with simulation-based training.',
    date: 'Apr 15, 2026',
    readTime: '8 min read'
  };

  posts = [
    {
      tag: 'Phishing',
      title: 'Email Spoofing Explained: A Complete Guide',
      desc: 'Learn how attackers fake email identities and how to spot spoofed messages before they cause damage.',
      date: 'Apr 10, 2026',
      readTime: '6 min read'
    },
    {
      tag: 'Security',
      title: 'Zero Trust Security for Modern Teams',
      desc: 'Why modern companies are adopting zero trust architecture and how it changes your security posture.',
      date: 'Apr 5, 2026',
      readTime: '5 min read'
    },
    {
      tag: 'Training',
      title: 'Building a Security-Aware Culture',
      desc: 'Transform your employees from the weakest link to the strongest defense with structured awareness programs.',
      date: 'Mar 28, 2026',
      readTime: '7 min read'
    },
    {
      tag: 'Tips',
      title: 'Password Best Practices in 2026',
      desc: 'How to create strong, secure passwords and implement password management at scale.',
      date: 'Mar 20, 2026',
      readTime: '4 min read'
    },
    {
      tag: 'Enterprise',
      title: 'Compliance Made Simple with Armor Bridz',
      desc: 'One-click audit reports for ISO 27001, SOC 2, and GDPR. Always be audit-ready.',
      date: 'Mar 15, 2026',
      readTime: '5 min read'
    },
    {
      tag: 'Awareness',
      title: 'The Psychology Behind Phishing Success',
      desc: 'Understanding cognitive biases that make phishing attacks effective — and how to counter them.',
      date: 'Mar 8, 2026',
      readTime: '9 min read'
    }
  ];

  topics = ['All', 'Phishing', 'Security', 'Training', 'Enterprise', 'Tips', 'Awareness'];
  activeTopic = 'All';

  get filteredPosts() {
    if (this.activeTopic === 'All') return this.posts;
    return this.posts.filter(p => p.tag === this.activeTopic);
  }

  selectTopic(topic: string) {
    this.activeTopic = topic;
  }

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