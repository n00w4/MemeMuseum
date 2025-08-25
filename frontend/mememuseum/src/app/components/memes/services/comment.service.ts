import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MemeComment } from '../../../shared/models/comment.model';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';

export interface CreateCommentRequest {
  user_id: number;
  meme_id: number;
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private readonly http = inject(HttpClient);

  createComment(commentData: CreateCommentRequest): Observable<ApiResponse<MemeComment>> {
    const url = `${environment.apiMemeUrl}/${commentData.meme_id}/create-comment`;
    return this.http.post<ApiResponse<MemeComment>>(url, commentData);
  }

  getComments(memeId: number): Observable<MemeComment[]> {
    const url = `${environment.apiMemeUrl}/${memeId}/comments`;
    return this.http.get<ApiResponse<MemeComment[]>>(url).pipe(
      map((response: ApiResponse<MemeComment[]>) => response.data)
    );
  }
}