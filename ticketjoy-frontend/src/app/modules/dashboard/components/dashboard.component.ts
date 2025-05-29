import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { EventService } from '../../../core/services/event.service';
import { User } from '../../../core/models/user.model';
import { Event } from '../../../core/models/event.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  isLoading = true;
  isLoadingEvents = true;
  stats = {
    upcomingEvents: 0,
    myTickets: 0,
    myEvents: 0
  };
  
  // Real upcoming events from backend
  upcomingEvents: Event[] = [];
  
  // Mock recent tickets (you can replace this later with real ticket service)
  recentTickets = [
    {
      id: 101,
      eventTitle: 'Seminario de Liderazgo',
      ticketNumber: 'TJ-2025-10145',
      purchaseDate: '2025-04-28T10:30:00',
      status: 'confirmed'
    },
    {
      id: 102,
      eventTitle: 'Workshop de Diseño Gráfico',
      ticketNumber: 'TJ-2025-10892',
      purchaseDate: '2025-04-25T16:15:00',
      status: 'used'
    }
  ];

  constructor(
    public authService: AuthService,
    private eventService: EventService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.loadDashboardData();
    });
  }
  
  loadDashboardData(): void {
    this.isLoading = true;
    this.isLoadingEvents = true;
    
    // Load upcoming events (limit to first 3)
    this.eventService.getEvents({ limit: 3 })
      .pipe(
        finalize(() => {
          this.isLoadingEvents = false;
        })
      )
      .subscribe({
        next: (response) => {
          // Handle different response structures
          if (response && response.data && Array.isArray(response.data)) {
            // Laravel paginated response
            this.upcomingEvents = response.data.slice(0, 3);
            this.stats.upcomingEvents = response.meta?.total || response.data.length;
          } else if (Array.isArray(response)) {
            // Direct array response
            this.upcomingEvents = response.slice(0, 3);
            this.stats.upcomingEvents = response.length;
          } else {
            console.warn('Unexpected events response structure:', response);
            this.upcomingEvents = [];
            this.stats.upcomingEvents = 0;
          }
          
          // Finalize stats and loading
          this.finalizeStats();
        },
        error: (error) => {
          console.error('Error loading events for dashboard:', error);
          this.upcomingEvents = [];
          this.stats.upcomingEvents = 0;
          this.finalizeStats();
        }
      });
  }
  
  private finalizeStats(): void {
    // Set other stats (keeping mock data for now, replace with real services later)
    this.stats.myTickets = this.recentTickets.length;
    this.stats.myEvents = this.authService.hasRole('admin') ? 
      (this.authService.hasRole('organizer') ? Math.ceil(this.stats.upcomingEvents / 2) : this.stats.upcomingEvents) : 0;
    
    this.isLoading = false;
  }
  
  // Helper method to get available tickets safely
  getAvailableTickets(event: Event): number {
    return event.available_tickets ?? event.capacity ?? 0;
  }
  
  // Helper method to check if event has image
  getEventImage(event: Event): string {
    return event.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(event.title.split(' ')[0])}&background=random`;
  }
}