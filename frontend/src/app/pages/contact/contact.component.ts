import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { Hero3dDirective } from '../../shared/directives/hero-3d.directive';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, Hero3dDirective],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements AfterViewInit {

  formData = { name: '', email: '', subject: '', message: '' };
  formSubmitted = false;

  contactInfo = [
    { icon: 'bi-geo-alt', title: 'Location', value: 'London, United Kingdom' },
    { icon: 'bi-telephone', title: 'Phone', value: '+44 20 7946 0958' },
    { icon: 'bi-envelope', title: 'Email', value: 'support@armorbridz.com' },
    { icon: 'bi-clock', title: 'Hours', value: 'Mon – Fri, 9AM – 6PM GMT' }
  ];

  submitForm(form: any) {
    if (form.invalid) return;
    console.log('Form submitted:', this.formData);
    this.formSubmitted = true;
    setTimeout(() => {
      this.formSubmitted = false;
      form.resetForm();
    }, 3000);
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