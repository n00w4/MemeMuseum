import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  private loginSubscription: Subscription | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.errorMessage = null;
    this.successMessage = null;
    if (
      this.loginForm.get('username')?.value ||
      this.loginForm.get('password')?.value
    ) {
      this.loginForm.reset();
    }
  }

  onSubmit() {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }

    this.loginSubscription = this.authService
      .login(this.loginForm.value)
      .subscribe({
        next: (authenticated) => {
          if (authenticated) {
            this.successMessage = 'Accesso effettuato con successo!';
            this.loading = false;
            this.redirectAfterLogin();
          } else {
            this.errorMessage =
              "Login riuscito, ma impossibile verificare l'autenticazione.";
            this.loading = false;
          }
        },
        error: (err) => {
          this.errorMessage = err || "Errore durante l'accesso.";
          this.loading = false;
        },
      });
  }

  private getReturnUrl(): string {
    const sessionUrl = sessionStorage.getItem('returnUrl');
    if (sessionUrl) {
      sessionStorage.removeItem('returnUrl');
      return sessionUrl;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get('returnUrl');
    if (returnUrl && this.isValidUrl(returnUrl)) {
      return returnUrl;
    }
    return '/home';
  }

  private isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url, window.location.origin);
      return parsed.origin === window.location.origin;
    } catch {
      return false;
    }
  }

  private redirectAfterLogin(): void {
    setTimeout(() => {
      const returnUrl = this.getReturnUrl();
      this.router.navigateByUrl(returnUrl).catch((error) => {
        console.error('Navigation error:', error);
        this.router.navigate(['/home']);
      });
    }, 1000);
  }

  logout() {
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
      this.loginSubscription = null;
    }
    this.authService.logout().subscribe({
      next: () => {
        this.loginForm.reset();
        this.successMessage = null;
        this.errorMessage = 'Sei stato disconnesso';
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = err.message || 'Errore durante il logout.';
      },
    });
  }

  ngOnDestroy(): void {
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
  }
}
