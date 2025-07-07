
export interface PurchasedTicket {
  id: number;
  ticketName: string;
  ticketPrice: number;
  barcode: string | null;
  ticketGroupCode: string;
  customerMobile: string;
  isComplementary: boolean;
  status: 'PENDING_PAYMENT' | 'VALID' | string;
  createdAt: string;
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  quantityAvailable: number;
  ticketsToIssue: number;
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
  date: string;
  endDate?: string;
  location: string;
  posterImage: string;
  posterImageHint: string;
  description: string;
  artists: { name: string; role: string }[];
  venue: { name: string; address: string; capacity: number };
  ticketTypes: TicketType[];
  isFeatured?: boolean;
  isActive: boolean;
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
  id: string; // This will be the ticketGroup code
  customerName?: string;
  customerEmail?: string;
  tickets: PurchasedTicket[];
  total: number;
  orderDate: string;
  couponCode?: string;
  posterUrl: string;
  eventName: string;
}
