import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { User } from '../interfaces/user.interface';
import { Observable } from 'rxjs';
import { UserResponse } from '../interfaces/user-response.interface';

const baseUserUrl = environment.baseUserUrl;

@Injectable({
  providedIn: 'root',
})
export class UserService {
  http = inject(HttpClient);

  updateUser(user: User, id: number): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${baseUserUrl}/users/${id}`, user);
  }

  getUser(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${baseUserUrl}/users/${id}`);
  }

}
