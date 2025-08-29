import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { User } from '../interfaces/user.interface';
import { Observable } from 'rxjs';

const baseUserUrl = environment.baseUserUrl;

@Injectable({
  providedIn: 'root',
})
export class UserService {
  http = inject(HttpClient);

  updateUser(user: User, id: number): Observable<User> {
    return this.http.put<User>(`${baseUserUrl}/users/${id}`, user);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${baseUserUrl}/users/${id}`);
  }

}

//idProvince
//idLocality
