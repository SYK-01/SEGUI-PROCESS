import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Ticket } from '../interfaces/models/Ticket.interface';
import { TicketMantenimientoRequest } from '../interfaces/requests/TicketMantenimientoRequest.interface';
import { MoverEstadoTicketRequest } from '../interfaces/requests/MoverEstadoTicketRequest.interface';
import { RespuestaTicketMantenimiento, RespuestaMantenimiento } from '../interfaces/responses/RespuestaMantenimiento.interface';

@Injectable({
  providedIn: 'root'
})
export class TicketsService {

  private apiUrl = environment.apiUrl;
  private controller = 'Tickets';

  constructor(private http: HttpClient) { }

  listar(codSistema?: number | null, codResponsable?: number | null, tipo?: string | null): Observable<Ticket[]> {
    let params = new HttpParams();
    if (codSistema)     params = params.set('Cod_Sistema', codSistema);
    if (codResponsable) params = params.set('Cod_Responsable', codResponsable);
    if (tipo)            params = params.set('Tipo', tipo);

    return this.http.get<Ticket[]>(`${this.apiUrl}/${this.controller}/Listar`, { params });
  }

  obtener(numTicket: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${this.controller}/Obtener/${numTicket}`);
  }

  mantenimiento(data: TicketMantenimientoRequest): Observable<RespuestaTicketMantenimiento> {
    return this.http.post<RespuestaTicketMantenimiento>(`${this.apiUrl}/${this.controller}/Mantenimiento`, data);
  }

  moverEstado(data: MoverEstadoTicketRequest): Observable<RespuestaMantenimiento> {
    return this.http.post<RespuestaMantenimiento>(`${this.apiUrl}/${this.controller}/MoverEstado`, data);
  }
}
