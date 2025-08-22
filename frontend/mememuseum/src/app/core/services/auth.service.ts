import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UserService } from './user.service';

interface LoginRequest {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authStateSubject = new BehaviorSubject<boolean | null>(null);
  public authState$ = this.authStateSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly userService: UserService
  ) {
    this.checkAuthStatusOnInit();
  }

  public getCurrentAuthState(): boolean | null {
    return this.authStateSubject.value;
  }

  public isAuthenticated(force: boolean = false): Observable<boolean> {
    return this.http
      .get(`${environment.apiAuthUrl}/is-authenticated`, {
        withCredentials: true,
      })
      .pipe(
        map(() => {
          console.log('AuthService: isAuthenticated -> true');
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
          console.log('AuthService: Login successful');
        }),
        catchError((error) => throwError(() => this.handleLoginError(error)))
      );
  }

  public logout(): Observable<any> {
    return this.http
      .post(`${environment.apiAuthUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.authStateSubject.next(false);
          this.userService.clearCurrentUser();
        }),
        catchError((error) => {
          console.error('Error during logout: ', error);
          this.authStateSubject.next(false);
          this.userService.clearCurrentUser();
          return throwError(() => error);
        })
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
          console.error(
            "Initial authentication check error: ",
            error
          );
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
}
