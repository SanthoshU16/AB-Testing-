import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { TrackingService } from '../../../services/tracking.service';
import { CampaignService } from '../../../services/campaign.service';
import { EmployeeService } from '../../../services/employee.service';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  isResettingData = false;
  isDeletingCampaigns = false;
  isDeletingEmployees = false;
  isDeletingAccount = false;
  isLoadingPrefs = true;

  // Toast notification
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;

  // Settings state — loaded from backend
  settings = {
    emailAlerts: true,
    weeklyReport: false,
    twoFactorEnabled: false
  };

  private apiUrl = `${environment.apiUrl}/users`;

  constructor(
    private trackingService: TrackingService,
    private campaignService: CampaignService,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.loadPreferences();
  }

  // ─── Load preferences from backend ──────────────────────────────────

  async loadPreferences(): Promise<void> {
    this.isLoadingPrefs = true;
    try {
      const prefs = await firstValueFrom(
        this.http.get<any>(`${this.apiUrl}/me/preferences`)
      );
      this.settings.emailAlerts = prefs.emailAlerts ?? true;
      this.settings.weeklyReport = prefs.weeklyReport ?? false;
      this.settings.twoFactorEnabled = prefs.twoFactorEnabled ?? false;
    } catch (e) {
      console.error('Failed to load preferences, using defaults', e);
    }
    this.isLoadingPrefs = false;
  }

  // ─── Save preferences to backend ───────────────────────────────────

  async savePreferences(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.put(`${this.apiUrl}/me/preferences`, this.settings)
      );
    } catch (e) {
      console.error('Failed to save preferences', e);
      this.displayToast('Failed to save setting. Please try again.', 'error');
    }
  }

  // ─── Toggle handlers ────────────────────────────────────────────────

  async toggleSetting(settingName: string, event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const value = input.checked;
    const displayName = settingName === 'Email Alerts' ? 'Email Alerts' : 'Weekly Report';

    await this.savePreferences();
    this.displayToast(
      `${displayName} ${value ? 'enabled' : 'disabled'} successfully.`,
      'success'
    );
  }

  async toggle2FA(): Promise<void> {
    this.settings.twoFactorEnabled = !this.settings.twoFactorEnabled;
    await this.savePreferences();
    const status = this.settings.twoFactorEnabled ? 'enabled' : 'disabled';
    this.displayToast(
      `Two-Factor Authentication has been ${status}.`,
      'success'
    );
  }

  // ─── Toast notification ─────────────────────────────────────────────

  displayToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  // ─── Danger Zone Actions ────────────────────────────────────────────

  async resetData(): Promise<void> {
    const promptValue = prompt('Please type "DELETE" to confirm you want to delete all tracking data.');
    if (promptValue === 'DELETE') {
      this.isResettingData = true;
      try {
        await this.trackingService.resetAllData();
        this.displayToast('All tracking data has been successfully reset.', 'success');
        this.isResettingData = false;
      } catch (err) {
        console.error('Failed to reset data', err);
        this.displayToast('Failed to reset data. Please try again.', 'error');
        this.isResettingData = false;
      }
    } else if (promptValue !== null) {
      this.displayToast('Confirmation text did not match. Action cancelled.', 'error');
    }
  }

  async deleteAllCampaigns(): Promise<void> {
    const promptValue = prompt('Please type "DELETE" to confirm you want to delete ALL campaigns permanently.');
    if (promptValue === 'DELETE') {
      this.isDeletingCampaigns = true;
      try {
        await this.campaignService.deleteAllCampaigns();
        this.displayToast('All campaigns have been successfully deleted.', 'success');
        this.isDeletingCampaigns = false;
      } catch (err) {
        console.error('Failed to delete campaigns', err);
        this.displayToast('Failed to delete campaigns. Please try again.', 'error');
        this.isDeletingCampaigns = false;
      }
    } else if (promptValue !== null) {
      this.displayToast('Confirmation text did not match. Action cancelled.', 'error');
    }
  }

  async deleteAllEmployees(): Promise<void> {
    const promptValue = prompt('Please type "DELETE" to confirm you want to delete ALL employees permanently.');
    if (promptValue === 'DELETE') {
      this.isDeletingEmployees = true;
      try {
        await this.employeeService.deleteAllEmployees();
        this.displayToast('All employees have been successfully deleted.', 'success');
        this.isDeletingEmployees = false;
      } catch (err) {
        console.error('Failed to delete employees', err);
        this.displayToast('Failed to delete employees. Please try again.', 'error');
        this.isDeletingEmployees = false;
      }
    } else if (promptValue !== null) {
      this.displayToast('Confirmation text did not match. Action cancelled.', 'error');
    }
  }

  async deleteAccount(): Promise<void> {
    const promptValue = prompt('Please type "DELETE" to confirm you want to permanently delete your account.');
    if (promptValue === 'DELETE') {
      this.isDeletingAccount = true;
      try {
        await this.authService.deleteAccount();
      } catch (err) {
        console.error('Failed to delete account', err);
        this.displayToast('Failed to delete account. Please try again.', 'error');
        this.isDeletingAccount = false;
      }
    } else if (promptValue !== null) {
      this.displayToast('Confirmation text did not match. Account deletion cancelled.', 'error');
    }
  }
}
