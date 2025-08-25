import { Component, inject, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meme } from '../../../shared/models/meme.model';
import { VoteService } from '../services/vote.service';
import { UserService } from '../../../core/services/user.service';
import { FormsModule } from '@angular/forms';
import { CommentService } from '../services/comment.service';
import { MemeComment } from '../../../shared/models/comment.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-meme-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meme-card.html',
  styleUrls: ['./meme-card.scss']
})
export class MemeCardComponent {
  private readonly voteService = inject(VoteService);
  private readonly userService = inject(UserService);
  private readonly commentService = inject(CommentService);
  private readonly toastService = inject(ToastService); 
  
  @Input() meme!: Meme;
  @Input() isLoggedIn: boolean = false;
  

  userVote = signal<number>(0); // 0 = no vote, 1 = upvote, -1 = downvote
  isLoading = signal(false);

  comments = signal<MemeComment[]>([]);
  newComment = signal<string>('');
  isCommenting = signal<boolean>(false);
  showComments = signal<boolean>(false);
  commentsLoaded = signal<boolean>(false);
  commentLoadError = signal<string | null>(null);
  commentSubmitError = signal<string | null>(null);


  public ngOnInit() {
    if (this.meme.userVote !== undefined) {
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
        this.toastService.showSuccess('Vote recorded successfully.');
      },
      error: (err) => {
        console.error('Vote error:', err);
        this.isLoading.set(false);
        this.toastService.showError('Failed to record vote. Please try again.');
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
        this.toastService.showSuccess('Vote removed successfully.');
      },
      error: (err) => {
        console.error('Remove vote error:', err);
        this.isLoading.set(false);
        this.toastService.showError('Failed to remove vote. Please try again.');
      }
    });
  }

  public isUpvoteActive(): boolean {
    return this.userVote() === 1;
  }

  public isDownvoteActive(): boolean {
    return this.userVote() === -1;
  }

  toggleComments() {
    const show = !this.showComments();
    this.showComments.set(show);
    if (show && !this.commentsLoaded() && !this.commentLoadError()) {
      this.loadComments();
    }
  }

  loadComments() {
    // Clear any previous load error before attempting again
    this.commentLoadError.set(null);
    this.commentService.getComments(this.meme.id).subscribe({
      next: (fetchedComments) => {
        this.comments.set(fetchedComments);
        this.commentsLoaded.set(true);
        this.commentLoadError.set(null);
      },
      error: (err) => {
        console.error('Error loading comments for meme', this.meme.id, err);
        let errorMessage = 'Could not load comments.';
        if (err.status === 404) {
            errorMessage = 'Comments not found.';
        } else if (err.status >= 500) {
            errorMessage = 'Server error loading comments.';
        }
        this.commentLoadError.set(errorMessage);
      }
    });
  }


  submitComment() {
    const content = this.newComment().trim();
    if (!content || !this.isLoggedIn) {
      return;
    }

    const userId = this.userService.getCurrentUserId();
    if (!userId) {
      console.error('User ID not found for comment submission.');
      this.commentSubmitError.set('Authentication error. Please refresh the page.');
      return;
    }

    this.isCommenting.set(true);
    this.commentSubmitError.set(null);

    this.commentService.createComment({ user_id: userId, meme_id: this.meme.id, content }).subscribe({
      next: (response) => {
        console.log('Comment created successfully:', response);
        if (response.data) {
            this.comments.update(comments => [...comments, response.data]);
        } else {
             // Handle case where backend doesn't return the comment object
             console.warn('Backend did not return the created comment object. Reloading comments...');
             // Fallback: reload comments
             this.commentsLoaded.set(false);
             this.loadComments();
        }
        this.newComment.set('');
        this.isCommenting.set(false);
        this.commentSubmitError.set(null);
        this.toastService.showSuccess('Comment posted successfully.');
      },
      error: (err) => {
        console.error('Error submitting comment:', err);
        let errorMessage = 'Failed to post comment.';
        if (err.status === 400) {
            if (err.error?.message) {
                errorMessage = `Invalid comment: ${err.error.message}`;
            } else {
                 errorMessage = 'Invalid comment data.';
            }
        } else if (err.status === 401 || err.status === 403) {
            errorMessage = 'You must be logged in to comment.';
        } else if (err.status >= 500) {
            errorMessage = 'Server error. Could not post comment.';
        }
        this.commentSubmitError.set(errorMessage);
        this.isCommenting.set(false);
        this.toastService.showError("Failed to post comment. Please try again.");
      }
    });
  }
}