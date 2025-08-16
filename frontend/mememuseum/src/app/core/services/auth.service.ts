import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface LoginRequest {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;

  private readonly authStateSubject = new BehaviorSubject<boolean | null>(null);
  public authState$ = this.authStateSubject.asObservable();

  constructor(private readonly http: HttpClient) {
    this.checkAuthStatusOnInit();
  }

  public refreshAuthStatus(): Observable<boolean> {
    return this.isAuthenticated(true);
  }

  login(credentials: LoginRequest): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/login`, credentials, { withCredentials: true })
      .pipe(
        switchMap(() => this.refreshAuthStatus()),
        tap((authenticated) => {
          console.log(
            'AuthService: Login completato, stato aggiornato a:',
            authenticated
          );
        }),
        catchError((error) => throwError(() => this.handleLoginError(error)))
      );
  }

  private checkAuthStatusOnInit(): void {
    if (this.authStateSubject.value !== null) return;

    this.isAuthenticated().subscribe({
      next: (authenticated) => {
        this.authStateSubject.next(authenticated);
      },
      error: (error) => {
        console.error("Errore nel check iniziale dell'autenticazione:", error);

        this.authStateSubject.next(false);
      },
    });
  }

  isAuthenticated(force: boolean = false): Observable<boolean> {
    return this.http
      .get(`${this.baseUrl}/is-authenticated`, { withCredentials: true })
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

  logout(): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          console.log('AuthService: Logout riuscito, stato impostato su false');
          this.authStateSubject.next(false);
        }),
        catchError((error) => {
          console.error('Errore durante il logout (API):', error);
          this.authStateSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  getCurrentAuthState(): boolean | null {
    return this.authStateSubject.value;
  }

  private handleLoginError(error: HttpErrorResponse): string {
    console.log('AuthService: Errore di login, stato impostato su false');
    this.authStateSubject.next(false);
    switch (error.status) {
      case 401:
        return 'Credenziali non valide';
      case 403:
        return 'Accesso negato';
      case 404:
        return 'Endpoint non trovato';
      case 0:
        return 'Errore di connessione';
      case 500:
        return 'Errore interno del server';
      default:
        return `Errore ${error.status}: ${error.message}`;
    }
  }
}
