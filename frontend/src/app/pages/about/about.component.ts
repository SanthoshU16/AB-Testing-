import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  orgCount = 500;
  simCount = 10000000;
  successRate = 99;

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadStats();
  }

  // 🔥 Load from storage
  loadStats() {
    const data = localStorage.getItem('stats');

    if (data) {
      const stats = JSON.parse(data);
      this.orgCount = stats.orgCount;
      this.simCount = stats.simCount;
      this.successRate = stats.successRate;
    }
  }

  // 🔥 Update when user scores
  updateStats() {

    this.orgCount += 1;
    this.simCount += 5000;
    this.successRate = Math.min(100, this.successRate + 1);

    localStorage.setItem('stats', JSON.stringify({
      orgCount: this.orgCount,
      simCount: this.simCount,
      successRate: this.successRate
    }));
  }

  // CTA
  goToSignup() {
    this.blink();
    setTimeout(() => {
      this.router.navigate(['/signup']);
    }, 300);
  }

  goToDemo() {
    this.blink();
    setTimeout(() => {
      this.router.navigate(['/demo']);
    }, 300);
  }

  blink() {
    document.body.classList.add('blink');
    setTimeout(() => {
      document.body.classList.remove('blink');
    }, 300);
  }
}