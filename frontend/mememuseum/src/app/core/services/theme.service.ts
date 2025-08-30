import { Injectable } from '@angular/core';

export type Theme = 'dark' | 'light' | 'paranoid';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private activeTheme: Theme = 'dark';

  setTheme(theme: Theme) {
    this.activeTheme = theme;
    document.body.className = `theme-${theme}`;
    localStorage.setItem('theme', theme);
  }

  loadTheme() {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const theme = savedTheme ?? 'dark';
    this.setTheme(theme);
  }

  getActiveTheme(): Theme {
    return this.activeTheme;
  }
}