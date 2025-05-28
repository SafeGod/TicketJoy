import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
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
    return this.http.get<PaginatedResponse<Event>>(this.apiUrl, { params })
      .pipe(
        retry(1), // Retry once in case of network error
        catchError(this.handleError)
      );
  }

  /**
   * Obtener un evento específico por ID
   */
  getEvent(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Crear un nuevo evento
   */
  createEvent(eventData: any): Observable<Event> {
    // Asegurar que las fechas estén en formato correcto
    const formattedData = {
      ...eventData,
      start_date: this.formatDateTime(eventData.start_date),
      end_date: this.formatDateTime(eventData.end_date)
    };

    return this.http.post<Event>(this.apiUrl, formattedData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Actualizar un evento existente
   */
  updateEvent(id: number, eventData: any): Observable<Event> {
    // Asegurar que las fechas estén en formato correcto
    const formattedData = {
      ...eventData,
      start_date: eventData.start_date ? this.formatDateTime(eventData.start_date) : undefined,
      end_date: eventData.end_date ? this.formatDateTime(eventData.end_date) : undefined
    };

    return this.http.put<Event>(`${this.apiUrl}/${id}`, formattedData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Eliminar un evento
   */
  deleteEvent(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Publicar un evento (cambiar estado a 'published')
   */
  publishEvent(id: number): Observable<Event> {
    return this.http.patch<Event>(`${this.apiUrl}/${id}/publish`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Cancelar un evento (cambiar estado a 'cancelled')
   */
  cancelEvent(id: number): Observable<Event> {
    return this.http.patch<Event>(`${this.apiUrl}/${id}/cancel`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Formatear fecha y hora para el backend
   */
  private formatDateTime(dateTime: string): string {
    if (!dateTime) return '';
    
    // Asegurar que la fecha esté en formato MySQL datetime
    const date = new Date(dateTime);
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }

  /**
   * Manejar errores HTTP
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Ha ocurrido un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.status === 0) {
        errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
      } else if (error.status === 400) {
        errorMessage = error.error.message || 'Datos inválidos enviados al servidor.';
      } else if (error.status === 401) {
        errorMessage = 'No tienes autorización para realizar esta acción.';
      } else if (error.status === 403) {
        errorMessage = 'No tienes permisos para acceder a este recurso.';
      } else if (error.status === 404) {
        errorMessage = 'El recurso solicitado no fue encontrado.';
      } else if (error.status === 422) {
        // Errores de validación
        if (error.error.errors) {
          const validationErrors = error.error.errors;
          const errorMessages = Object.keys(validationErrors).map(key => validationErrors[key][0]);
          errorMessage = errorMessages.join(', ');
        } else {
          errorMessage = error.error.message || 'Datos de entrada inválidos.';
        }
      } else if (error.status >= 500) {
        errorMessage = 'Error interno del servidor. Por favor, intenta más tarde.';
      } else {
        errorMessage = error.error.message || `Error del servidor: ${error.status}`;
      }
    }

    console.error('EventService Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}