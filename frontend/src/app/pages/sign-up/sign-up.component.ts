import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements AfterViewInit {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  errorMessage = '';
  isSubmitting = false;
  showPassword = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  constructor(private authService: AuthService) {}

  ngAfterViewInit(): void {
    setTimeout(() => this.setupLiquidButtons(), 100);
  }

  async onSignUp(): Promise<void> {
    if (this.isSubmitting) return;
    this.errorMessage = '';
    this.isSubmitting = true;

    try {
      await this.authService.signUp(this.email, this.password, this.firstName, this.lastName);
    } catch (error: any) {
      this.isSubmitting = false;
      switch (error.code) {
        case 'auth/email-already-in-use':
          this.errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/invalid-email':
          this.errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          this.errorMessage = 'Password must be at least 6 characters.';
          break;
        case 'auth/operation-not-allowed':
          this.errorMessage = 'Email/Password sign up is not enabled. Contact support.';
          break;
        default:
          this.errorMessage = 'Sign up failed. Please try again.';
      }
    }
  }

  async onGoogleSignUp(): Promise<void> {
    if (this.isSubmitting) return;
    this.errorMessage = '';
    this.isSubmitting = true;

    try {
      await this.authService.signInWithGoogle();
    } catch (error: any) {
      this.isSubmitting = false;
      if (error.code === 'auth/popup-closed-by-user') {
        return;
      }
      this.errorMessage = 'Google sign up failed. Please try again.';
    }
  }

  private setupLiquidButtons(): void {
    const buttons = Array.from(document.querySelectorAll<HTMLElement>('.liquid-btn'));
    buttons.forEach(button => {
      if (button.dataset['liquidBound'] === 'true') return;
      button.dataset['liquidBound'] = 'true';

      let rect: DOMRect | null = null;
      let rafId = 0;
      let lastX = 0;
      let lastY = 0;

      const clamp = (value: number, min: number, max: number) =>
        Math.min(Math.max(value, min), max);

      const update = () => {
        rafId = 0;
        if (!rect) return;
        const x = clamp(lastX - rect.left, 0, rect.width);
        const y = clamp(lastY - rect.top, 0, rect.height);
        const percentX = rect.width ? x / rect.width : 0.5;
        const percentY = rect.height ? y / rect.height : 0.5;

        const tiltX = (0.5 - percentY) * 12;
        const tiltY = (percentX - 0.5) * 14;

        button.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
        button.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
        button.style.setProperty('--shine-x', `${(percentX * 100).toFixed(1)}%`);
        button.style.setProperty('--shine-y', `${(percentY * 100).toFixed(1)}%`);
        button.style.setProperty('--shade-x', `${((1 - percentX) * 100).toFixed(1)}%`);
        button.style.setProperty('--shade-y', `${((1 - percentY) * 100).toFixed(1)}%`);
      };

      const scheduleUpdate = () => {
        if (rafId) return;
        rafId = requestAnimationFrame(update);
      };

      const reset = () => {
        rect = null;
        button.classList.remove('is-hovered');
        button.style.removeProperty('--tilt-x');
        button.style.removeProperty('--tilt-y');
        button.style.removeProperty('--shine-x');
        button.style.removeProperty('--shine-y');
        button.style.removeProperty('--shade-x');
        button.style.removeProperty('--shade-y');
      };

      button.addEventListener('pointerenter', (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') return;
        rect = button.getBoundingClientRect();
        button.classList.add('is-hovered');
      });

      button.addEventListener('pointermove', (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') return;
        if (!rect) rect = button.getBoundingClientRect();
        lastX = event.clientX;
        lastY = event.clientY;
        scheduleUpdate();
      });

      button.addEventListener('pointerleave', (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') return;
        reset();
      });
    });
  }
}
