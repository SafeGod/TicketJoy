import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Event } from '../models/event.model';
import { PaginatedResponse } from '../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) { }

  /**
   * Obtener lista de eventos (paginados)
   */
  getEvents(params?: any): Observable<PaginatedResponse<Event>> {
    return this.http.get<PaginatedResponse<Event>>(this.apiUrl, { params });
  }

  /**
   * Obtener un evento específico por ID
   */
  getEvent(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear un nuevo evento
   */
  createEvent(eventData: any): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, eventData);
  }

  /**
   * Actualizar un evento existente
   */
  updateEvent(id: number, eventData: any): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${id}`, eventData);
  }

  /**
   * Eliminar un evento
   */
  deleteEvent(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Publicar un evento (cambiar estado a 'published')
   */
  publishEvent(id: number): Observable<Event> {
    return this.http.patch<Event>(`${this.apiUrl}/${id}/publish`, {});
  }

  /**
   * Cancelar un evento (cambiar estado a 'cancelled')
   */
  cancelEvent(id: number): Observable<Event> {
    return this.http.patch<Event>(`${this.apiUrl}/${id}/cancel`, {});
  }
}