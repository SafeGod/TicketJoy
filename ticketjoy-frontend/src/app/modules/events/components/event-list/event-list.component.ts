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
      }
    });
  }
  
  loadEvents(): void {
    this.isLoading = true;
    
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
          this.events = response.data;
          this.filteredEvents = [...this.events];
          
          // Update pagination info
          this.currentPage = response.meta.current_page;
          this.totalPages = response.meta.last_page;
          this.totalEvents = response.meta.total;
        },
        error: (error) => {
          console.error('Error loading events:', error);
        }
      });
  }
  
  // Método seguro para obtener available_tickets
  getAvailableTickets(event: Event): number {
    return event.available_tickets ?? 0;
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
    
    // Reload events with new filter
    this.loadEvents();
  }
  
  onSearch(event: any): void {
    this.searchTerm = event.target.value.toLowerCase();
    
    // Update URL with search term
    const queryParams: any = { search: this.searchTerm };
    if (this.selectedCategories.length === 1) {
      queryParams.category = this.selectedCategories[0];
    }
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
    
    // Reload events with new search
    this.loadEvents();
  }
  
  resetFilters(): void {
    this.selectedCategories = [];
    this.searchTerm = '';
    
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
    this.currentPage = page;
    this.loadEvents();
    
    // Scroll to top
    window.scrollTo(0, 0);
  }
}