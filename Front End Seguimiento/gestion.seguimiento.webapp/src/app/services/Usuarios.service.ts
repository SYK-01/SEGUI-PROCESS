import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario } from '../interfaces/models/Usuario.interface';
import { UsuarioMantenimientoRequest } from '../interfaces/requests/UsuarioMantenimientoRequest.interface';
import { RespuestaUsuarioMantenimiento } from '../interfaces/responses/RespuestaMantenimiento.interface';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private apiUrl = environment.apiUrl;
  private controller = 'Usuarios';

  constructor(private http: HttpClient) { }

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/${this.controller}/Listar`);
  }

  mantenimiento(data: UsuarioMantenimientoRequest): Observable<RespuestaUsuarioMantenimiento> {
    return this.http.post<RespuestaUsuarioMantenimiento>(`${this.apiUrl}/${this.controller}/Mantenimiento`, data);
  }
}
