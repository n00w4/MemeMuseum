import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meme } from '../../../shared/models/meme.model';

@Component({
  selector: 'app-meme-card',
  standalone: true,
  imports: [CommonModule],
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
}