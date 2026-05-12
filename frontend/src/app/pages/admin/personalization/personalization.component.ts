import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

type ThemeMode = 'light' | 'dark' | 'auto';

@Component({
  selector: 'app-personalization',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './personalization.component.html',
  styleUrls: ['./personalization.component.css']
})
export class PersonalizationComponent implements OnInit {
  selectedTheme: ThemeMode = 'light';
  savedTheme: ThemeMode = 'light';
  showToast = false;
  toastMessage = '';
  isSaving = false;

  // Accent color options
  accentColors = [
    { name: 'Blue', value: '#2563EB' },
    { name: 'Purple', value: '#7C3AED' },
    { name: 'Teal', value: '#0D9488' },
    { name: 'Rose', value: '#E11D48' },
    { name: 'Amber', value: '#D97706' },
    { name: 'Emerald', value: '#059669' },
  ];
  selectedAccent = '#2563EB';
  savedAccent = '#2563EB';



  ngOnInit(): void {
    // Load saved preferences from localStorage
    const saved = localStorage.getItem('ab-theme');
    if (saved) {
      this.selectedTheme = saved as ThemeMode;
      this.savedTheme = saved as ThemeMode;
    }

    const savedAccent = localStorage.getItem('ab-accent');
    if (savedAccent) {
      this.selectedAccent = savedAccent;
      this.savedAccent = savedAccent;
    }



    this.applyTheme(this.selectedTheme);
    this.applyAccent(this.selectedAccent);
  }

  selectTheme(theme: ThemeMode): void {
    this.selectedTheme = theme;
    // Live preview
    this.applyTheme(theme);
  }

  selectAccent(color: string): void {
    this.selectedAccent = color;
    this.applyAccent(color);
  }



  get hasChanges(): boolean {
    return this.selectedTheme !== this.savedTheme
      || this.selectedAccent !== this.savedAccent;
  }

  savePreferences(): void {
    if (this.isSaving) return;
    this.isSaving = true;

    // Simulate a save delay for realism
    setTimeout(() => {
      localStorage.setItem('ab-theme', this.selectedTheme);
      localStorage.setItem('ab-accent', this.selectedAccent);

      this.savedTheme = this.selectedTheme;
      this.savedAccent = this.selectedAccent;

      this.applyTheme(this.selectedTheme);
      this.applyAccent(this.selectedAccent);

      this.isSaving = false;
      this.showNotification('Preferences saved successfully!');
    }, 600);
  }

  resetToDefaults(): void {
    this.selectedTheme = 'light';
    this.selectedAccent = '#2563EB';
    this.applyTheme('light');
    this.applyAccent('#2563EB');
  }

  private applyTheme(theme: ThemeMode): void {
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark');

    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
    } else {
      root.classList.add(`theme-${theme}`);
    }
  }

  private applyAccent(color: string): void {
    document.documentElement.style.setProperty('--accent-color', color);
  }

  private showNotification(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}
