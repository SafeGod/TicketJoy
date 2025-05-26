import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EventCategory } from '../models/event-category.model';

@Injectable({
  providedIn: 'root'
})
export class EventCategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) { }

  /**
   * Obtener todas las categorías de eventos
   */
  getCategories(): Observable<EventCategory[]> {
    return this.http.get<EventCategory[]>(this.apiUrl);
  }

  /**
   * Obtener una categoría específica por ID
   */
  getCategory(id: number): Observable<EventCategory> {
    return this.http.get<EventCategory>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear una nueva categoría (solo admin)
   */
  createCategory(categoryData: Partial<EventCategory>): Observable<EventCategory> {
    return this.http.post<EventCategory>(this.apiUrl, categoryData);
  }

  /**
   * Actualizar una categoría existente (solo admin)
   */
  updateCategory(id: number, categoryData: Partial<EventCategory>): Observable<EventCategory> {
    return this.http.put<EventCategory>(`${this.apiUrl}/${id}`, categoryData);
  }

  /**
   * Eliminar una categoría (solo admin)
   */
  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}