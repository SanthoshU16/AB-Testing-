import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { UserProfile } from '../../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userProfile: UserProfile | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.userProfile$.subscribe(profile => {
      this.userProfile = profile;
    });
  }
}
