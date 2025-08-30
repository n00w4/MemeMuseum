import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { ThemeService, Theme } from '../../core/services/theme.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  imports: [CommonModule,TitleCasePipe],
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {
  themes: Theme[] = ['dark', 'light', 'paranoid'];
  selectedTheme!: Theme;

  private readonly themeService: ThemeService = inject(ThemeService);

  changeTheme(theme: Theme) {
    this.themeService.setTheme(theme);
  }

  ngOnInit(): void {
    this.selectedTheme = this.themeService.getActiveTheme();
  }
}
