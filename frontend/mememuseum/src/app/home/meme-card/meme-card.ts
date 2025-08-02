import { Component, Input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Meme } from '../home';

@Component({
  selector: 'app-meme-card',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './meme-card.html',
  styleUrls: ['./meme-card.scss']
})
export class MemeCardComponent {
  @Input() meme!: Meme;
  @Input() isLoggedIn: boolean = false;
  
  getRatingClass(rating: number): string {
    if (rating > 100) return 'high-rating';
    if (rating > 0) return 'medium-rating';
    return 'low-rating';
  }
  
  calculateRating(): number {
    return this.meme.upvotes - this.meme.downvotes;
  }
}