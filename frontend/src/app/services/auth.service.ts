import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { FirebaseService } from './firebase.service';
import { UserProfile } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);

  /** Observable of the raw Firebase Auth user */
  currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  /** Observable of the full Firestore user profile */
  userProfile$: Observable<UserProfile | null> = this.userProfileSubject.asObservable();

  /** True while we're still waiting for the initial auth check */
  isLoading = true;

  constructor(
    private firebase: FirebaseService,
    private router: Router,
    private ngZone: NgZone
  ) {
    // Listen for auth state changes
    onAuthStateChanged(this.firebase.auth, async (user) => {
      this.currentUserSubject.next(user);

      if (user) {
        const profile = await this.fetchUserProfile(user.uid);
        this.userProfileSubject.next(profile);
      } else {
        this.userProfileSubject.next(null);
      }

      this.isLoading = false;
    });
  }

  // ─── Email / Password Sign Up ────────────────────────────────────────

  async signUp(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<void> {
    const credential = await createUserWithEmailAndPassword(
      this.firebase.auth,
      email,
      password
    );

    // Create the Firestore user document
    const userProfile: Omit<UserProfile, 'uid'> & { uid: string } = {
      uid: credential.user.uid,
      email,
      firstName,
      lastName,
      role: 'admin', // First user gets admin — adjust later
      createdAt: new Date(),
      lastLogin: new Date()
    };

    await setDoc(
      doc(this.firebase.firestore, 'users', credential.user.uid),
      {
        ...userProfile,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      }
    );

    this.userProfileSubject.next(userProfile);
    this.ngZone.run(() => this.router.navigate(['/admin']));
  }

  // ─── Email / Password Sign In ────────────────────────────────────────

  async signIn(email: string, password: string): Promise<void> {
    const credential = await signInWithEmailAndPassword(
      this.firebase.auth,
      email,
      password
    );

    // Update last login
    await updateDoc(
      doc(this.firebase.firestore, 'users', credential.user.uid),
      { lastLogin: serverTimestamp() }
    );

    const profile = await this.fetchUserProfile(credential.user.uid);
    this.userProfileSubject.next(profile);
    this.ngZone.run(() => this.router.navigate(['/admin']));
  }

  // ─── Google OAuth ────────────────────────────────────────────────────

  async signInWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(this.firebase.auth, provider);
    const user = credential.user;

    // Check if user doc exists — if not, create it
    const userDocRef = doc(this.firebase.firestore, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      const names = (user.displayName || '').split(' ');
      const newProfile: Omit<UserProfile, 'uid'> & { uid: string } = {
        uid: user.uid,
        email: user.email || '',
        firstName: names[0] || '',
        lastName: names.slice(1).join(' ') || '',
        role: 'admin',
        createdAt: new Date(),
        lastLogin: new Date()
      };

      await setDoc(userDocRef, {
        ...newProfile,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });

      this.userProfileSubject.next(newProfile);
    } else {
      await updateDoc(userDocRef, { lastLogin: serverTimestamp() });
      const profile = userDocSnap.data() as UserProfile;
      this.userProfileSubject.next(profile);
    }

    this.ngZone.run(() => this.router.navigate(['/admin']));
  }

  // ─── Sign Out ────────────────────────────────────────────────────────

  async signOut(): Promise<void> {
    await signOut(this.firebase.auth);
    this.userProfileSubject.next(null);
    this.ngZone.run(() => this.router.navigate(['/sign-in']));
  }

  // ─── Helpers ─────────────────────────────────────────────────────────

  get isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  get currentProfile(): UserProfile | null {
    return this.userProfileSubject.value;
  }

  private async fetchUserProfile(uid: string): Promise<UserProfile | null> {
    const userDocRef = doc(this.firebase.firestore, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      return userDocSnap.data() as UserProfile;
    }
    return null;
  }
}
