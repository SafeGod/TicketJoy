import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.scss']
})
export class TicketListComponent implements OnInit {
  isLoading = true;
  selectedStatus: string = 'all';
  
  // Mock tickets data
  tickets = [
    {
      id: 101,
      eventId: 1,
      eventTitle: 'Conferencia de Tecnología FET',
      eventDate: '2025-05-10T14:00:00',
      eventLocation: 'Auditorio Principal',
      ticketNumber: 'TJ-2025-10145',
      price: 0,
      purchaseDate: '2025-04-28T10:30:00',
      status: 'confirmed',
      qrCode: 'https://placehold.co/200x200/png?text=QR-101'
    },
    {
      id: 102,
      eventId: 3,
      eventTitle: 'Hackathon Desarrollo Web',
      eventDate: '2025-05-22T08:00:00',
      eventLocation: 'Laboratorio de Informática',
      ticketNumber: 'TJ-2025-10892',
      price: 5000,
      purchaseDate: '2025-04-25T16:15:00',
      status: 'used',
      qrCode: 'https://placehold.co/200x200/png?text=QR-102'
    },
    {
      id: 103,
      eventId: 2,
      eventTitle: 'Concierto Música Clásica',
      eventDate: '2025-05-15T19:00:00',
      eventLocation: 'Teatro FET',
      ticketNumber: 'TJ-2025-11023',
      price: 15000,
      purchaseDate: '2025-05-01T09:45:00',
      status: 'confirmed',
      qrCode: 'https://placehold.co/200x200/png?text=QR-103'
    },
    {
      id: 104,
      eventId: 4,
      eventTitle: 'Torneo de Fútbol 5',
      eventDate: '2025-05-25T09:00:00',
      eventLocation: 'Canchas Deportivas',
      ticketNumber: 'TJ-2025-11154',
      price: 10000,
      purchaseDate: '2025-05-01T14:20:00',
      status: 'pending',
      qrCode: 'https://placehold.co/200x200/png?text=QR-104'
    }
  ];
  
  filteredTickets: any[] = [];

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    // Simulate loading time
    setTimeout(() => {
      this.filteredTickets = [...this.tickets];
      this.isLoading = false;
    }, 1000);
  }
  
  filterByStatus(status: string): void {
    this.selectedStatus = status;
    
    if (status === 'all') {
      this.filteredTickets = [...this.tickets];
    } else {
      this.filteredTickets = this.tickets.filter(ticket => ticket.status === status);
    }
  }
  
  getStatusLabel(status: string): string {
    switch(status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendiente';
      case 'used': return 'Utilizado';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconocido';
    }
  }
  
  getStatusClass(status: string): string {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'used': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}