import { User } from './user.model';
import { EventCategory } from './event-category.model';

export interface Event {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  capacity: number;
  price: number;
  image?: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  organizer_id: number;
  created_at?: string;
  updated_at?: string;
  categories?: EventCategory[];
  organizer?: User;
  available_tickets?: number;
}
