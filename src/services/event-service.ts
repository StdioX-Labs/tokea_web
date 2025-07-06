import { apiClient } from '@/lib/api-client';
import type { Event, TicketType } from '@/lib/types';

// These interfaces describe the shape of the data from the remote API, using camelCase
interface ApiTicketType {
  id: number;
  ticketName: string;
  ticketPrice: string;
  quantityAvailable: number;
  ticketsToIssue: number;
  ticketLimitPerPerson: number;
  saleStartDate: string;
  saleEndDate: string;
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
  eventVenueName: string;
  eventVenueAddress: string;
  eventVenueCapacity: number;
  isFeatured: number; // 0 or 1
  tickets: ApiTicketType[];
}

// Transformer functions to convert API data into our app's data types
function transformApiTicketTypeToTicketType(apiTicket: ApiTicketType): TicketType {
  return {
    id: String(apiTicket.id),
    name: apiTicket.ticketName,
    price: parseFloat(apiTicket.ticketPrice) || 0,
    quantityAvailable: apiTicket.quantityAvailable,
    ticketsToIssue: apiTicket.ticketsToIssue,
    ticketLimitPerPerson: apiTicket.ticketLimitPerPerson,
    saleStartDate: apiTicket.saleStartDate,
    saleEndDate: apiTicket.saleEndDate,
    status: apiTicket.isActive ? 'active' : 'disabled',
  };
}

function transformApiEventToEvent(apiEvent: ApiEvent): Event {
  return {
    id: String(apiEvent.id),
    name: apiEvent.eventName,
    date: apiEvent.eventStartDate,
    endDate: apiEvent.eventEndDate || undefined,
    location: apiEvent.eventLocation,
    posterImage: apiEvent.eventPosterUrl,
    posterImageHint: 'event poster', // Default value
    description: apiEvent.eventDescription,
    isFeatured: apiEvent.isFeatured === 1,
    artists: [], // API doesn't have this, use default
    venue: {
      name: apiEvent.eventVenueName,
      address: apiEvent.eventVenueAddress,
      capacity: apiEvent.eventVenueCapacity,
    },
    ticketTypes: apiEvent.tickets?.map(transformApiTicketTypeToTicketType) || [],
    promotions: [], // API doesn't have this, use default
  };
}

/**
 * Fetches all events from the API.
 */
export async function getEvents(): Promise<Event[]> {
  const response = await apiClient<{ data: ApiEvent[] }>('/events/get/all');
  return response.data.map(transformApiEventToEvent);
}

/**
 * Fetches a single event by its ID, including detailed ticket info.
 */
export async function getEventById(id: string): Promise<Event | null> {
  try {
    const response = await apiClient<{ data: ApiEvent }>(`/events/get/${id}`);
    if (!response.data) return null;
    return transformApiEventToEvent(response.data);
  } catch (error) {
    console.error(`Error fetching event ${id}:`, error);
    return null;
  }
}
