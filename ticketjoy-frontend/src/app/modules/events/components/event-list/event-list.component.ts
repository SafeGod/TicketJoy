import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent implements OnInit {
  isLoading = true;
  isAdmin = false;
  categories = [
    { id: 1, name: 'Conferencias', color: 'blue' },
    { id: 2, name: 'Música', color: 'purple' },
    { id: 3, name: 'Talleres', color: 'orange' },
    { id: 4, name: 'Deportes', color: 'green' },
    { id: 5, name: 'Cultura', color: 'red' }
  ];
  
  selectedCategories: number[] = [];
  searchTerm = '';
  
  // Mock events data
  events = [
    {
      id: 1,
      title: 'Conferencia de Tecnología FET',
      description: 'Descubre las últimas tendencias en tecnología con expertos del sector.',
      image: 'https://ui-avatars.com/api/?name=Tech&background=random',
      date: '2025-05-10T14:00:00',
      endDate: '2025-05-10T18:00:00',
      location: 'Auditorio Principal',
      capacity: 200,
      availableTickets: 45,
      price: 0,
      categories: [1, 3],
      status: 'published'
    },
    {
      id: 2,
      title: 'Concierto Música Clásica',
      description: 'Disfruta de una noche de música clásica con la orquesta de la universidad.',
      image: 'https://ui-avatars.com/api/?name=Music&background=random',
      date: '2025-05-15T19:00:00',
      endDate: '2025-05-15T21:30:00',
      location: 'Teatro FET',
      capacity: 300,
      availableTickets: 120,
      price: 15000,
      categories: [2, 5],
      status: 'published'
    },
    {
      id: 3,
      title: 'Hackathon Desarrollo Web',
      description: '24 horas para desarrollar soluciones innovadoras en equipos.',
      image: 'https://ui-avatars.com/api/?name=Hack&background=random',
      date: '2025-05-22T08:00:00',
      endDate: '2025-05-23T08:00:00',
      location: 'Laboratorio de Informática',
      capacity: 50,
      availableTickets: 10,
      price: 5000,
      categories: [1, 3],
      status: 'published'
    },
    {
      id: 4,
      title: 'Torneo de Fútbol 5',
      description: 'Participa en el torneo semestral de fútbol 5 de la universidad.',
      image: 'https://ui-avatars.com/api/?name=Soccer&background=random',
      date: '2025-05-25T09:00:00',
      endDate: '2025-05-25T17:00:00',
      location: 'Canchas Deportivas',
      capacity: 100,
      availableTickets: 40,
      price: 10000,
      categories: [4],
      status: 'published'
    },
    {
      id: 5,
      title: 'Exposición de Arte',
      description: 'Muestra de trabajos de estudiantes de la facultad de artes.',
      image: 'https://ui-avatars.com/api/?name=Art&background=random',
      date: '2025-06-05T10:00:00',
      endDate: '2025-06-10T18:00:00',
      location: 'Galería Central',
      capacity: 150,
      availableTickets: 150,
      price: 0,
      categories: [5],
      status: 'published'
    }
  ];
  
  filteredEvents: any[] = [];

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole('admin');
    
    // Simulate loading time
    setTimeout(() => {
      this.filteredEvents = [...this.events];
      this.isLoading = false;
    }, 1000);
  }
  
  toggleCategory(categoryId: number): void {
    const index = this.selectedCategories.indexOf(categoryId);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(categoryId);
    }
    this.applyFilters();
  }
  
  onSearch(event: any): void {
    this.searchTerm = event.target.value.toLowerCase();
    this.applyFilters();
  }
  
  applyFilters(): void {
    this.filteredEvents = this.events.filter(event => {
      // Filter by search term
      const matchesSearch = this.searchTerm ? 
        event.title.toLowerCase().includes(this.searchTerm) || 
        event.description.toLowerCase().includes(this.searchTerm) ||
        event.location.toLowerCase().includes(this.searchTerm) : 
        true;
      
      // Filter by category
      const matchesCategory = this.selectedCategories.length > 0 ? 
        this.selectedCategories.some(cat => event.categories.includes(cat)) : 
        true;
      
      return matchesSearch && matchesCategory;
    });
  }
  
  getCategoryById(id: number): any {
    return this.categories.find(cat => cat.id === id);
  }
  
  resetFilters(): void {
    this.selectedCategories = [];
    this.searchTerm = '';
    this.filteredEvents = [...this.events];
  }
}