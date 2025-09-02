import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Locality } from '../interfaces/locality.interface';
import { Province } from '../interfaces/province.interface';

const baseUrl = environment.baseGeorefUrl;
@Injectable({
  providedIn: 'root',
})
export class GeorefService {
  http = inject(HttpClient);

  getAllProvinces(): Observable<Province[]> {
    return this.http.get<Province[]>(`${baseUrl}/locations/provincias`);
  }

  getLocalitiesByProvinceId(id: number): Observable<Locality[]> {
    console.log('id provincia: ', id);
    return this.http.get<Locality[]>(
      `${baseUrl}/locations/provincias/${id}/localidades`
    );
  }
}
