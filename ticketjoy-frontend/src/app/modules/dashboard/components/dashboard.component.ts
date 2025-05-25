import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  isLoading = true;
  stats = {
    upcomingEvents: 0,
    myTickets: 0,
    myEvents: 0
  };
  
  // Mock upcoming events
  upcomingEvents = [
    {
      id: 1,
      title: 'Conferencia de Tecnología FET',
      image: 'https://ui-avatars.com/api/?name=Tech&background=random',
      date: '2025-05-10T14:00:00',
      location: 'Auditorio Principal',
      capacity: 200,
      availableTickets: 45,
      price: 0
    },
    {
      id: 2,
      title: 'Concierto Música Clásica',
      image: 'https://ui-avatars.com/api/?name=Music&background=random',
      date: '2025-05-15T19:00:00',
      location: 'Teatro FET',
      capacity: 300,
      availableTickets: 120
    },
    {
      id: 3,
      title: 'Hackathon Desarrollo Web',
      image: 'https://ui-avatars.com/api/?name=Hack&background=random',
      date: '2025-05-22T08:00:00',
      location: 'Laboratorio de Informática',
      capacity: 50,
      availableTickets: 10
    }
  ];
  
  // Mock recent tickets
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

  constructor(public authService: AuthService) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      
      // Simulate loading time
      setTimeout(() => {
        this.stats = {
          upcomingEvents: this.upcomingEvents.length,
          myTickets: this.recentTickets.length,
          myEvents: this.authService.hasRole('admin') ? 5 : 0
        };
        this.isLoading = false;
      }, 1000);
    });
  }
}