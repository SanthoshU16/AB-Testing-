import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TemplateService } from '../../../../services/template.service';
import { PhishingTemplate, TemplateCategory } from '../../../../models/template.model';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-template-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './template-editor.component.html',
  styleUrls: ['./template-editor.component.css']
})
export class TemplateEditorComponent implements OnInit {
  TRACKING_LINK = '{{TRACKING_LINK}}';
  isEditMode = false;
  templateId: string | null = null;
  isSaving = false;
  showPreview = false;
  editorMode: 'visual' | 'code' = 'visual';

  @ViewChild('visualEditor') visualEditor!: ElementRef<HTMLDivElement>;

  template: Omit<PhishingTemplate, 'id'> = {
    name: '',
    category: 'custom',
    subject: '',
    senderName: '',
    senderEmail: '',
    bodyHtml: '',
    previewText: '',
    isDefault: false,
    landingBrand: 'Microsoft',
    landingLogoUrl: '',
    landingPrimaryColor: '#0078d4',
    landingBgColor: '#f2f2f2'
  };

  categories: { value: TemplateCategory; label: string }[] = [
    { value: 'password-reset', label: 'Password Reset' },
    { value: 'login-alert', label: 'Login Alert' },
    { value: 'hr-policy', label: 'HR Policy' },
    { value: 'delivery', label: 'Delivery Notice' },
    { value: 'vpn', label: 'VPN Reset' },
    { value: 'custom', label: 'Custom' }
  ];

  constructor(
    private templateService: TemplateService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private authService: AuthService
  ) {}

  /** Bypass Angular sanitization so inline styles / tables render in the visual editor */
  get safeBodyHtml(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.template.bodyHtml || '');
  }

  /** Full HTML document for the preview iframe so it renders exactly like an email client */
  get previewSrcdoc(): SafeResourceUrl {
    // Use the logged-in user's real data for a realistic preview
    const profile = this.authService.currentProfile;
    const firstName = profile?.firstName || 'Employee';
    const lastName = profile?.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    const email = profile?.email || 'employee@company.com';

    let body = this.template.bodyHtml || '<p style="color:#999;">No email body yet…</p>';
    body = body.replace(/\{\{EMPLOYEE_NAME\}\}/g, fullName);
    body = body.replace(/\{\{EMPLOYEE_FIRST\}\}/g, firstName);
    body = body.replace(/\{\{EMPLOYEE_EMAIL\}\}/g, email);
    body = body.replace(/\{\{DEPARTMENT\}\}/g, 'Engineering');
    body = body.replace(/\{\{COMPANY_NAME\}\}/g, 'Armor Bridz');
    body = body.replace(/\{\{TRACKING_LINK\}\}/g, '#');
    body = body.replace(/\{\{PHISHING_LINK\}\}/g, '#');

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a1a2e;line-height:1.6;}</style></head><body>${body}</body></html>`;
    return this.sanitizer.bypassSecurityTrustResourceUrl('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  }

  async ngOnInit(): Promise<void> {
    this.templateId = this.route.snapshot.paramMap.get('id');
    if (this.templateId) {
      this.isEditMode = true;
      const tpl = await this.templateService.getTemplate(this.templateId);
      if (tpl) {
        const { id, ...rest } = tpl;
        this.template = rest;
      }
    }
  }

  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  // ── Visual Editor Commands ──────────────────────────────────────────

  execCmd(command: string): void {
    document.execCommand(command, false);
    this.syncFromVisual();
  }

  execCmdWithArg(command: string, event: Event): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    if (target.value) {
      document.execCommand(command, false, target.value);
      this.syncFromVisual();
    }
  }

  insertLink(): void {
    const url = prompt('Enter URL:', 'https://');
    if (url) {
      document.execCommand('createLink', false, url);
      this.syncFromVisual();
    }
  }

  insertTrackingLinkVisual(): void {
    const linkText = prompt('Link text (what the user sees):', 'Click here to reset your password');
    if (linkText) {
      const html = `<a href="{{TRACKING_LINK}}" style="color: #2563EB; text-decoration: underline; font-weight: 600;">${linkText}</a>`;
      document.execCommand('insertHTML', false, html);
      this.syncFromVisual();
    }
  }

  insertHr(): void {
    document.execCommand('insertHTML', false, '<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;">');
    this.syncFromVisual();
  }

  insertTrackingLink(): void {
    this.template.bodyHtml += ' {{TRACKING_LINK}} ';
  }

  onVisualInput(event: Event): void {
    const el = event.target as HTMLDivElement;
    this.template.bodyHtml = el.innerHTML;
  }

  private syncFromVisual(): void {
    if (this.visualEditor?.nativeElement) {
      this.template.bodyHtml = this.visualEditor.nativeElement.innerHTML;
    }
  }

  // ── Save / Cancel ───────────────────────────────────────────────────

  async save(): Promise<void> {
    if (this.isSaving) return;
    if (!this.template.name || !this.template.subject || !this.template.bodyHtml) {
      alert('Please fill in Name, Subject, and Body.');
      return;
    }
    this.isSaving = true;
    try {
      if (this.isEditMode && this.templateId) {
        await this.templateService.updateTemplate(this.templateId, this.template);
      } else {
        await this.templateService.createTemplate(this.template);
      }
      this.router.navigate(['/admin/templates']);
    } catch (e: any) {
      console.error(e);
      alert('Failed to save template: ' + (e.message || JSON.stringify(e)));
    } finally {
      this.isSaving = false;
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/templates']);
  }
}
