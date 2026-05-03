import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TrackingService } from '../../../services/tracking.service';
import { CampaignService } from '../../../services/campaign.service';
import { EmployeeService } from '../../../services/employee.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  isResettingData = false;
  isDeletingCampaigns = false;
  isDeletingEmployees = false;
  isDeletingAccount = false;

  // Mock settings state
  settings = {
    emailAlerts: true,
    weeklyReport: false,
    twoFactorEnabled: false
  };

  constructor(
    private trackingService: TrackingService,
    private campaignService: CampaignService,
    private employeeService: EmployeeService,
    private authService: AuthService
  ) {}

  toggleSetting(settingName: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    console.log(`${settingName} changed to: ${input.checked}`);
    // Simulate API call
    setTimeout(() => {
      // In a real app, we'd save to backend here
    }, 500);
  }

  toggle2FA(): void {
    this.settings.twoFactorEnabled = !this.settings.twoFactorEnabled;
    const status = this.settings.twoFactorEnabled ? 'enabled' : 'disabled';
    alert(`Two-Factor Authentication has been ${status}.`);
  }

  async resetData(): Promise<void> {
    const promptValue = prompt('Please type "DELETE" to confirm you want to delete all tracking data.');
    if (promptValue === 'DELETE') {
      this.isResettingData = true;
      try {
        await this.trackingService.resetAllData();
        alert('All tracking data has been successfully reset.');
        this.isResettingData = false;
      } catch (err) {
        console.error('Failed to reset data', err);
        alert('Failed to reset data. Please try again.');
        this.isResettingData = false;
      }
    } else if (promptValue !== null) {
      alert('Confirmation text did not match. Action cancelled.');
    }
  }

  async deleteAllCampaigns(): Promise<void> {
    const promptValue = prompt('Please type "DELETE" to confirm you want to delete ALL campaigns permanently.');
    if (promptValue === 'DELETE') {
      this.isDeletingCampaigns = true;
      try {
        await this.campaignService.deleteAllCampaigns();
        alert('All campaigns have been successfully deleted.');
        this.isDeletingCampaigns = false;
      } catch (err) {
        console.error('Failed to delete campaigns', err);
        alert('Failed to delete campaigns. Please try again.');
        this.isDeletingCampaigns = false;
      }
    } else if (promptValue !== null) {
      alert('Confirmation text did not match. Action cancelled.');
    }
  }

  async deleteAllEmployees(): Promise<void> {
    const promptValue = prompt('Please type "DELETE" to confirm you want to delete ALL employees permanently.');
    if (promptValue === 'DELETE') {
      this.isDeletingEmployees = true;
      try {
        await this.employeeService.deleteAllEmployees();
        alert('All employees have been successfully deleted.');
        this.isDeletingEmployees = false;
      } catch (err) {
        console.error('Failed to delete employees', err);
        alert('Failed to delete employees. Please try again.');
        this.isDeletingEmployees = false;
      }
    } else if (promptValue !== null) {
      alert('Confirmation text did not match. Action cancelled.');
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
        alert('Failed to delete account. Please try again.');
        this.isDeletingAccount = false;
      }
    } else if (promptValue !== null) {
      alert('Confirmation text did not match. Account deletion cancelled.');
    }
  }
}
