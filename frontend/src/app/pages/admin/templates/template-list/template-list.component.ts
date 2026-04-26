import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { TemplateService } from '../../../../services/template.service';
import { PhishingTemplate, TemplateCategory } from '../../../../models/template.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-template-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.css']
})
export class TemplateListComponent implements OnInit, OnDestroy {
  templates: PhishingTemplate[] = [];
  isLoading = true;
  private sub?: Subscription;

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
    private sanitizer: DomSanitizer
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
    this.previewHtmlContent = this.sanitizer.bypassSecurityTrustHtml(tpl.bodyHtml);
  }

  closePreview(): void {
    this.previewTemplateData = null;
    this.previewHtmlContent = null;
  }
}
