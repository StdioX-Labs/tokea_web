import { apiClient } from '@/lib/api-client';
import type { Event, TicketType } from '@/lib/types';

// These interfaces describe the shape of the data from the remote API, using camelCase
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
  tickets: ApiTicketType[];
  category: string;
  slug: string;
}

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

/**
 * Fetches all events from the API.
 */
export async function getEvents(): Promise<Event[]> {
  const response = await apiClient<{ events: ApiEvent[] }>('/events/get/all');
  return response.events.map(transformApiEventToEvent);
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
