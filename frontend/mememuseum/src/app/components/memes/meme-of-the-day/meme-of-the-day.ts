import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemeCardComponent } from '../meme-card/meme-card';
import { MemeService } from '../services/meme.service';
import { Meme } from '../../../shared/models/meme.model';
import { ToastService } from '../../../core/services/toast.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-meme-of-the-day',
  standalone: true,
  imports: [CommonModule, MemeCardComponent],
  templateUrl: './meme-of-the-day.html',
  styleUrls: ['./meme-of-the-day.scss']
})
export class MemeOfTheDayComponent implements OnInit {
  private readonly memeService = inject(MemeService);
  private readonly toastService = inject(ToastService);
  private readonly userService = inject(UserService);

  meme = signal<Meme | null>(null);
  isLoading = signal<boolean>(true);
  isLoggedIn = signal<boolean>(false);
  error = signal<string | null>(null);

  hasMeme = computed(() => !!this.meme());

  ngOnInit(): void {
    this.isLoggedIn.set(!!this.userService.getCurrentUserId());

    this.loadMemeOfTheDay();
  }

  loadMemeOfTheDay(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.meme.set(null);

    this.memeService.getMemeOfTheDay().subscribe({
      next: (memeFromApi) => {
        if (this.meme) {
          this.meme.set(memeFromApi);
        } else {
          this.error.set('No meme found for today.');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching meme of the day:', err);
        this.error.set('Failed to load the Meme Of The Day. Please try again later.');
        this.isLoading.set(false);
        this.toastService.showError('Could not load Meme Of The Day.');
      }
    });
  }
}
