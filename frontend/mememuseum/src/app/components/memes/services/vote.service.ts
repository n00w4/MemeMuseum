import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Vote } from '../../../shared/models/vote.model';

export interface VoteResponse {
  message: string;
  data?: Vote;
}

@Injectable({
  providedIn: 'root'
})
export class VoteService {
  private readonly http = inject(HttpClient);

  voteMeme(memeId: number, value: number, userId: number): Observable<VoteResponse> {
    return this.http.post<VoteResponse>(`${environment.apiMemeUrl}/${memeId}/vote`, {
      value,
      user_id: userId,
      meme_id: memeId
    });
  }

  removeVote(memeId: number, userId: number): Observable<VoteResponse> {
    return this.http.delete<VoteResponse>(
      `${environment.apiMemeUrl}/${memeId}/vote`,
      { 
        body: { user_id: userId, meme_id: memeId }
      }
    );
  }
}