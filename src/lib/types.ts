export interface TicketType {
  id: string;
  name: string;
  price: number;
}

export interface EventCategory {
  id: string;
  name: string;
}

export interface Event {
  id: string;
  name: string;
  date: string; // Corresponds to eventStartDate
  endDate?: string;
  location: string;
  posterImage: string;
  posterImageHint: string;
  description: string;
  artists: { name: string; role: string }[];
  venue: { name: string; address: string; capacity: number };
  ticketTypes: TicketType[];
  isFeatured?: boolean;
  category?: EventCategory;
  ticketSaleStartDate?: string;
  ticketSaleEndDate?: string;
}

export interface CartItem {
  eventId: string;
  eventName: string;
  ticketTypeId: string;
  ticketTypeName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  total: number;
  orderDate: string;
}
