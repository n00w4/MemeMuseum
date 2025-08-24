import { Component, inject, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meme } from '../../../shared/models/meme.model';
import { VoteService } from '../services/vote.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-meme-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meme-card.html',
  styleUrls: ['./meme-card.scss']
})
export class MemeCardComponent {
  private readonly voteService = inject(VoteService);
  private readonly userService = inject(UserService);
  
  @Input() meme!: Meme;
  @Input() isLoggedIn: boolean = false;
  

  userVote = signal<number>(0); // 0 = no vote, 1 = upvote, -1 = downvote
  isLoading = signal(false);


  public ngOnInit() {
    if (this.meme.userVote !== undefined) {
      console.log('Setting user vote from meme data:', this.meme.userVote, 'for meme:', this.meme.id);
      this.userVote.set(this.meme.userVote);
    } 
    // Fallback
    else if (this.meme.Votes && this.meme.Votes.length > 0) {
      const currentUserId = this.userService.getCurrentUserId();
      if (currentUserId) {
        const userVote = this.meme.Votes.find(vote => vote.user_id === currentUserId);
        if (userVote) {
          this.userVote.set(userVote.value);
        }
      }
    }
    else {
      this.userVote.set(0);
    }
  }

  public getRatingClass(rating: number): string {
    if (rating > 100) return 'high-rating';
    if (rating > 0) return 'medium-rating';
    return 'low-rating';
  }

  public handleVote(value: number) {
    if (!this.isLoggedIn || this.isLoading()) {
      return;
    }

    const userId = this.userService.getCurrentUserId();
    if (!userId) {
      return;
    }

    const previousVote = this.userVote();
    
    if (previousVote === value) {
      this.removeVote(value, userId);
    } else {
      this.submitVote(value, userId);
    }
  }

  private submitVote(value: number, userId: number) {
    this.isLoading.set(true);
    
    this.voteService.voteMeme(this.meme.id, value, userId).subscribe({
      next: (res) => {
        this.userVote.set(value);
        const previousVote = this.userVote();

        if (previousVote === 1) this.meme.rating -= 1;
        if (previousVote === -1) this.meme.rating += 1;
        if (value === 1) this.meme.rating += 1;
        if (value === -1) this.meme.rating -= 1;
        
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Vote error:', err);
        this.isLoading.set(false);
      }
    });
  }

  private removeVote(previousValue: number, userId: number) {
    this.isLoading.set(true);
    
    this.voteService.removeVote(this.meme.id, userId).subscribe({
      next: (res) => {
        this.userVote.set(0);
        
        if (previousValue === 1) this.meme.rating -= 1;
        if (previousValue === -1) this.meme.rating += 1;
        
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Remove vote error:', err);
        this.isLoading.set(false);
      }
    });
  }

  public isUpvoteActive(): boolean {
    return this.userVote() === 1;
  }

  public isDownvoteActive(): boolean {
    return this.userVote() === -1;
  }
}