import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.css']
})
export class PrivacyComponent {

  activeSection = 't1';

  @HostListener('window:scroll', [])
  onScroll() {
    const sections = ['t1','t2','t3','t4','t5','t6','t7'];

    for (let id of sections) {
      const el = document.getElementById(id);
      if (el) {
        const top = el.getBoundingClientRect().top;

        if (top <= 140 && top >= -200) {
          this.activeSection = id;
        }
      }
    }
  }
}