import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MiembroEquipo } from '../interfaces/models/MiembroEquipo.interface';
import { MiembroEquipoRequest } from '../interfaces/requests/MiembroEquipoRequest.interface';
import { RespuestaEquipoMantenimiento } from '../interfaces/responses/RespuestaMantenimiento.interface';

@Injectable({
  providedIn: 'root'
})
export class EquipoService {

  private apiUrl = environment.apiUrl;
  private controller = 'Equipo';

  constructor(private http: HttpClient) { }

  listar(): Observable<MiembroEquipo[]> {
    return this.http.get<MiembroEquipo[]>(`${this.apiUrl}/${this.controller}/Listar`);
  }

  mantenimiento(data: MiembroEquipoRequest): Observable<RespuestaEquipoMantenimiento> {
    return this.http.post<RespuestaEquipoMantenimiento>(`${this.apiUrl}/${this.controller}/Mantenimiento`, data);
  }
}
