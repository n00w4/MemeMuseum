import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  registerForm!: FormGroup;
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  private registerSubscription: Subscription | null = null;

  ngOnInit(): void {
    this.initializeForm();
    this.resetMessages();
  }

  private initializeForm(): void {
    this.registerForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  private resetMessages(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (
      this.registerForm &&
      (this.registerForm.get('username')?.value ||
        this.registerForm.get('email')?.value ||
        this.registerForm.get('password')?.value ||
        this.registerForm.get('confirmPassword')?.value)
    ) {
      this.registerForm.reset();
    }
  }

  private passwordMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      confirmPassword?.setErrors(null);
      return null;
    }
  }

  onSubmit() {
    if (this.registerForm.invalid) return;
    this.prepareForRegistration();

    if (this.registerSubscription) {
      this.registerSubscription.unsubscribe();
    }

    const registrationData = {
      username: this.registerForm.get('username')?.value,
      email: this.registerForm.get('email')?.value,
      password: this.registerForm.get('password')?.value,
    };

    this.registerSubscription = this.authService
      .register(registrationData)
      .subscribe({
        next: () => {
          this.onRegistrationSuccess();
        },
        error: (err) => {
          this.onRegistrationError(err);
        },
      });
  }

  private prepareForRegistration(): void {
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;
  }

  private onRegistrationSuccess(): void {
    this.successMessage = 'Registration successful! You can now login.';
    this.loading = false;

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2000);
  }

  private onRegistrationError(err: any): void {
    this.errorMessage = err || 'Error during registration. Please try again.';
    this.loading = false;
  }

  ngOnDestroy(): void {
    if (this.registerSubscription) {
      this.registerSubscription.unsubscribe();
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
