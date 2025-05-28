import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Ticket } from '../models/ticket.model';
import { PaginatedResponse } from '../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = `${environment.apiUrl}/tickets`;

  constructor(private http: HttpClient) { }

  /**
   * Obtener lista de boletos del usuario actual (paginados)
   */
  getTickets(params?: any): Observable<PaginatedResponse<Ticket>> {
    return this.http.get<PaginatedResponse<Ticket>>(this.apiUrl, { params });
  }

  /**
   * Obtener un boleto específico por ID
   */
  getTicket(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`);
  }

  /**
   * Comprar/reservar boletos para un evento
   */
  purchaseTickets(ticketData: any): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, ticketData);
  }

  /**
   * Cancelar un boleto
   */
  cancelTicket(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/cancel`, {});
  }

  /**
   * Validar un boleto (para organizadores/staff)
   */
  validateTicket(id: number): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.apiUrl}/${id}/validate`, {});
  }

  /**
   * Verificar la validez de un boleto por su QR code
   */
  verifyTicket(qrCode: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verify`, { qr_code: qrCode });
  }
}