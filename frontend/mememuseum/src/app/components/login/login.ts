import { Component, OnInit, OnDestroy, inject } from '@angular/core';
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
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loginForm!: FormGroup;
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  private loginSubscription: Subscription | null = null;

  ngOnInit(): void {
    this.initializeForm();
    this.resetFormIfNeeded();
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
    this.resetMessages();
  }

  private resetMessages(): void {
    this.errorMessage = null;
    this.successMessage = null;
  }

  private resetFormIfNeeded(): void {
    if (
      this.loginForm.get('username')?.value ||
      this.loginForm.get('password')?.value
    ) {
      this.loginForm.reset();
    }
  }

  onSubmit() {
    if (this.loginForm.invalid) return;
    this.prepareForLogin();

    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }

    this.loginSubscription = this.authService
      .login(this.loginForm.value)
      .subscribe({
        next: () => {
          this.onLoginSuccess();
        },
        error: (err) => {
          this.onLoginError(err);
        },
      });
  }

  private prepareForLogin(): void {
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;
  }

  private onLoginSuccess(): void {
    this.successMessage = 'Logged in successfully!';
    this.loading = false;
    this.redirectAfterLogin();
  }

  private onLoginError(err: any): void {
    this.errorMessage = err || "Error during login. Please try again.";
    this.loading = false;
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
    this.router
      .navigateByUrl(returnUrl)
      .then(() => {
        this.authService.refreshAuthStatus().subscribe();
      })
      .catch((error) => {
        console.error('Navigation error:', error);
        this.router.navigate(['/home']);
      });
  }, 1000);
}

  ngOnDestroy(): void {
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
  }
}
