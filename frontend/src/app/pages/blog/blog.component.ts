import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent {

  blogs = [
    {
      title: "Phishing Awareness Guide",
      desc: "Understand how phishing attacks work and how to prevent them."
    },
    {
      title: "Top Cybersecurity Trends",
      desc: "Explore the latest trends in cybersecurity in 2026."
    },
    {
      title: "Employee Security Training",
      desc: "Train your team to detect phishing emails effectively."
    }
  ];

}