import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { Meme } from '../../../shared/models/meme.model';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { MemeComment } from '../../../shared/models/comment.model';
import { CommentService } from './comment.service';

export interface GetMemesResponse {
  memes: Meme[];
  totalItems: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root',
})
export class MemeService {
  private readonly commentService = inject(CommentService);

  constructor(private readonly http: HttpClient) {}

  getCommentsForMemes(
    memeIds: number[]
  ): Observable<{ [memeId: number]: MemeComment[] }> {
    if (memeIds.length === 0) {
      return of({});
    }

    const commentRequests$ = memeIds.map((id) =>
      this.commentService.getComments(id).pipe(
        catchError((error) => {
          console.error(`Error fetching comments for meme ${id}:`, error);
          return of([]);
        })
      )
    );

    return forkJoin(commentRequests$).pipe(
      map((commentsArrays: MemeComment[][]) => {
        const commentsMap: { [memeId: number]: MemeComment[] } = {};
        memeIds.forEach((memeId, index) => {
          commentsMap[memeId] = commentsArrays[index];
        });
        return commentsMap;
      })
    );
  }

  getMemes(
    page: number,
    itemsPerPage: number,
    tags?: string,
    sortBy?: string,
    dateRange?: { start?: string; end?: string }
  ): Observable<GetMemesResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', itemsPerPage.toString());

    if (tags) {
      params = params.set('tags', tags);
    }

    if (sortBy) {
      params = params.set('sortBy', sortBy);
    }

    if (dateRange?.start) {
      params = params.set('startDate', dateRange.start);
    }

    if (dateRange?.end) {
      params = params.set('endDate', dateRange.end);
    }

    return this.http
      .get<ApiResponse<GetMemesResponse>>(`${environment.apiMemeUrl}`, { params })
      .pipe(
        map((response) => response.data),
        switchMap((memesResponse) => {
          const memeIds = memesResponse.memes.map((m) => m.id);

          return this.getCommentsForMemes(memeIds).pipe(
            map((commentsMap) => {
              const memesWithComments = memesResponse.memes.map((meme) => ({
                ...meme,
                commentsCount: (commentsMap[meme.id] || []).length,
              }));
              return { ...memesResponse, memes: memesWithComments };
            })
          );
        }),
        catchError((error) => {
          console.error('HTTP Error in MemeService:', error);
          return of({ memes: [], totalItems: 0, totalPages: 0 });
        })
      );
  }
}
