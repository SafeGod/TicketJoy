import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.scss']
})
export class TicketDetailComponent implements OnInit {
  ticketId: number = 0;
  isLoading = true;
  
  // Mock ticket data
  ticket: any = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.ticketId = +this.route.snapshot.paramMap.get('id')!;
    
    // Simulate API call to get ticket details
    setTimeout(() => {
      // Find ticket by id (in a real app, this would be an API call)
      this.ticket = this.getMockTicket(this.ticketId);
      
      if (!this.ticket) {
        // Ticket not found, redirect to tickets list
        this.router.navigate(['/tickets']);
        return;
      }
      
      this.isLoading = false;
    }, 1000);
  }
  
  // Get mock ticket data - in a real app, this would be an API call
  getMockTicket(id: number): any {
    const tickets = [
      {
        id: 101,
        eventId: 1,
        eventTitle: 'Conferencia de Tecnología FET',
        eventDescription: 'Descubre las últimas tendencias en tecnología con expertos del sector.',
        eventImage: 'https://ui-avatars.com/api/?name=Tech&background=random',
        eventDate: '2025-05-10T14:00:00',
        eventEndDate: '2025-05-10T18:00:00',
        eventLocation: 'Auditorio Principal',
        eventAddress: 'Campus Central FET, Edificio A, Piso 3',
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
        eventDescription: '24 horas para desarrollar soluciones innovadoras en equipos.',
        eventImage: 'https://ui-avatars.com/api/?name=Hack&background=random',
        eventDate: '2025-05-22T08:00:00',
        eventEndDate: '2025-05-23T08:00:00',
        eventLocation: 'Laboratorio de Informática',
        eventAddress: 'Campus Central, Edificio B, Piso 2',
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
        eventDescription: 'Disfruta de una noche de música clásica con la orquesta de la universidad.',
        eventImage: 'https://ui-avatars.com/api/?name=Music&background=random',
        eventDate: '2025-05-15T19:00:00',
        eventEndDate: '2025-05-15T21:30:00',
        eventLocation: 'Teatro FET',
        eventAddress: 'Campus Norte, Edificio Cultural',
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
        eventDescription: 'Participa en el torneo semestral de fútbol 5 de la universidad.',
        eventImage: 'https://ui-avatars.com/api/?name=Soccer&background=random',
        eventDate: '2025-05-25T09:00:00',
        eventEndDate: '2025-05-25T17:00:00',
        eventLocation: 'Canchas Deportivas',
        eventAddress: 'Campus Sur, Zona Deportiva',
        ticketNumber: 'TJ-2025-11154',
        price: 10000,
        purchaseDate: '2025-05-01T14:20:00',
        status: 'pending',
        qrCode: 'https://placehold.co/200x200/png?text=QR-104',
        paymentId: 'PAY-2025-04201'
      }
    ];
    
    return tickets.find(ticket => ticket.id === id);
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
  
  downloadTicket(): void {
    // In a real app, this would generate and download a PDF
    alert('Función de descarga en desarrollo');
  }
  
  cancelTicket(): void {
    // In a real app, this would call an API to cancel the ticket
    if (confirm('¿Estás seguro de que deseas cancelar este boleto?')) {
      alert('Función de cancelación en desarrollo');
    }
  }
}