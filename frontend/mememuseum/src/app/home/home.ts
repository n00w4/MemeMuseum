import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MemeCardComponent } from './meme-card/meme-card';

export interface Meme {
  id: string;
  title: string;
  imageUrl: string;
  uploadDate: Date;
  upvotes: number;
  downvotes: number;
  tags: string[];
  uploader: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MemeCardComponent
],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {
  // Simulated data signals
  memes = signal<Meme[]>([]);
  tags = signal<string[]>([]);
  isLoading = signal(true);
  isLoggedIn = signal(false);
  
  // Pagination
  currentPage = signal(1);
  itemsPerPage = signal(10);
  totalItems = signal(0);
  totalPages = signal(1);
  pageNumbers = signal<number[]>([]);

  filterForm: FormGroup;

  constructor(private readonly fb: FormBuilder) {
    this.filterForm = this.fb.group({
      tags: [''],
      sortBy: ['ratingDesc'],
      dateRange: this.fb.group({
        start: [''],
        end: ['']
      })
    });
  }

  ngOnInit() {
    // Simulated authentication state
    this.isLoggedIn.set(!!localStorage.getItem('meme_token'));
    
    // Initialize with mock data
    this.generateMockTags();
    this.loadMemes();
  }

  private generateMockMemes(): Meme[] {
    const mockTitles = [
      'React be like', 'When the code works', 'Debugging in production',
      'How it started vs how it\'s going', 'Git push --force', 'NaN NaN NaN Batman!',
      'Waterfall vs Agile', 'Stack Overflow saves the day'
    ];
    
    const mockTags = ['Programming', 'Cats', 'Web', 'Algorithms', 'Funny', 'DevOps', 'Frontend'];
    
    return Array.from({ length: 25 }, (_, i) => {
      const tagCount = Math.floor(Math.random() * 3) + 1;
      const selectedTags = new Set<string>();
      while(selectedTags.size < tagCount) {
        selectedTags.add(mockTags[Math.floor(Math.random() * mockTags.length)]);
      }
      
      return {
        id: `meme-${i + 1}`,
        title: mockTitles[Math.floor(Math.random() * mockTitles.length)],
        imageUrl: `https://picsum.photos/300/200?random=${i}`,
        uploadDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        upvotes: Math.floor(Math.random() * 500),
        downvotes: Math.floor(Math.random() * 50),
        tags: Array.from(selectedTags),
        uploader: `user${Math.floor(Math.random() * 50)}`
      };
    });
  }

  private generateMockTags() {
    this.tags.set([
      'Programming', 'Web Technologies', 'Algorithms', 
      'Cats', 'Dogs', 'Funny', 'DevOps', 'Frontend',
      'Backend', 'Database', 'Cloud', 'AI', 'Gaming'
    ]);
  }

  loadMemes() {
    this.isLoading.set(true);
    
    // Simulate API delay
    setTimeout(() => {
      const allMemes = this.generateMockMemes();
      const filtered = this.applyFiltersToMock(allMemes);
      
      this.totalItems.set(filtered.length);
      this.totalPages.set(Math.ceil(filtered.length / this.itemsPerPage()));
      
      // Apply pagination
      const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
      this.memes.set(filtered.slice(startIndex, startIndex + this.itemsPerPage()));
      
      // Generate page numbers
      this.generatePageNumbers();
      
      this.isLoading.set(false);
    }, 800);
  }

  private generatePageNumbers() {
    const pages = [];
    const total = this.totalPages();
    const current = this.currentPage();
    
    // Always show first page
    pages.push(1);
    
    // Show current window of pages
    const start = Math.max(2, current - 2);
    const end = Math.min(total - 1, current + 2);
    
    if (start > 2) pages.push(-1); // Ellipsis
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (end < total - 1) pages.push(-1); // Ellipsis
    
    // Always show last page if different from first
    if (total > 1) pages.push(total);
    
    this.pageNumbers.set(pages);
  }

  private applyFiltersToMock(memes: Meme[]): Meme[] {
    const formValue = this.filterForm.value;
    let result = [...memes];
    
    // Tag filter
    if (formValue.tags) {
      const searchTags = formValue.tags.split(',').map((t: string) => t.trim().toLowerCase());
      if (searchTags.length > 0) {
        result = result.filter(meme => 
          meme.tags.some(tag => 
            searchTags.some((searchTag: string) => 
              tag.toLowerCase().includes(searchTag)
          )
        ));
      }
    }
    
    // Date filter
    if (formValue.dateRange.start || formValue.dateRange.end) {
      const startDate = formValue.dateRange.start ? new Date(formValue.dateRange.start) : null;
      const endDate = formValue.dateRange.end ? new Date(formValue.dateRange.end) : null;
      
      if (startDate || endDate) {
        result = result.filter(meme => {
          const memeDate = new Date(meme.uploadDate);
          return (
            (!startDate || memeDate >= startDate) && 
            (!endDate || memeDate <= endDate)
          );
        });
      }
    }
    
    // Sorting
    switch (formValue.sortBy) {
      case 'ratingDesc':
        result.sort((a, b) => 
          (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
        break;
      case 'ratingAsc':
        result.sort((a, b) => 
          (a.upvotes - a.downvotes) - (b.upvotes - b.downvotes));
        break;
      case 'dateDesc':
        result.sort((a, b) => 
          b.uploadDate.getTime() - a.uploadDate.getTime());
        break;
      case 'dateAsc':
        result.sort((a, b) => 
          a.uploadDate.getTime() - b.uploadDate.getTime());
        break;
    }
    
    return result;
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadMemes();
  }

  applyFilters() {
    this.currentPage.set(1);
    this.loadMemes();
  }

  resetFilters() {
    this.filterForm.reset({
      tags: '',
      sortBy: 'ratingDesc',
      dateRange: { start: '', end: '' }
    });
    this.applyFilters();
  }
}
