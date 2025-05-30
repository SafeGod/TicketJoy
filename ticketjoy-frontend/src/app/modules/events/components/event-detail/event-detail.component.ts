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
  isOrganizer = false;
  ticketQuantity = 1;
  isPurchasing = false;
  purchaseError = '';
  error = '';
  successMessage = '';
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

    // Check for success message from query params
    this.route.queryParams.subscribe(params => {
      if (params['message']) {
        this.successMessage = params['message'];
        // Clear the message after 5 seconds
        setTimeout(() => {
          this.clearSuccessMessage();
        }, 5000);
      }
    });

    this.loadEventDetails();
  }

  loadEventDetails(): void {
    this.isLoading = true;
    this.error = '';

    this.eventService.getEvent(this.eventId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (event) => {
          this.event = event;

          // Check if current user is the organizer
          const currentUser = this.authService.currentUser;
          this.isOrganizer = currentUser?.id === event.organizer_id;

          // Reset ticket quantity to 1 or max available
          this.ticketQuantity = 1;

          if (this.getAvailableTickets() < this.ticketQuantity) {
            this.ticketQuantity = Math.max(1, this.getAvailableTickets());
          }
        },
        error: (error) => {
          console.error('Error loading event details:', error);

          // Set appropriate error message
          if (error.status === 404) {
            this.error = 'El evento no existe o no tienes permisos para verlo.';
          } else if (error.status === 0) {
            this.error = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
          } else if (error.status >= 500) {
            this.error = 'Error interno del servidor. Por favor, intenta más tarde.';
          } else {
            this.error = 'Error al cargar el evento. Por favor, intenta de nuevo.';
          }
        }
      });
  }

  // Método seguro para obtener available_tickets
  getAvailableTickets(): number {
    return this.event?.available_tickets ?? this.event?.capacity ?? 0;
  }

  // Verifica si el evento está agotado
  isSoldOut(): boolean {
    return this.event?.status === 'published' && this.getAvailableTickets() <= 0;
  }

  // Verifica si se pueden comprar boletos
  canPurchaseTickets(): boolean {
    return this.event?.status === 'published' &&
      this.getAvailableTickets() > 0 &&
      !this.isEventExpired();
  }

  // Verifica si el evento ya expiró
  isEventExpired(): boolean {
    if (!this.event) return false;
    const eventDate = new Date(this.event.start_date);
    return eventDate < new Date();
  }

  // Verifica si se alcanzó la cantidad máxima de boletos
  isMaxQuantityReached(): boolean {
    return this.ticketQuantity >= this.getAvailableTickets();
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

  // Puede editar el evento si es admin o es el organizador
  canEditEvent(): boolean {
    return this.isAdmin || this.isOrganizer;
  }

  // Puede publicar el evento si es admin o es el organizador y está en draft
  canPublishEvent(): boolean {
    return (this.isAdmin || this.isOrganizer) && this.event?.status === 'draft';
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
    // Mostrar alerta de función en desarrollo
    alert('Función de compra de boletos en desarrollo');
    return;

    // Código original comentado para uso futuro
    /*
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
    */
  }

  publishEvent(): void {
    if (!this.event || !this.canPublishEvent()) return;

    this.eventService.publishEvent(this.event.id)
      .subscribe({
        next: (updatedEvent) => {
          this.event = updatedEvent;
          // Show success message or notification
        },
        error: (error) => {
          console.error('Error publishing event:', error);
          this.error = 'Error al publicar el evento. Por favor, intenta de nuevo.';
        }
      });
  }

  editEvent(): void {
    if (!this.event || !this.canEditEvent()) return;
    this.router.navigate(['/events/edit', this.event.id]);
  }

  deleteEvent(): void {
    if (!this.event || !this.canEditEvent()) return;

    const confirmDelete = confirm(
      `¿Estás seguro de que quieres eliminar el evento "${this.event.title}"?\n\n` +
      'Esta acción no se puede deshacer y se eliminarán todos los boletos asociados.'
    );

    if (!confirmDelete) return;

    this.eventService.deleteEvent(this.event.id)
      .subscribe({
        next: () => {
          // Redirect to events list with success message
          this.router.navigate(['/events'], {
            queryParams: { message: 'Evento eliminado correctamente' }
          });
        },
        error: (error) => {
          console.error('Error deleting event:', error);
          if (error.error && error.error.message) {
            this.error = error.error.message;
          } else {
            this.error = 'Error al eliminar el evento. Por favor, intenta de nuevo.';
          }
        }
      });
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

  // Método para recargar el evento
  refreshEvent(): void {
    this.loadEventDetails();
  }

  clearSuccessMessage(): void {
    this.successMessage = '';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { message: null },
      queryParamsHandling: 'merge'
    });
  }
}