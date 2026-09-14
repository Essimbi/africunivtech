import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, User } from '../models/models';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private tokenStorage = inject(TokenStorageService);
  private base = `${environment.apiUrl}/auth`;

  private currentUserSubject = new BehaviorSubject<User | null>(this.tokenStorage.getUser<User>());
  readonly currentUser$ = this.currentUserSubject.asObservable();

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.tokenStorage.getAccessToken() && !!this.currentUser;
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin' || this.currentUser?.role === 'superadmin';
  }

  get isSuperAdmin(): boolean {
    return this.currentUser?.role === 'superadmin';
  }

  register(payload: { email: string; password: string; firstName: string; lastName: string; phone?: string; company?: string }): Observable<{ success: boolean; data: AuthResponse }> {
    return this.http.post<{ success: boolean; data: AuthResponse }>(`${this.base}/register`, payload).pipe(
      tap((res) => this.setSession(res.data))
    );
  }

  login(email: string, password: string): Observable<{ success: boolean; data: AuthResponse }> {
    return this.http.post<{ success: boolean; data: AuthResponse }>(`${this.base}/login`, { email, password }).pipe(
      tap((res) => this.setSession(res.data))
    );
  }

  refresh(): Observable<{ success: boolean; data: AuthResponse }> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    return this.http.post<{ success: boolean; data: AuthResponse }>(`${this.base}/refresh`, { refreshToken }).pipe(
      tap((res) => this.setSession(res.data))
    );
  }

  forgotPassword(email: string): Observable<{ success: boolean; message: string; data?: { resetToken: string } }> {
    return this.http.post<{ success: boolean; message: string; data?: { resetToken: string } }>(`${this.base}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.base}/reset-password`, { token, newPassword });
  }

  updateProfile(payload: Partial<Pick<User, 'firstName' | 'lastName' | 'phone' | 'company'>>): Observable<{ success: boolean; data: User }> {
    return this.http.patch<{ success: boolean; data: User }>(`${this.base}/me`, payload).pipe(
      tap((res) => {
        this.currentUserSubject.next(res.data);
        this.tokenStorage.setUser(res.data);
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.base}/change-password`, { currentPassword, newPassword });
  }

  logout(): void {
    this.tokenStorage.clear();
    this.currentUserSubject.next(null);
  }

  private setSession(data: AuthResponse): void {
    this.tokenStorage.setTokens(data.accessToken, data.refreshToken);
    this.tokenStorage.setUser(data.user);
    this.currentUserSubject.next(data.user);
  }
}
