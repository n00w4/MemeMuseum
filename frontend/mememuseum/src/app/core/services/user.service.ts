import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../../shared/models/user.model';
import { ApiResponse } from '../../shared/interfaces/api-response.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  public getCurrentUserId(): number | null {
    const user = this.getCurrentUser();
    return user ? user.id : null;
  }

  public loadCurrentUser(): Observable<User | null> {
    return this.http
      .get<ApiResponse<User>>(`${environment.apiUserUrl}/me`, { withCredentials: true })
      .pipe(
        map(response => response.data),
        tap((user) => {
          this.currentUserSubject.next(user);
        }),
        catchError((error) => {
          console.error('Error loading user: ', error);
          this.currentUserSubject.next(null);
          return of(null);
        })
      );
  }

  public clearCurrentUser(): void {
    this.currentUserSubject.next(null);
  }
}