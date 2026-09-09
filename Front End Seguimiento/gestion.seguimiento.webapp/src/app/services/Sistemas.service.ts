import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Sistema } from '../interfaces/models/Sistema.interface';

@Injectable({
  providedIn: 'root'
})
export class SistemasService {

  private apiUrl = environment.apiUrl;
  private controller = 'Sistemas';

  constructor(private http: HttpClient) { }

  listar(): Observable<Sistema[]> {
    return this.http.get<Sistema[]>(`${this.apiUrl}/${this.controller}/Listar`);
  }
}
