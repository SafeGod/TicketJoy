import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { EventService } from '../../../../core/services/event.service';
import { Event } from '../../../../core/models/event.model';
import { TicketService } from '../../../../core/services/ticket.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit {
  eventId: number = 0;
  isLoading = true;
  isAdmin = false;
  ticketQuantity = 1;
  isPurchasing = false;
  purchaseError = '';
  event: Event | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private eventService: EventService,
    private ticketService: TicketService
  ) { }

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole('admin');
    this.eventId = +this.route.snapshot.paramMap.get('id')!;
    
    if (isNaN(this.eventId) || this.eventId <= 0) {
      this.router.navigate(['/events']);
      return;
    }
    
    this.loadEventDetails();
  }
  
  loadEventDetails(): void {
    this.isLoading = true;
    
    this.eventService.getEvent(this.eventId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (event) => {
          this.event = event;
          
          // Reset ticket quantity to 1 or max available
          this.ticketQuantity = 1;
          
          if (this.getAvailableTickets() < this.ticketQuantity) {
            this.ticketQuantity = Math.max(1, this.getAvailableTickets());
          }
        },
        error: (error) => {
          console.error('Error loading event details:', error);
          // If event not found or error, navigate back to events list
          if (error.status === 404) {
            this.router.navigate(['/events']);
          }
        }
      });
  }
  
  // Método seguro para obtener available_tickets
  getAvailableTickets(): number {
    return this.event?.available_tickets ?? 0;
  }
  
  // Verifica si el evento está agotado
  isSoldOut(): boolean {
    return this.event?.status === 'published' && this.getAvailableTickets() <= 0;
  }
  
  // Verifica si se pueden comprar boletos
  canPurchaseTickets(): boolean {
    return this.event?.status === 'published' && this.getAvailableTickets() > 0;
  }
  
  // Verifica si se alcanzó la cantidad máxima de boletos
  isMaxQuantityReached(): boolean {
    return this.ticketQuantity >= this.getAvailableTickets();
  }
  
  increaseQuantity(): void {
    if (this.canPurchaseTickets() && !this.isMaxQuantityReached()) {
      this.ticketQuantity++;
    }
  }
  
  decreaseQuantity(): void {
    if (this.ticketQuantity > 1) {
      this.ticketQuantity--;
    }
  }
  
  getSubtotal(): number {
    if (!this.event) return 0;
    return this.event.price * this.ticketQuantity;
  }
  
  purchaseTickets(): void {
    if (!this.event || !this.canPurchaseTickets()) return;
    
    this.isPurchasing = true;
    this.purchaseError = '';
    
    const purchaseData = {
      event_id: this.event.id,
      quantity: this.ticketQuantity
    };
    
    this.ticketService.purchaseTickets(purchaseData)
      .pipe(
        finalize(() => {
          this.isPurchasing = false;
        })
      )
      .subscribe({
        next: (response) => {
          // Navigate to tickets view or payment page
          if (this.event && this.event.price > 0) {
            // For paid events, navigate to payment page
            this.router.navigate(['/payment'], { 
              queryParams: { ticket_id: response.id }
            });
          } else {
            // For free events, navigate to tickets page
            this.router.navigate(['/tickets']);
          }
        },
        error: (error) => {
          console.error('Error purchasing tickets:', error);
          if (error.error && error.error.message) {
            this.purchaseError = error.error.message;
          } else {
            this.purchaseError = 'Error al comprar boletos. Por favor, inténtelo de nuevo.';
          }
        }
      });
  }
  
  editEvent(): void {
    if (!this.event) return;
    this.router.navigate(['/events/edit', this.event.id]);
  }
  
  formatEventDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('es-CO', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}