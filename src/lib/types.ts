export interface TicketType {
  id: string;
  name: string;
  price: number;
  quantityAvailable: number;
  // ticketsToIssue is how many tickets are granted per purchase of this type. 1 for single, 2 for couple etc.
  ticketsToIssue: number;
  // 0 for unlimited
  ticketLimitPerPerson: number;
  saleStartDate: string;
  saleEndDate: string;
  status: 'active' | 'disabled';
}

export interface EventCategory {
  id:string;
  name: string;
}

export interface Promotion {
  id: string;
  codeBatchName: string;
  numberOfCodes: number;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  validFrom: string;
  validUntil: string;
  maxUses: number;
  status: 'active' | 'expired' | 'disabled';
}

export interface Event {
  id: string;
  slug: string;
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
  promotions?: Promotion[];
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
  couponCode?: string;
}
