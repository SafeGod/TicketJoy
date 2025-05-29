import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { EventService } from '../../../../core/services/event.service';
import { EventCategoryService } from '../../../../core/services/event-category.service';
import { Event } from '../../../../core/models/event.model';
import { EventCategory } from '../../../../core/models/event-category.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent implements OnInit {
  isLoading = true;
  isAdmin = false;
  events: Event[] = [];
  filteredEvents: Event[] = [];
  categories: EventCategory[] = [];
  
  selectedCategories: number[] = [];
  searchTerm = '';
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalEvents = 0;
  
  // Error handling
  error = '';
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private eventService: EventService,
    private categoryService: EventCategoryService
  ) { }

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole('admin');
    
    // Load categories first, then events
    this.loadCategories();
    
    // Check for query params (search, category)
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchTerm = params['search'];
      }
      
      if (params['category']) {
        const categoryId = parseInt(params['category'], 10);
        if (!isNaN(categoryId)) {
          this.selectedCategories = [categoryId];
        }
      }
      
      // After processing query params, load events
      this.loadEvents();
    });
  }
  
  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        // No mostrar error por categorías, no es crítico
      }
    });
  }
  
  loadEvents(): void {
    this.isLoading = true;
    this.error = '';
    
    // Prepare params for API request
    const params: any = {
      page: this.currentPage
    };
    
    if (this.searchTerm) {
      params.search = this.searchTerm;
    }
    
    if (this.selectedCategories.length === 1) {
      params.category = this.selectedCategories[0];
    }
    
    this.eventService.getEvents(params)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          // Manejar diferentes estructuras de respuesta
          if (response && response.data) {
            // Respuesta paginada de Laravel
            this.events = response.data;
            this.filteredEvents = [...this.events];
            
            // Update pagination info de manera segura
            if (response.meta) {
              this.currentPage = response.meta.current_page || 1;
              this.totalPages = response.meta.last_page || 1;
              this.totalEvents = response.meta.total || 0;
            } else {
              // Si no hay meta, asumir página única
              this.currentPage = 1;
              this.totalPages = 1;
              this.totalEvents = this.events.length;
            }
          } else if (Array.isArray(response)) {
            // Respuesta directa como array
            this.events = response;
            this.filteredEvents = [...this.events];
            this.currentPage = 1;
            this.totalPages = 1;
            this.totalEvents = this.events.length;
          } else {
            // Handle case where response doesn't have expected structure
            console.warn('Unexpected response structure:', response);
            this.events = [];
            this.filteredEvents = [];
            this.totalEvents = 0;
            this.totalPages = 1;
            this.currentPage = 1;
          }
        },
        error: (error) => {
          console.error('Error loading events:', error);
          this.events = [];
          this.filteredEvents = [];
          
          // Set appropriate error message
          if (error.status === 0) {
            this.error = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
          } else if (error.status >= 500) {
            this.error = 'Error interno del servidor. Por favor, intenta más tarde.';
          } else if (error.status === 404) {
            this.error = 'No se encontró el servicio de eventos.';
          } else {
            this.error = 'Error al cargar los eventos. Por favor, intenta de nuevo.';
          }
        }
      });
  }
  
  // Método seguro para obtener available_tickets
  getAvailableTickets(event: Event): number {
    return event.available_tickets ?? event.capacity ?? 0;
  }
  
  // Verifica si un evento está disponible para compra
  isEventAvailable(event: Event): boolean {
    return event.status === 'published' && this.getAvailableTickets(event) > 0;
  }
  
  // Obtiene el estado del evento en español
  getEventStatusLabel(status: string): string {
    switch (status) {
      case 'published': return 'Publicado';
      case 'draft': return 'Borrador';
      case 'cancelled': return 'Cancelado';
      case 'completed': return 'Finalizado';
      default: return 'Desconocido';
    }
  }
  
  toggleCategory(categoryId: number): void {
    const index = this.selectedCategories.indexOf(categoryId);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(categoryId);
    }
    
    // Update URL with selected category
    const queryParams: any = {};
    if (this.selectedCategories.length === 1) {
      queryParams.category = this.selectedCategories[0];
    }
    if (this.searchTerm) {
      queryParams.search = this.searchTerm;
    }
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
    
    // Reset to first page and reload events
    this.currentPage = 1;
    this.loadEvents();
  }
  
  onSearch(event: any): void {
    this.searchTerm = event.target.value.toLowerCase();
    
    // Update URL with search term
    const queryParams: any = {};
    if (this.searchTerm) {
      queryParams.search = this.searchTerm;
    }
    if (this.selectedCategories.length === 1) {
      queryParams.category = this.selectedCategories[0];
    }
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
    
    // Reset to first page and reload events
    this.currentPage = 1;
    this.loadEvents();
  }
  
  resetFilters(): void {
    this.selectedCategories = [];
    this.searchTerm = '';
    this.currentPage = 1;
    
    // Clear URL params
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
    
    // Reload events without filters
    this.loadEvents();
  }
  
  getCategoryById(id: number): EventCategory | undefined {
    return this.categories.find(cat => cat.id === id);
  }
  
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadEvents();
      
      // Scroll to top
      window.scrollTo(0, 0);
    }
  }
  
  // Método para recargar eventos
  refreshEvents(): void {
    this.loadEvents();
  }
}