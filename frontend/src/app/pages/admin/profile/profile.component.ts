import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { UserProfile } from '../../../models/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  userProfile: UserProfile | null = null;
  editModel: Partial<UserProfile> = {};
  isEditing = false;
  isSaving = false;
  saveSuccess = false;
  private sub?: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.sub = this.authService.userProfile$.subscribe(profile => {
      this.userProfile = profile;
      if (profile) {
        this.editModel = { ...profile };
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing && this.userProfile) {
      this.editModel = { ...this.userProfile };
    }
  }

  async saveProfile() {
    if (!this.userProfile) return;
    this.isSaving = true;
    try {
      await this.authService.updateProfile(this.editModel);
      this.isEditing = false;
      this.saveSuccess = true;
      setTimeout(() => this.saveSuccess = false, 3000);
    } catch (e) {
      console.error('Error saving profile:', e);
    } finally {
      this.isSaving = false;
    }
  }

  onFileSelected(_event: any) {}

  triggerFileInput() {}
}
