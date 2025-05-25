import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

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
  
  // Mock event categories
  categories = [
    { id: 1, name: 'Conferencias', color: 'blue' },
    { id: 2, name: 'Música', color: 'purple' },
    { id: 3, name: 'Talleres', color: 'orange' },
    { id: 4, name: 'Deportes', color: 'green' },
    { id: 5, name: 'Cultura', color: 'red' }
  ];
  
  // Mock event data
  event: any = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole('admin');
    this.eventId = +this.route.snapshot.paramMap.get('id')!;
    
    // Simulate API call to get event details
    setTimeout(() => {
      // Find event by id (in a real app, this would be an API call)
      this.event = this.getMockEvent(this.eventId);
      
      if (!this.event) {
        // Event not found, redirect to events list
        this.router.navigate(['/events']);
        return;
      }
      
      this.isLoading = false;
    }, 1000);
  }
  
  // Get mock event data - in a real app, this would be an API call
  getMockEvent(id: number): any {
    const events = [
      {
        id: 1,
        title: 'Conferencia de Tecnología FET',
        description: 'Descubre las últimas tendencias en tecnología con expertos del sector. Esta conferencia anual reúne a profesionales y estudiantes interesados en el futuro de la tecnología. <br><br>Durante el evento, se discutirán temas como inteligencia artificial, blockchain, desarrollo web moderno y ciberseguridad. Habrá sesiones de networking y oportunidades para conectar con empresas del sector tecnológico.',
        image: 'https://ui-avatars.com/api/?name=Tech&background=random',
        date: '2025-05-10T14:00:00',
        endDate: '2025-05-10T18:00:00',
        location: 'Auditorio Principal',
        address: 'Campus Central FET, Edificio A, Piso 3',
        capacity: 200,
        availableTickets: 45,
        price: 0,
        categories: [1, 3],
        status: 'published',
        organizer: 'Facultad de Ingeniería',
        contactEmail: 'eventos@fet.edu.co',
        agenda: [
          { time: '14:00', activity: 'Registro de participantes' },
          { time: '14:30', activity: 'Apertura del evento' },
          { time: '15:00', activity: 'Conferencia principal: "El futuro de la IA"' },
          { time: '16:15', activity: 'Pausa para café' },
          { time: '16:45', activity: 'Panel de discusión: "Tendencias tecnológicas 2025"' },
          { time: '17:45', activity: 'Clausura y networking' }
        ]
      },
      {
        id: 2,
        title: 'Concierto Música Clásica',
        description: 'Disfruta de una noche de música clásica con la orquesta de la universidad. La Orquesta Sinfónica FET presenta un programa especial con obras de Beethoven, Mozart y compositores latinoamericanos contemporáneos.<br><br>Este evento cultural es parte de la celebración del aniversario de la facultad y está abierto a toda la comunidad universitaria y público general.',
        image: 'https://ui-avatars.com/api/?name=Music&background=random',
        date: '2025-05-15T19:00:00',
        endDate: '2025-05-15T21:30:00',
        location: 'Teatro FET',
        address: 'Campus Norte, Edificio Cultural',
        capacity: 300,
        availableTickets: 120,
        price: 15000,
        categories: [2, 5],
        status: 'published',
        organizer: 'Departamento de Cultura',
        contactEmail: 'cultura@fet.edu.co',
        agenda: [
          { time: '19:00', activity: 'Apertura de puertas' },
          { time: '19:30', activity: 'Primera parte: Mozart - Sinfonía No. 40' },
          { time: '20:15', activity: 'Intermedio' },
          { time: '20:30', activity: 'Segunda parte: Obras latinoamericanas' },
          { time: '21:30', activity: 'Fin del concierto' }
        ]
      },
      {
        id: 3,
        title: 'Hackathon Desarrollo Web',
        description: '24 horas para desarrollar soluciones innovadoras en equipos. Este hackathon está enfocado en crear aplicaciones web que resuelvan problemas reales de la comunidad universitaria.<br><br>Los participantes formarán equipos de 3 a 5 personas y tendrán acceso a mentores, infraestructura y alimentación durante todo el evento. Los mejores proyectos recibirán premios y oportunidades para continuar su desarrollo.',
        image: 'https://ui-avatars.com/api/?name=Hack&background=random',
        date: '2025-05-22T08:00:00',
        endDate: '2025-05-23T08:00:00',
        location: 'Laboratorio de Informática',
        address: 'Campus Central, Edificio B, Piso 2',
        capacity: 50,
        availableTickets: 10,
        price: 5000,
        categories: [1, 3],
        status: 'published',
        organizer: 'Club de Programación',
        contactEmail: 'hackathon@fet.edu.co',
        agenda: [
          { time: '08:00', activity: 'Registro y formación de equipos' },
          { time: '09:00', activity: 'Ceremonia de apertura y explicación del reto' },
          { time: '10:00', activity: 'Inicio del hackathon' },
          { time: '13:00', activity: 'Almuerzo' },
          { time: '18:00', activity: 'Cena' },
          { time: '22:00', activity: 'Revisión de avances con mentores' },
          { time: '08:00 (Día 2)', activity: 'Fin del hackathon y presentaciones' },
          { time: '10:00 (Día 2)', activity: 'Premiación y clausura' }
        ]
      },
      {
        id: 4,
        title: 'Torneo de Fútbol 5',
        description: 'Participa en el torneo semestral de fútbol 5 de la universidad. Equipos de todas las facultades compiten por la copa FET en este tradicional torneo deportivo.<br><br>Cada equipo debe tener entre 5 y 8 jugadores. El torneo se jugará en formato de grupos y eliminación directa. Se premiará al campeón, subcampeón y goleador del torneo.',
        image: 'https://ui-avatars.com/api/?name=Soccer&background=random',
        date: '2025-05-25T09:00:00',
        endDate: '2025-05-25T17:00:00',
        location: 'Canchas Deportivas',
        address: 'Campus Sur, Zona Deportiva',
        capacity: 100,
        availableTickets: 40,
        price: 10000,
        categories: [4],
        status: 'published',
        organizer: 'Departamento de Deportes',
        contactEmail: 'deportes@fet.edu.co',
        agenda: [
          { time: '09:00', activity: 'Inauguración del torneo' },
          { time: '09:30', activity: 'Fase de grupos' },
          { time: '12:30', activity: 'Pausa para almuerzo' },
          { time: '14:00', activity: 'Cuartos de final' },
          { time: '15:30', activity: 'Semifinales' },
          { time: '16:30', activity: 'Final' },
          { time: '17:00', activity: 'Ceremonia de premiación' }
        ]
      },
      {
        id: 5,
        title: 'Exposición de Arte',
        description: 'Muestra de trabajos de estudiantes de la facultad de artes. La exposición presentará obras en diversas técnicas, incluyendo pintura, escultura, fotografía y arte digital.<br><br>La entrada es libre y las obras estarán disponibles para su visualización durante una semana completa. Algunos trabajos estarán a la venta, con un porcentaje destinado a becas para estudiantes de arte.',
        image: 'https://ui-avatars.com/api/?name=Art&background=random',
        date: '2025-06-05T10:00:00',
        endDate: '2025-06-10T18:00:00',
        location: 'Galería Central',
        address: 'Campus Cultural, Edificio de Artes',
        capacity: 150,
        availableTickets: 150,
        price: 0,
        categories: [5],
        status: 'published',
        organizer: 'Facultad de Artes',
        contactEmail: 'artes@fet.edu.co',
        agenda: [
          { time: '10:00 (Día inaugural)', activity: 'Apertura de la exposición' },
          { time: '11:00 (Día inaugural)', activity: 'Recorrido guiado por los artistas' },
          { time: '16:00 (Día inaugural)', activity: 'Conversatorio con los artistas' },
          { time: '10:00-18:00', activity: 'Horario de visita (todos los días)' }
        ]
      }
    ];
    
    return events.find(event => event.id === id);
  }
  
  getCategoryById(id: number): any {
    return this.categories.find(cat => cat.id === id);
  }
  
  increaseQuantity(): void {
    if (this.ticketQuantity < this.event.availableTickets) {
      this.ticketQuantity++;
    }
  }
  
  decreaseQuantity(): void {
    if (this.ticketQuantity > 1) {
      this.ticketQuantity--;
    }
  }
  
  getSubtotal(): number {
    return this.event.price * this.ticketQuantity;
  }
  
  purchaseTickets(): void {
    // In a real app, this would call an API to purchase tickets
    console.log(`Purchasing ${this.ticketQuantity} tickets for event ${this.event.id}`);
    alert(`Has comprado ${this.ticketQuantity} boleto(s) para ${this.event.title}`);
    
    // Redirect to tickets page (in a real app)
    this.router.navigate(['/tickets']);
  }
  
  editEvent(): void {
    // In a real app, this would navigate to an edit form
    this.router.navigate(['/events/edit', this.event.id]);
  }
}