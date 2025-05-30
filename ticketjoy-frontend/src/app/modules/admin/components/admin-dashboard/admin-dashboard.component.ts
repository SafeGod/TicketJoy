import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  isLoading = true;
  stats = {
    totalUsers: 0,
    activeEvents: 0,
    totalTickets: 0,
    revenue: 0
  };

  // Mock recent activity
  recentActivities = [
    {
      id: 1,
      type: 'user_registered',
      user: 'Maria López',
      timestamp: '2025-05-01T14:30:00',
      details: 'Nuevo usuario registrado'
    },
    {
      id: 2,
      type: 'event_created',
      user: 'Admin',
      timestamp: '2025-04-30T11:15:00',
      details: 'Nuevo evento creado: Conferencia de Tecnología FET'
    },
    {
      id: 3,
      type: 'ticket_purchased',
      user: 'Juan Pérez',
      timestamp: '2025-04-28T16:45:00',
      details: 'Boleto comprado para Concierto Música Clásica'
    },
    {
      id: 4,
      type: 'event_updated',
      user: 'Admin',
      timestamp: '2025-04-27T09:20:00',
      details: 'Evento actualizado: Hackathon Desarrollo Web'
    },
    {
      id: 5,
      type: 'ticket_cancelled',
      user: 'Ana Gómez',
      timestamp: '2025-04-25T13:10:00',
      details: 'Boleto cancelado para Torneo de Fútbol 5'
    }
  ];

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    // Simulate loading time
    setTimeout(() => {
      this.stats = {
        totalUsers: 120,
        activeEvents: 5,
        totalTickets: 250,
        revenue: 2750000
      };
      this.isLoading = false;
    }, 1000);
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'user_registered':
        return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-blue-500">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>`;
      case 'event_created':
      case 'event_updated':
        return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-green-500">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>`;
      case 'ticket_purchased':
        return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-purple-500">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
                </svg>`;
      case 'ticket_cancelled':
        return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-red-500">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>`;
      default:
        return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-gray-500">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>`;
    }
  }

  showDevelopmentAlert(feature: string): void {
    alert(`Función de ${feature} en desarrollo`);
  }
}