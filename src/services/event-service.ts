
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

export async function getEvents(): Promise<Event[]> {
  const response = await apiClient<{ events: ApiEvent[] }>('/events/get/all');
  return response.events.map(transformApiEventToEvent);
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
  return apiClient('/event/ticket/purchase', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
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
    const response = await apiClient<{ tickets: ApiAdminTicketType[] }>(`/event/ticket/get?eventId=${eventId}`);
    return response.tickets.map(transformApiAdminTicketToTicketType);
}

export async function createTicket(payload: CreateTicketPayload): Promise<any> {
    return apiClient('/event/ticket/create', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}

export async function updateTicket(ticketId: string, payload: UpdateTicketPayload): Promise<any> {
    return apiClient(`/event/ticket/update?ticketId=${ticketId}`, {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}
