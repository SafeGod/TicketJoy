import { User } from './user.model';
import { Ticket } from './ticket.model';

export interface Payment {
  id: number;
  user_id: number;
  ticket_id?: number;
  payment_id?: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  notes?: string;
  paid_at?: string;
  created_at?: string;
  updated_at?: string;
  user?: User;
  ticket?: Ticket;
}
