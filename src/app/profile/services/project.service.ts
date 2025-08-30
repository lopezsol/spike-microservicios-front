import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Project } from '../../shared/interfaces/project.interface';

const baseUserUrl = environment.baseProjectUrl;

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  http = inject(HttpClient);

  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${baseUserUrl}/projects`);
  }
}
