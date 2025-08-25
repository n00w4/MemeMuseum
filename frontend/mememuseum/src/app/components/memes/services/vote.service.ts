import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Vote } from '../../../shared/models/vote.model';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';

@Injectable({
  providedIn: 'root'
})
export class VoteService {
  private readonly http = inject(HttpClient);

  voteMeme(memeId: number, value: number, userId: number): Observable<ApiResponse<Vote>> {
    return this.http.post<ApiResponse<Vote>>(`${environment.apiMemeUrl}/${memeId}/vote`, {
      value,
      user_id: userId,
      meme_id: memeId
    });
  }

  removeVote(memeId: number, userId: number): Observable<ApiResponse<Vote>> {
    return this.http.delete<ApiResponse<Vote>>(
      `${environment.apiMemeUrl}/${memeId}/vote`,
      { 
        body: { user_id: userId, meme_id: memeId }
      }
    );
  }
}