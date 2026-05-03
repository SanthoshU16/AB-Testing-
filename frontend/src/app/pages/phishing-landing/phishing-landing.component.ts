import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

type Phase = 'loading' | 'landing' | 'submitted';
type LoginStep = 'email' | 'password';

@Component({
  selector: 'app-phishing-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './phishing-landing.component.html',
  styleUrls: ['./phishing-landing.component.css']
})
export class PhishingLandingComponent implements OnInit {
  phase: Phase = 'loading';
  loginStep: LoginStep = 'email';
  campaignId = '';
  employeeId = '';
  fakeUsername = '';
  fakePassword = '';
  emailError = '';
  isSubmitting = false;
  showPassword = false;

  // Dynamic landing page config from template
  brand = 'Microsoft';
  logoUrl = '';
  primaryColor = '#0078d4';
  bgColor = '#f2f2f2';

  particles = Array.from({ length: 20 }, () => ({
    x: Math.random() * 100 + '%',
    delay: (Math.random() * 6).toFixed(1) + 's',
    dur: (6 + Math.random() * 6).toFixed(1) + 's'
  }));

  redFlags: string[] = [];
  safetyTips = [
    { icon: '🔍', title: 'Check the URL', description: 'Always verify the domain in the address bar before entering credentials' },
    { icon: '📧', title: 'Verify the Sender', description: 'Check the full email address, not just the display name' },
    { icon: '🔒', title: 'Use MFA', description: 'Multi-factor authentication stops 99% of credential theft attacks' },
    { icon: '🚨', title: 'Report Suspicious', description: 'When in doubt, forward suspicious emails to your IT security team' }
  ];

  private apiUrl = environment.apiUrl;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.campaignId = this.route.snapshot.paramMap.get('campaignId') ?? '';
    this.employeeId = this.route.snapshot.paramMap.get('employeeId') ?? '';
    this.loadCampaignTheme();
    this.zone.runOutsideAngular(() => { this.trackEvent('link_clicked', false); });
  }

  private loadCampaignTheme(): void {
    this.http.get<any>(`${this.apiUrl}/campaigns/${this.campaignId}/theme`).subscribe({
      next: (data) => {
        this.brand = data?.landingBrand || data?.name || data?.templateName || 'Microsoft';
        this.logoUrl = data?.landingLogoUrl || '';
        this.primaryColor = data?.landingPrimaryColor || '#0078d4';
        this.bgColor = data?.landingBgColor || '#f2f2f2';
        this.setRedFlags();
        this.showLanding();
      },
      error: () => {
        this.setRedFlags();
        this.showLanding();
      }
    });
  }

  private setRedFlags(): void {
    this.redFlags = [
      `The sender email was not from an official ${this.brand} domain`,
      `The login URL did not match the real ${this.brand} website`,
      `${this.brand} never asks you to re-enter credentials via email links`,
      'The email used urgency tactics — a classic social engineering trick'
    ];
  }

  private showLanding(): void {
    this.zone.run(() => {
      setTimeout(() => {
        this.phase = 'landing';
        this.cdr.detectChanges();
      }, 1500);
    });
  }

  goToPassword(): void {
    if (!this.fakeUsername || !this.fakeUsername.includes('@')) {
      this.emailError = 'Please enter a valid email address.';
      return;
    }
    this.emailError = '';
    this.loginStep = 'password';
  }

  onSubmit(): void {
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    this.trackEvent('credential_attempt', true);
    setTimeout(() => {
      this.phase = 'submitted';
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }, 1200);
  }

  // Compute contrasting text color for a given background
  get btnTextColor(): string {
    const hex = this.primaryColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }

  private trackEvent(eventType: string, credentialAttempted: boolean): void {
    try {
      this.http.post(`${this.apiUrl}/tracking/public/log`, {
        campaignId: this.campaignId,
        employeeId: this.employeeId,
        employeeEmail: this.fakeUsername || '',
        eventType,
        credentialAttempted
      }).subscribe({ next: () => {}, error: () => {} });
    } catch { }
  }
}
