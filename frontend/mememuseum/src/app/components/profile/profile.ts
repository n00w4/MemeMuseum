import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { UserService } from '../../core/services/user.service';
import { User } from '../../shared/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  imports: [CommonModule, TitleCasePipe],
  styleUrls: ['./profile.scss'],
})
export class ProfileComponent implements OnInit {
  themes: Theme[] = ['dark', 'light', 'paranoid'];
  selectedTheme!: Theme;
  currentUser: User | null = null;
  isLoading = true;
  isLoggingOut = false;

  private readonly themeService: ThemeService = inject(ThemeService);
  private readonly userService: UserService = inject(UserService);
  private readonly authService: AuthService = inject(AuthService);
  private readonly router: Router = inject(Router);

  changeTheme(theme: Theme) {
    this.themeService.setTheme(theme);
  }

  ngOnInit(): void {
    this.selectedTheme = this.themeService.getActiveTheme();
    this.loadUserInfo();
  }

  private loadUserInfo(): void {
    this.currentUser = this.userService.getCurrentUser();
    this.isLoading = false;
  }

  logout(): void {
    this.isLoggingOut = true;
    this.authService.logout().subscribe({
      next: () => {
        this.isLoggingOut = false;
        this.clearAuthCookie();
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.isLoggingOut = false;
        this.clearAuthCookie();
        this.router.navigate(['/']);
      },
    });
  }

  private clearAuthCookie(): void {
    document.cookie =
      'sessionToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; sameSite=lax';
  }
}
