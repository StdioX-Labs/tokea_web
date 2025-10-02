'use server';

import { apiClient } from '@/lib/api-client';
import type { Event, TicketType, PurchasedTicket, Order } from '@/lib/types';

interface ApiTicketType {
  id: number;
  ticketName: string;
  ticketPrice: number;
  quantityAvailable: number;
  ticketsToIssue: number;
  ticketLimitPerPerson: number;
  ticketSaleStartDate: string;
  ticketSaleEndDate: string;
  isActive: boolean;
}

interface ApiEvent {
  id: number;
  eventName: string;
  eventStartDate: string;
  eventEndDate: string | null;
  eventLocation: string;
  eventPosterUrl: string;
  eventDescription: string;
  isFeatured: boolean;
  isActive: boolean;
  tickets: ApiTicketType[];
  category: string;
  slug: string;
}

interface ApiAdminTicketType {
  id: number;
  ticketName: string;
  ticketPrice: number;
  quantityAvailable: number;
  isActive: boolean;
  ticketsToIssue: number;
  ticketLimitPerPerson: number;
  ticketSaleStartDate: string;
  ticketSaleEndDate: string;
}

interface ApiAdminEvent {
  id: number;
  eventName: string;
  eventDescription: string;
  eventPosterUrl: string;
  eventLocation: string;
  eventStartDate: string;
  eventEndDate: string | null;
  isFeatured: boolean;
  isActive: boolean;
  tickets: ApiAdminTicketType[];
  category: string;
  slug: string;
}

interface PurchaseTicket {
  ticketId: number;
  quantity: number;
}

interface PurchaseCustomer {
  mobile_number: string;
  email: string;
}

export interface PurchasePayload {
  eventId: number;
  amountDisplayed: number;
  coupon_code?: string;
  channel: 'card' | 'mpesa';
  customer: PurchaseCustomer;
  tickets: PurchaseTicket[];
}

export interface CreateEventPayload {
    eventName: string;
    eventDescription: string;
    eventPosterUrl: string;
    eventCategory: { id: number };
    eventLocation: string;
    eventStartDate: string;
    eventEndDate?: string;
    users: { id: number };
    company: { id: number };
}

export interface UpdateEventPayload extends Omit<CreateEventPayload, 'users' | 'company'> {}

export interface CreateTicketPayload {
  event: { id: number };
  ticketName: string;
  ticketPrice: number;
  quantityAvailable: number;
  ticketsToIssue: number;
  ticketLimitPerPerson: number;
  numberOfComplementary: number;
  ticketSaleStartDate: string;
  ticketSaleEndDate: string;
  isFree: boolean;
}

export interface UpdateTicketPayload extends Omit<CreateTicketPayload, 'event'> {}

interface ApiTicketInGroup {
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

interface ApiTicketGroupStatusResponse {
    tickets: ApiTicketInGroup[];
    posterUrl: string;
    ticketPrice: number;
    event: string;
    status: boolean;
}

interface ApiNewTicketType {
  ticketId: number;
  isActive: boolean;
  isSoldOut: boolean;
  numberOfComplementary: number;
  quantityAvailable: number;
  soldQuantity: number;
  status: string;
  ticketName: string;
  ticketPrice: number;
  ticketSaleEndDate: string;
}

interface ApiNewEvent {
  eventId: number;
  eventName: string;
  posterUrl: string;
  isActive: boolean;
  ticketSaleEnd: string;
  tickets: ApiNewTicketType[];
  location: string;
  eventStartDate: string;
  totalTicketSaleBalance: string;
  totalPlatformFee: string;
  uniqueTicketsCount: string;
}

interface ApiNewEventResponse {
  data: {
    companyId: number | null;
    events: ApiNewEvent[];
  };
  message: string;
  status: boolean;
}

function transformApiTicketInGroup(apiTicket: ApiTicketInGroup): PurchasedTicket {
    return {
        id: apiTicket.id,
        ticketName: apiTicket.ticketName,
        ticketPrice: apiTicket.ticketPrice,
        barcode: apiTicket.barcode,
        ticketGroupCode: apiTicket.ticketGroupCode,
        customerMobile: apiTicket.customerMobile,
        isComplementary: apiTicket.isComplementary,
        status: apiTicket.status,
        createdAt: apiTicket.createdAt,
    };
}

function transformApiTicketTypeToTicketType(apiTicket: ApiTicketType): TicketType {
  return {
    id: String(apiTicket.id),
    name: apiTicket.ticketName,
    price: apiTicket.ticketPrice || 0,
    quantityAvailable: apiTicket.quantityAvailable,
    ticketsToIssue: apiTicket.ticketsToIssue,
    ticketLimitPerPerson: apiTicket.ticketLimitPerPerson,
    saleStartDate: apiTicket.ticketSaleStartDate,
    saleEndDate: apiTicket.ticketSaleEndDate,
    status: apiTicket.isActive ? 'active' : 'disabled',
  };
}

function transformApiAdminTicketToTicketType(apiTicket: ApiAdminTicketType): TicketType {
  return {
    id: String(apiTicket.id),
    name: apiTicket.ticketName,
    price: apiTicket.ticketPrice || 0,
    quantityAvailable: apiTicket.quantityAvailable,
    ticketsToIssue: apiTicket.ticketsToIssue,
    ticketLimitPerPerson: apiTicket.ticketLimitPerPerson,
    saleStartDate: apiTicket.ticketSaleStartDate,
    saleEndDate: apiTicket.ticketSaleEndDate,
    status: apiTicket.isActive ? 'active' : 'disabled',
  };
}

function transformApiNewTicketToTicketType(apiTicket: ApiNewTicketType): TicketType {
  return {
    id: String(apiTicket.ticketId),
    name: apiTicket.ticketName,
    price: apiTicket.ticketPrice || 0,
    quantityAvailable: apiTicket.quantityAvailable,
    ticketsToIssue: apiTicket.soldQuantity,
    ticketLimitPerPerson: 0, // Not provided in new API
    saleStartDate: '', // Not provided in new API
    saleEndDate: apiTicket.ticketSaleEndDate,
    status: apiTicket.isActive ? 'active' : 'disabled',
  };
}

function transformApiEventToEvent(apiEvent: ApiEvent): Event {
  const posterHint = apiEvent.category?.toLowerCase().replace(/&/g, '').split(/\s+/).slice(0, 2).join(' ') || 'event poster';

  return {
    id: String(apiEvent.id),
    slug: apiEvent.slug,
    name: apiEvent.eventName,
    date: apiEvent.eventStartDate,
    endDate: apiEvent.eventEndDate || undefined,
    location: apiEvent.eventLocation,
    posterImage: apiEvent.eventPosterUrl,
    posterImageHint: posterHint,
    description: apiEvent.eventDescription,
    isFeatured: apiEvent.isFeatured,
    isActive: apiEvent.isActive,
    artists: [],
    venue: {
      name: apiEvent.eventLocation,
      address: '',
      capacity: 0,
    },
    ticketTypes: apiEvent.tickets?.map(transformApiTicketTypeToTicketType) || [],
    promotions: [],
  };
}

function transformApiAdminEventToEvent(apiEvent: ApiAdminEvent): Event {
  const posterHint = apiEvent.category?.toLowerCase().replace(/&/g, '').split(/\s+/).slice(0, 2).join(' ') || 'event poster';

  return {
    id: String(apiEvent.id),
    slug: apiEvent.slug,
    name: apiEvent.eventName,
    date: apiEvent.eventStartDate,
    endDate: apiEvent.eventEndDate || undefined,
    location: apiEvent.eventLocation,
    posterImage: apiEvent.eventPosterUrl,
    posterImageHint: posterHint,
    description: apiEvent.eventDescription,
    isFeatured: apiEvent.isFeatured,
    isActive: apiEvent.isActive,
    artists: [],
    venue: {
      name: apiEvent.eventLocation,
      address: '',
      capacity: 0,
    },
    ticketTypes: apiEvent.tickets?.map(transformApiAdminTicketToTicketType) || [],
    promotions: [],
  };
}

function transformApiNewEventToEvent(apiEvent: ApiNewEvent): Event {
  return {
    id: String(apiEvent.eventId),
    slug: String(apiEvent.eventId), // Use event ID as slug since it's not provided in the API
    name: apiEvent.eventName,
    date: apiEvent.eventStartDate,
    endDate: apiEvent.ticketSaleEnd || undefined,
    location: apiEvent.location,
    posterImage: apiEvent.posterUrl,
    posterImageHint: 'event poster',
    description: '', // Not provided in new API
    isFeatured: false, // Not provided in new API
    isActive: apiEvent.isActive,
    artists: [],
    venue: {
      name: apiEvent.location,
      address: '',
      capacity: 0,
    },
    ticketTypes: apiEvent.tickets?.map(transformApiNewTicketToTicketType) || [],
    promotions: [],
  };
}

interface ApiUserEvent {
  id: number;
  eventName: string;
  eventDescription: string;
  eventPosterUrl: string;
  eventCategoryId: number;
  ticketSaleStartDate: string;
  ticketSaleEndDate: string;
  eventLocation: string;
  eventStartDate: string;
  eventEndDate: string;
  isActive: boolean;
  tickets: {
    id: number;
    ticketName: string;
    ticketPrice: number;
    quantityAvailable: number;
    soldQuantity: number;
    isActive: boolean;
    ticketsToIssue: number;
    isSoldOut: boolean;
    ticketLimitPerPerson: number;
    numberOfComplementary: number;
    ticketSaleStartDate: string;
    ticketSaleEndDate: string;
    isFree: boolean;
    ticketStatus: string;
    createAt: string;
  }[];
  createdById: number;
  companyId: number;
  companyName: string;
  comission: number;
  category: string;
  date: string;
  time: string;
  isFeatured: boolean;
  price: number;
  slug: string;
}

interface ApiUserEventsResponse {
  message: string;
  events: ApiUserEvent[];
  status: boolean;
}

function transformApiUserEventToEvent(apiEvent: ApiUserEvent): Event {
  return {
    id: String(apiEvent.id),
    slug: apiEvent.slug || String(apiEvent.id),
    name: apiEvent.eventName,
    date: apiEvent.eventStartDate,
    endDate: apiEvent.eventEndDate || undefined,
    location: apiEvent.eventLocation,
    posterImage: apiEvent.eventPosterUrl,
    posterImageHint: apiEvent.category?.toLowerCase() || 'event poster',
    description: apiEvent.eventDescription,
    isFeatured: apiEvent.isFeatured,
    isActive: apiEvent.isActive,
    artists: [],
    venue: {
      name: apiEvent.eventLocation,
      address: '',
      capacity: 0,
    },
    ticketTypes: apiEvent.tickets?.map(ticket => ({
      id: String(ticket.id),
      name: ticket.ticketName,
      price: ticket.ticketPrice || 0,
      quantityAvailable: ticket.quantityAvailable,
      ticketsToIssue: ticket.ticketsToIssue,
      ticketLimitPerPerson: ticket.ticketLimitPerPerson,
      saleStartDate: ticket.ticketSaleStartDate,
      saleEndDate: ticket.ticketSaleEndDate,
      status: ticket.isActive ? 'active' : 'disabled',
    })) || [],
    promotions: [],
  };
}

export async function getEvents(): Promise<Event[]> {
  const response = await apiClient<ApiNewEventResponse>('/event/report/get?companyId=3');
  return response.data.events.map(transformApiNewEventToEvent);
}

export async function getCompanyEvents(): Promise<Event[]> {
  const response = await apiClient<{ events: ApiAdminEvent[] }>('/company/events/get');
  return response.events.map(transformApiAdminEventToEvent);
}

export async function getEventById(id: string): Promise<Event | null> {
  try {
    const allEvents = await getEvents();
    const event = allEvents.find((e) => e.id === id);
    return event || null;
  } catch (error) {
    console.error(`Error fetching event by id ${id}:`, error);
    return null;
  }
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  try {
    const allEvents = await getEvents();
    const event = allEvents.find((e) => e.slug === slug);
    return event || null;
  } catch (error) {
    console.error(`Error fetching event by slug ${slug}:`, error);
    return null;
  }
}

export async function purchaseTickets(payload: PurchasePayload): Promise<{ ticketGroup: string; message: string; status: boolean; checkoutUrl?: string; }> {
  try {
    const response = await apiClient<any>('/event/ticket/purchase', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    console.log('Purchase tickets API response:', response);

    // Check for API error responses first
    if (response && typeof response === 'object' && (response.status === false || response.error)) {
      let errorMessage = 'Payment initialization failed';

      // Extract error message from different possible formats
      if (response.error && typeof response.error === 'string') {
        try {
          // Try to parse nested error JSON if present
          if (response.error.includes('{')) {
            const errorMatch = response.error.match(/\{.*\}/);
            if (errorMatch) {
              const parsedError = JSON.parse(errorMatch[0]);
              if (parsedError.error) {
                errorMessage = parsedError.error;
              } else if (parsedError.message) {
                errorMessage = parsedError.message;
              }
            }
          } else {
            errorMessage = response.error;
          }
        } catch (parseError) {
          console.error('Failed to parse error message:', parseError);
          errorMessage = response.error;
        }
      } else if (response.message) {
        errorMessage = response.message;
      }

      throw new Error(`Payment failed: ${errorMessage}`);
    }

    // Handle different possible response structures for successful responses
    if (response && typeof response === 'object') {
      // Debug all properties in the response
      console.log('Response properties:', Object.keys(response));

      // Try to find ticketGroup in various possible locations and formats
      let ticketGroup = '';

      if (response.ticketGroup) {
        ticketGroup = response.ticketGroup;
      } else if (response.ticket_group) {
        ticketGroup = response.ticket_group;
      } else if (response.data && response.data.ticketGroup) {
        ticketGroup = response.data.ticketGroup;
      } else if (response.data && response.data.ticket_group) {
        ticketGroup = response.data.ticket_group;
      } else if (response.ticketgroup) { // Try lowercase variants
        ticketGroup = response.ticketgroup;
      } else if (response.data && response.data.ticketgroup) {
        ticketGroup = response.data.ticketgroup;
      } else if (typeof response === 'string') {
        // If the response is just a string, use that as the ticketGroup
        ticketGroup = response;
      } else {
        // As a last resort, check if the entire response or a sub-property might be the ticketGroup
        const responseStr = JSON.stringify(response);
        const matches = responseStr.match(/"([A-Z0-9]{5,8})"/); // Look for 5-8 character alphanumeric strings
        if (matches && matches[1]) {
          console.log('Found potential ticketGroup in response:', matches[1]);
          ticketGroup = matches[1];
        }
      }

      if (!ticketGroup) {
        console.error('Missing ticketGroup in response. Full response:', response);
        throw new Error('Server did not return a valid ticket confirmation. The payment may have failed or there might be an issue with the selected tickets.');
      }

      // Normalize the response to expected format
      return {
        ticketGroup,
        message: response.message || 'Payment processing initiated',
        status: response.status !== false, // Only treat explicit false as false
        checkoutUrl: response.checkoutUrl || response.checkout_url ||
                    (response.data && (response.data.checkoutUrl || response.data.checkout_url)) || undefined,
      };
    }

    console.error('Unexpected response format:', response);
    throw new Error('Received unexpected response format from payment server');
  } catch (error) {
    console.error('Purchase tickets error:', error);
    throw error;
  }
}

export async function checkPaymentStatus(ticketGroup: string): Promise<{
    tickets: PurchasedTicket[];
    posterUrl: string;
    total: number;
    eventName: string;
} | null> {
    try {
        const response = await apiClient<ApiTicketGroupStatusResponse>(`/event/ticket/group/get?ticketGroup=${ticketGroup}`);
        if (!response || !response.tickets || response.tickets.length === 0) {
            return null;
        }

        const isPaid = response.tickets.some(t => t.status === 'VALID');
        if (!isPaid) {
            return null;
        }

        return {
            tickets: response.tickets.map(transformApiTicketInGroup),
            posterUrl: response.posterUrl,
            total: response.ticketPrice,
            eventName: response.event,
        };
    } catch (error) {
        console.log(`Polling for ${ticketGroup}: Not found or error. Continuing.`);
        return null;
    }
}

export async function getPublicOrderDetails(orderId: string): Promise<Order | null> {
    try {
        const response = await apiClient<ApiTicketGroupStatusResponse>(`/event/ticket/group/get?ticketGroup=${orderId}`);

        if (!response || !response.tickets || response.tickets.length === 0) {
            return null;
        }

        const firstTicket = response.tickets[0];

        const order: Order = {
            id: firstTicket.ticketGroupCode,
            eventName: response.event,
            posterUrl: response.posterUrl,
            total: response.ticketPrice,
            tickets: response.tickets.map(transformApiTicketInGroup),
            orderDate: firstTicket.createdAt,
        };
        return order;

    } catch (error) {
        console.error(`Failed to fetch public order details for ${orderId}:`, error);
        return null;
    }
}

export async function createEvent(payload: CreateEventPayload): Promise<any> {
    return apiClient('/event/create', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}

export async function updateEvent(eventId: string, payload: UpdateEventPayload): Promise<any> {
    return apiClient(`/event/update?eventId=${eventId}`, {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}

export async function activateEvent(eventId: string): Promise<any> {
    return apiClient('/event/activate', {
        method: 'POST',
        body: JSON.stringify({ eventIds: [parseInt(eventId)] }),
    });
}

export async function getEventTickets(eventId: string): Promise<TicketType[]> {
    const response = await apiClient<{ ticket: ApiAdminTicketType[] }>(`/event/ticket/get?eventId=${eventId}`);
    return response.ticket.map(transformApiAdminTicketToTicketType);
}

export async function createTicket(payload: CreateTicketPayload): Promise<any> {
    return apiClient('/event/ticket/create', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}

export async function updateTicket(ticketId: string, payload: UpdateTicketPayload): Promise<any> {
    return apiClient(`/ticket/update?ticketId=${ticketId}`, {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}

export async function getUserEvents(userId: string): Promise<Event[]> {
  try {
    const response = await apiClient<ApiUserEventsResponse>(`/event/map/get?userId=${userId}`);

    if (!response || !response.events || !Array.isArray(response.events)) {
      console.error('Invalid response format for user events:', response);
      return [];
    }

    return response.events.map(transformApiUserEventToEvent);
  } catch (error) {
    console.error(`Error fetching events for user ${userId}:`, error);
    return [];
  }
}
