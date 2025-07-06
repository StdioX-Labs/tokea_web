import { apiClient } from '@/lib/api-client';
import type { Event, TicketType } from '@/lib/types';

// These interfaces describe the shape of the data from the remote API
interface ApiTicketType {
  id: number;
  ticket_name: string;
  ticket_price: string;
  quantity_available: number;
  tickets_to_issue: number;
  ticket_limit_per_person: number;
  sale_start_date: string;
  sale_end_date: string;
  is_active: boolean;
}

interface ApiEvent {
  id: number;
  event_name: string;
  event_start_date: string;
  event_end_date: string | null;
  event_location: string;
  event_poster_url: string;
  event_description: string;
  event_venue_name: string;
  event_venue_address: string;
  event_venue_capacity: number;
  is_featured: number; // 0 or 1
  tickets: ApiTicketType[];
}

// Transformer functions to convert API data into our app's data types
function transformApiTicketTypeToTicketType(apiTicket: ApiTicketType): TicketType {
  return {
    id: String(apiTicket.id),
    name: apiTicket.ticket_name,
    price: parseFloat(apiTicket.ticket_price) || 0,
    quantityAvailable: apiTicket.quantity_available,
    ticketsToIssue: apiTicket.tickets_to_issue,
    ticketLimitPerPerson: apiTicket.ticket_limit_per_person,
    saleStartDate: apiTicket.sale_start_date,
    saleEndDate: apiTicket.sale_end_date,
    status: apiTicket.is_active ? 'active' : 'disabled',
  };
}

function transformApiEventToEvent(apiEvent: ApiEvent): Event {
  return {
    id: String(apiEvent.id),
    name: apiEvent.event_name,
    date: apiEvent.event_start_date,
    endDate: apiEvent.event_end_date || undefined,
    location: apiEvent.event_location,
    posterImage: apiEvent.event_poster_url,
    posterImageHint: 'event poster', // Default value
    description: apiEvent.event_description,
    isFeatured: apiEvent.is_featured === 1,
    artists: [], // API doesn't have this, use default
    venue: {
      name: apiEvent.event_venue_name,
      address: apiEvent.event_venue_address,
      capacity: apiEvent.event_venue_capacity,
    },
    ticketTypes: apiEvent.tickets?.map(transformApiTicketTypeToTicketType) || [],
    promotions: [], // API doesn't have this, use default
  };
}

/**
 * Fetches all events from the API.
 * Note: The list endpoint does not include detailed ticket info.
 */
export async function getEvents(): Promise<Event[]> {
  const response = await apiClient<{ data: ApiEvent[] }>('/events');
  return response.data.map(transformApiEventToEvent);
}

/**
 * Fetches a single event by its ID, including detailed ticket info.
 */
export async function getEventById(id: string): Promise<Event | null> {
  try {
    const response = await apiClient<{ data: ApiEvent }>(`/events/${id}`);
    if (!response.data) return null;
    return transformApiEventToEvent(response.data);
  } catch (error) {
    console.error(`Error fetching event ${id}:`, error);
    return null;
  }
}
