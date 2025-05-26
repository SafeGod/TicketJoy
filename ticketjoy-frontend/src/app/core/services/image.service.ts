import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private apiUrl = `${environment.apiUrl}/upload-image`;

  constructor(private http: HttpClient) { }

  /**
   * Subir una imagen al servidor
   */
  uploadImage(file: File): Observable<{url: string}> {
    const formData = new FormData();
    formData.append('image', file);
    
    return this.http.post<{url: string}>(this.apiUrl, formData);
  }
}