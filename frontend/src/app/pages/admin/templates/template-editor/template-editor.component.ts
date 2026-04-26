import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TemplateService } from '../../../../services/template.service';
import { PhishingTemplate, TemplateCategory } from '../../../../models/template.model';

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

  template: Omit<PhishingTemplate, 'id'> = {
    name: '',
    category: 'custom',
    subject: '',
    senderName: '',
    senderEmail: '',
    bodyHtml: '',
    previewText: '',
    isDefault: false
  };

  categories: { value: TemplateCategory; label: string }[] = [
    { value: 'password-reset', label: '🔐 Password Reset' },
    { value: 'login-alert', label: '🏢 Login Alert' },
    { value: 'hr-policy', label: '📋 HR Policy' },
    { value: 'delivery', label: '📦 Delivery Notice' },
    { value: 'vpn', label: '🔒 VPN Reset' },
    { value: 'custom', label: '✏️ Custom' }
  ];

  constructor(
    private templateService: TemplateService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

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

  insertTrackingLink(): void {
    this.template.bodyHtml += ' {{TRACKING_LINK}} ';
  }

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
