import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import { Meme } from '../../../shared/models/meme.model';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';

export interface GetMemesResponse {
  memes: Meme[];
  totalItems: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root',
})
export class MemeService {
  private readonly baseUrl = `${environment.apiBaseUrl}/memes`;

  constructor(private readonly http: HttpClient) {}

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
      .get<ApiResponse<GetMemesResponse>>(this.baseUrl, { params })
      .pipe(
        map((response) => {
          if (
            response &&
            typeof response.status === 'number' &&
            response.status === 200 &&
            response.data
          ) {
            const responseData = response.data;

            const processedMemes: Meme[] = responseData.memes.map((meme) => {
              let uploadDate: Date;
              if (typeof meme.uploadDate === 'string') {
                uploadDate = new Date(meme.uploadDate);
              } else {
                uploadDate = meme.uploadDate;
              }

              return {
                ...meme,
                imageUrl: meme.imageUrl,
                uploadDate: uploadDate,
              };
            });

            return {
              memes: processedMemes,
              totalItems: responseData.totalItems,
              totalPages: responseData.totalPages,
            };
          } else {
            console.error('API response structure unexpected:', response);
            throw new Error(
              `API Error: ${response?.message || 'Unknown error'}`
            );
          }
        }),
        catchError((error) => {
          console.error('HTTP Error in MemeService:', error);

          throw error;
        })
      );
  }
}
