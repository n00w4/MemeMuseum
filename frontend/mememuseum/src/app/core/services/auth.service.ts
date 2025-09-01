import { inject, Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UserService } from './user.service';

interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnInit {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly userService: UserService = inject(UserService);

  private readonly authStateSubject = new BehaviorSubject<boolean | null>(null);
  public authState$ = this.authStateSubject.asObservable();

  ngOnInit(): void {
    this.checkAuthStatusOnInit();
  }

  public getCurrentAuthState(): boolean | null {
    return this.authStateSubject.value;
  }

  public isAuthenticated(force: boolean = false): Observable<boolean> {
    const hasSessionToken = document.cookie.includes('sessionToken');
    if (!hasSessionToken && !force) {
      this.authStateSubject.next(false);
      return of(false);
    }

    return this.http
      .get(`${environment.apiAuthUrl}/is-authenticated`, {
        withCredentials: true,
      })
      .pipe(
        map(() => {
          this.authStateSubject.next(true);
          return true;
        }),
        catchError(() => {
          this.authStateSubject.next(false);
          return of(false);
        })
      );
  }

  public getCsrfToken(): Observable<void> {
    return this.http
      .get(`${environment.apiAuthUrl}/csrf-token`, {
        withCredentials: true,
      })
      .pipe(
        map(() => {
          console.log('CSRF token obtained');
        }),
        catchError((error) => {
          console.error('Error getting CSRF token:', error);
          return of(undefined);
        })
      );
  }

  public refreshAuthStatus(): Observable<boolean> {
    return this.isAuthenticated(true);
  }

  public login(credentials: LoginRequest): Observable<void> {
    return this.http
      .post(`${environment.apiAuthUrl}/login`, credentials, {
        withCredentials: true,
      })
      .pipe(
        switchMap(() => this.getCsrfToken()),
        switchMap(() => this.userService.loadCurrentUser()),
        map(() => {}),
        tap(() => {
          this.authStateSubject.next(true);
        }),
        catchError((error) => throwError(() => this.handleLoginError(error)))
      );
  }

  private checkAuthStatusOnInit(): void {
    if (this.authStateSubject.value !== null) return;

    this.getCsrfToken()
      .pipe(switchMap(() => this.isAuthenticated()))
      .subscribe({
        next: (authenticated) => {
          this.authStateSubject.next(authenticated);
          if (authenticated) {
            this.userService.loadCurrentUser().subscribe();
          }
        },
        error: (error) => {
          console.error('Initial authentication check error: ', error);
          this.authStateSubject.next(false);
        },
      });
  }

  private handleLoginError(error: HttpErrorResponse): string {
    this.authStateSubject.next(false);
    switch (error.status) {
      case 401:
        return 'Invalid credentials';
      case 403:
        return 'Access denied';
      case 404:
        return 'Endpoint not found';
      case 0:
        return 'Connection error';
      case 500:
        return 'Internal Server Error';
      default:
        return `Error ${error.status}: ${error.message}`;
    }
  }

  public logout(): Observable<void> {
    return this.http
      .post(`${environment.apiAuthUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          console.log('AuthService: Logout successful');
          this.authStateSubject.next(false);
          this.userService.clearCurrentUser();
        }),
        map(() => {}),
        catchError((error) => {
          console.error('AuthService: Logout error:', error);
          this.authStateSubject.next(false);
          this.userService.clearCurrentUser();
          return of();
        })
      );
  }

  public register(credentials: RegisterRequest): Observable<void> {
    return this.http
      .post(`${environment.apiAuthUrl}/register`, credentials, {
        withCredentials: true,
      })
      .pipe(
        map(() => {
          console.log('Registration successful');
        }),
        catchError((error) =>
          throwError(() => this.handleRegistrationError(error))
        )
      );
  }

  private handleRegistrationError(error: HttpErrorResponse): string {
    switch (error.status) {
      case 400:
        return 'Invalid registration data';
      case 409:
        return 'Username or email already exists';
      case 500:
        return 'Internal server error during registration';
      case 0:
        return 'Connection error';
      default:
        return `Registration error: ${error.message}`;
    }
  }
}
