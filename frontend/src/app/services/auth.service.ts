import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User
} from 'firebase/auth';
import { FirebaseService } from './firebase.service';
import { UserProfile } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  private apiUrl = 'http://localhost:8080/api/users';

  currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  userProfile$: Observable<UserProfile | null> = this.userProfileSubject.asObservable();
  isLoading = true;

  constructor(
    private firebase: FirebaseService,
    private router: Router,
    private ngZone: NgZone,
    private http: HttpClient
  ) {
    onAuthStateChanged(this.firebase.auth, async (user) => {
      this.currentUserSubject.next(user);
      if (user) {
        try {
          const profile = await this.fetchUserProfile();
          this.userProfileSubject.next(profile);
        } catch (e) {
          console.error('Error fetching profile from backend:', e);
        }
      } else {
        this.userProfileSubject.next(null);
      }
      this.isLoading = false;
    });
  }

  // ─── Email / Password Sign Up ────────────────────────────────────────

  async signUp(email: string, password: string, firstName: string, lastName: string): Promise<void> {
    const credential = await createUserWithEmailAndPassword(this.firebase.auth, email, password);
    
    const userProfile: UserProfile = {
      uid: credential.user.uid,
      email,
      firstName,
      lastName,
      role: 'admin'
    };

    // Sync to backend
    await firstValueFrom(this.http.post(`${this.apiUrl}/sync`, userProfile));
    
    this.userProfileSubject.next(userProfile);
    this.ngZone.run(() => this.router.navigate(['/intro']));
  }

  // ─── Email / Password Sign In ────────────────────────────────────────

  async signIn(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.firebase.auth, email, password);
    
    // Record login in backend
    await firstValueFrom(this.http.post(`${this.apiUrl}/login-event`, {}));
    
    const profile = await this.fetchUserProfile();
    this.userProfileSubject.next(profile);
    this.ngZone.run(() => this.router.navigate(['/intro']));
  }

  // ─── Google OAuth ────────────────────────────────────────────────────

  async signInWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(this.firebase.auth, provider);
    const user = credential.user;

    // Check if profile exists via backend
    let profile = await this.fetchUserProfile();
    
    if (!profile) {
      const names = (user.displayName || '').split(' ');
      profile = {
        uid: user.uid,
        email: user.email || '',
        firstName: names[0] || '',
        lastName: names.slice(1).join(' ') || '',
        role: 'admin'
      };
      await firstValueFrom(this.http.post(`${this.apiUrl}/sync`, profile));
    } else {
      await firstValueFrom(this.http.post(`${this.apiUrl}/login-event`, {}));
    }

    this.userProfileSubject.next(profile);
    this.ngZone.run(() => this.router.navigate(['/intro']));
  }

  // ─── Sign Out ────────────────────────────────────────────────────────

  async signOut(): Promise<void> {
    await signOut(this.firebase.auth);
    this.userProfileSubject.next(null);
    this.ngZone.run(() => this.router.navigate(['/sign-in']));
  }

  // ─── Helpers ─────────────────────────────────────────────────────────

  private async fetchUserProfile(): Promise<UserProfile | null> {
    try {
      return await firstValueFrom(this.http.get<UserProfile>(`${this.apiUrl}/me`));
    } catch (e) {
      return null;
    }
  }

  get isAuthenticated(): boolean { return this.currentUserSubject.value !== null; }
  get currentProfile(): UserProfile | null { return this.userProfileSubject.value; }
}
