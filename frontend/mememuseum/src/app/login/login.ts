import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { LoginService } from './login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private readonly fb: FormBuilder, private readonly loginService: LoginService) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.loginService.login(this.loginForm.value)
      .subscribe({
        next: (response) => {
          this.successMessage = 'Logged in successfully!';
          console.log('Login response:', response);
          this.loading = false;
          // Esempio: localStorage.setItem('token', response.token);
        },
        error: (err) => {
          this.errorMessage = 'Check your credentials or try again later.';
          console.error(err);
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
  }
}

