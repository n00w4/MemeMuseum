import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MemeCardComponent } from '../memes/meme-card/meme-card';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';
import {
  MemeService,
  GetMemesResponse,
} from '../memes/services/meme.service';
import { Meme } from '../../shared/models/meme.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MemeCardComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly memeService = inject(MemeService);
  authSubscription: Subscription | undefined;

  memes = signal<Meme[]>([]);
  tags = signal<string[]>([]);
  isLoading = signal(true);
  isLoggedIn = signal(false);

  currentPage = signal(1);
  itemsPerPage = signal(10);
  totalItems = signal(0);
  totalPages = signal(1);
  pageNumbers = signal<number[]>([]);

  showAdvancedFilters = signal(false);

  searchForm: FormGroup;
  advancedFiltersForm: FormGroup;

  constructor(private readonly fb: FormBuilder) {
    this.searchForm = this.fb.group({
      tags: [''],
    });

    this.advancedFiltersForm = this.fb.group({
      dateRange: this.fb.group({
        start: [''],
        end: [''],
      }),
      sortBy: ['ratingDesc'],
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.loadMemes();

    this.authSubscription = this.authService.authState$.subscribe({
      next: (authenticated: boolean | null) => {
        if (authenticated !== null) {
          this.isLoggedIn.set(authenticated);
        }
      },
      error: (error) => {
        console.error(
          "Errore nell'osservazione dello stato auth nel HomeComponent:",
          error
        );
        this.isLoggedIn.set(false);
      },
    });
  }

  loadMemes() {
    this.isLoading.set(true);

    const { dateRange, sortBy } = this.advancedFiltersForm.value;
    const searchTags = this.searchForm.value.tags;

    this.memeService
      .getMemes(
        this.currentPage(),
        this.itemsPerPage(),
        searchTags,
        sortBy,
        dateRange
      )
      .subscribe({
        next: (response: GetMemesResponse) => {
          
          if (Array.isArray(response?.memes)) {
            this.memes.set(response.memes);
          } else {
            console.warn(
              'API response memes is not an array:',
              response?.memes
            );
            
            this.memes.set([]);
          }
          
          this.totalItems.set(response?.totalItems ?? 0);
          this.totalPages.set(response?.totalPages ?? 0);
          this.generatePageNumbers();
          this.isLoading.set(false);
        },
        error: (error: any) => {
          console.error('Errore nel caricamento dei meme nel HomeComponent:', error);

          if (error instanceof Error) {
            console.error('Messaggio di errore dal servizio:', error.message);
          }
          
          this.memes.set([]);
          this.totalItems.set(0);
          this.totalPages.set(0);
          this.generatePageNumbers(); 
          this.isLoading.set(false);
          
        },
      });
  }

  private generatePageNumbers() {
    const pages = [];
    const total = this.totalPages();
    const current = this.currentPage();

    pages.push(1);

    const start = Math.max(2, current - 2);
    const end = Math.min(total - 1, current + 2);

    if (start > 2) pages.push(-1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < total - 1) pages.push(-1);

    if (total > 1) pages.push(total);

    this.pageNumbers.set(pages);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadMemes();
  }

  toggleAdvancedFilters() {
    this.showAdvancedFilters.update((value) => !value);
  }

  applyFilters() {
    this.currentPage.set(1);
    this.loadMemes();
  }

  resetFilters() {
    this.searchForm.reset({ tags: '' });
    this.advancedFiltersForm.reset({
      dateRange: { start: '', end: '' },
      sortBy: 'ratingDesc',
    });
    this.applyFilters();
  }
}
