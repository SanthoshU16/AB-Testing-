import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TemplateService } from '../../../../services/template.service';
import { PhishingTemplate, TemplateCategory } from '../../../../models/template.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-template-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.css']
})
export class TemplateListComponent implements OnInit, OnDestroy {
  templates: PhishingTemplate[] = [];
  isLoading = true;
  private sub?: Subscription;

  activeTab: 'default' | 'my' = 'default';
  searchQuery: string = '';

  previewTemplateData: PhishingTemplate | null = null;
  previewHtmlContent: SafeHtml | null = null;

  categoryLabels: Record<TemplateCategory, string> = {
    'password-reset': '🔐 Password Reset',
    'login-alert': '🏢 Login Alert',
    'hr-policy': '📋 HR Policy',
    'delivery': '📦 Delivery',
    'vpn': '🔒 VPN',
    'custom': '✏️ Custom'
  };

  constructor(
    private templateService: TemplateService,
    private sanitizer: DomSanitizer,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.templateService.seedDefaultTemplates();
    await this.templateService.loadTemplates();
    this.sub = this.templateService.templates$.subscribe(data => {
      this.templates = data;
      this.isLoading = false;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get filteredTemplates(): PhishingTemplate[] {
    return this.templates.filter(tpl => {
      const matchesTab = this.activeTab === 'default' ? tpl.isDefault : !tpl.isDefault;
      const matchesSearch = (tpl.name || '').toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                            (tpl.subject || '').toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }

  getCategoryLabel(cat: TemplateCategory): string {
    return this.categoryLabels[cat] ?? cat;
  }

  async deleteTemplate(id: string | undefined, isDefault: boolean): Promise<void> {
    if (!id) return;
    if (isDefault) { alert('Default templates cannot be deleted.'); return; }
    if (confirm('Delete this template?')) {
      await this.templateService.deleteTemplate(id);
    }
  }

  openPreview(tpl: PhishingTemplate): void {
    this.previewTemplateData = tpl;

    // Use the logged-in user's real data for a realistic preview
    const profile = this.authService.currentProfile;
    const firstName = profile?.firstName || 'Employee';
    const lastName = profile?.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    const email = profile?.email || 'employee@company.com';

    let body = tpl.bodyHtml || '';
    body = body.replace(/\{\{EMPLOYEE_NAME\}\}/g, fullName);
    body = body.replace(/\{\{EMPLOYEE_FIRST\}\}/g, firstName);
    body = body.replace(/\{\{EMPLOYEE_EMAIL\}\}/g, email);
    body = body.replace(/\{\{DEPARTMENT\}\}/g, 'Engineering');
    body = body.replace(/\{\{COMPANY_NAME\}\}/g, 'Armor Bridz');
    body = body.replace(/\{\{TRACKING_LINK\}\}/g, '#');
    body = body.replace(/\{\{PHISHING_LINK\}\}/g, '#');

    this.previewHtmlContent = this.sanitizer.bypassSecurityTrustHtml(body);
  }

  closePreview(): void {
    this.previewTemplateData = null;
    this.previewHtmlContent = null;
  }
}
