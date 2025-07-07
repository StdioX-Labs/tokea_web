'use server';

import { apiClient } from '@/lib/api-client';
import type { Event, TicketType } from '@/lib/types';

// These interfaces describe the shape of the data from the PUBLIC API
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

// These interfaces describe the shape of the data from the ADMIN/COMPANY API
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

// Interfaces for the purchase API
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

// Interface for creating an event
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

// Interface for updating an event
export interface UpdateEventPayload extends Omit<CreateEventPayload, 'users' | 'company'> {}


// Interface for creating a ticket
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

// Interface for updating a ticket
export interface UpdateTicketPayload extends Omit<CreateTicketPayload, 'event'> {}


// Transformer functions to convert API data into our app's data types
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
    artists: [], // API doesn't have this, use default
    venue: {
      name: apiEvent.eventLocation,
      address: '',
      capacity: 0,
    },
    ticketTypes: apiEvent.tickets?.map(transformApiTicketTypeToTicketType) || [],
    promotions: [], // API doesn't have this, use default
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
    artists: [], // API doesn't have this, use default
    venue: {
      name: apiEvent.eventLocation,
      address: '',
      capacity: 0,
    },
    ticketTypes: apiEvent.tickets?.map(transformApiAdminTicketToTicketType) || [],
    promotions: [], // API doesn't have this, use default
  };
}


/**
 * Fetches all events from the PUBLIC API.
 */
export async function getEvents(): Promise<Event[]> {
  const response = await apiClient<{ events: ApiEvent[] }>('/events/get/all');
  return response.events.map(transformApiEventToEvent);
}

/**
 * Fetches all events from the COMPANY-SPECIFIC API.
 */
export async function getCompanyEvents(): Promise<Event[]> {
  const response = await apiClient<{ events: ApiAdminEvent[] }>('/company/events/get');
  return response.events.map(transformApiAdminEventToEvent);
}


/**
 * Fetches a single event by its ID.
 * This is implemented by fetching all events and finding the matching one.
 * For large datasets, a dedicated API endpoint `/events/get/{id}` would be more performant.
 */
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


/**
 * Fetches a single event by its slug.
 * This is implemented by fetching all events and finding the matching one.
 * For large datasets, a dedicated API endpoint `/events/get-by-slug/{slug}` would be more performant.
 */
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

/**
 * Submits a ticket purchase request to the backend.
 */
export async function purchaseTickets(payload: PurchasePayload): Promise<any> {
  return apiClient('/event/ticket/purchase', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Creates a new event using the ADMIN API.
 */
export async function createEvent(payload: CreateEventPayload): Promise<any> {
    return apiClient('/event/create', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}

/**
 * Updates an existing event using the ADMIN API.
 */
export async function updateEvent(eventId: string, payload: UpdateEventPayload): Promise<any> {
    return apiClient(`/event/update?eventId=${eventId}`, {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}

/**
 * Activates an event.
 */
export async function activateEvent(eventId: string): Promise<any> {
    return apiClient('/event/activate', {
        method: 'POST',
        body: JSON.stringify({ eventIds: [parseInt(eventId)] }),
    });
}

/**
 * Fetches all tickets for a given event from the ADMIN API.
 */
export async function getEventTickets(eventId: string): Promise<TicketType[]> {
    const response = await apiClient<{ tickets: ApiAdminTicketType[] }>(`/event/ticket/get?eventId=${eventId}`);
    return response.tickets.map(transformApiAdminTicketToTicketType);
}

/**
 * Creates a new ticket for an event.
 */
export async function createTicket(payload: CreateTicketPayload): Promise<any> {
    return apiClient('/event/ticket/create', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}

/**
 * Updates an existing ticket.
 */
export async function updateTicket(ticketId: string, payload: UpdateTicketPayload): Promise<any> {
    return apiClient(`/event/ticket/update?ticketId=${ticketId}`, {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}
