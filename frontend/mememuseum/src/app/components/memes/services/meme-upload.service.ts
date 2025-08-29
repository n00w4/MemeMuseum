import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Meme } from '../../../shared/models/meme.model';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../shared/models/user.model';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MemeUploadService {
  private readonly http = inject(HttpClient);
  private readonly userService = inject(UserService);

  uploadMeme(title: string, imageFile: File, tags: string[] = []): Observable<ApiResponse<Meme>> {
    const currentUser: User | null = this.userService.getCurrentUser();
    
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('image', imageFile);
    formData.append('user_id', currentUser.id.toString());
    
    if (tags && tags.length > 0) {
      const validTags = tags
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      validTags.forEach(tag => {
        formData.append('tags', tag);
      });
    }

    return this.http.post<ApiResponse<Meme>>(`${environment.apiMemeUrl}`, formData).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Unknown error occurred';
        
        if (error.error instanceof ErrorEvent) {
          errorMessage = error.error.message;
        } else {
          errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}