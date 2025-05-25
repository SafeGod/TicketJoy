import { User } from './user.model';
import { Payment } from './payment.model';

export interface Ticket {
  id: number;
  event_id: number;
  user_id: number;
  ticket_number: string;
  status: 'pending' | 'confirmed' | 'used' | 'cancelled';
  price: number;
  purchased_at?: string;
  qr_code?: string;
  created_at?: string;
  updated_at?: string;
  event?: Event;
  user?: User;
  payment?: Payment;
}
