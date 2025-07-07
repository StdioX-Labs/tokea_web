'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import TicketSelectionDrawer from '@/components/ticket-selection-drawer';
import { Calendar, MapPin, Users } from 'lucide-react';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { Separator } from '@/components/ui/separator';
import type { Event } from '@/lib/types';
import { getEventBySlug } from '@/services/event-service';

export default function EventDetailsPage({ params }: { params: { slug: string } }) {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const fetchedEvent = await getEventBySlug(params.slug);
        if (!fetchedEvent) {
          notFound();
        }
        setEvent(fetchedEvent);
      } catch (error) {
        console.error("Failed to fetch event details", error);
        notFound();
      } finally {
        setIsLoading(false);
      }
    }
    fetchEvent();
  }, [params.slug]);


  if (isLoading) {
    return <div className="container py-12 text-center">Loading event...</div>;
  }

  if (!event) {
    return notFound();
  }

  const minPrice = event.ticketTypes.length > 0 
    ? Math.min(...event.ticketTypes.map((t) => t.price)) 
    : 0;

  return (
    <>
      <div className="bg-background">
        <div className="container mx-auto max-w-6xl px-4 py-8 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            {/* Image Column */}
            <div className="w-full lg:sticky top-24">
              <Image
                src={event.posterImage}
                alt={`Poster for ${event.name}`}
                width={800}
                height={1200}
                className="w-full h-auto object-cover rounded-xl shadow-lg aspect-[2/3] transition-transform duration-300 hover:scale-105"
                data-ai-hint={event.posterImageHint}
                priority
              />
            </div>

            {/* Details Column */}
            <div className="w-full">
              <div className="flex flex-col h-full md:py-4">
                 <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</span>
                      <span className='mx-3'>|</span>
                      <MapPin className="mr-2 h-4 w-4" />
                      <span>{event.location}</span>
                    </div>

                <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-balance">
                  {event.name}
                </h1>

                <p className="mt-4 text-3xl font-bold text-accent">
                    {event.ticketTypes.length > 1 ? `From KES ${minPrice.toFixed(2)}` : (event.ticketTypes.length === 1 ? `KES ${minPrice.toFixed(2)}` : 'Free')}
                </p>
                
                <div className="mt-8">
                    <ShimmerButton
                        size="lg"
                        className="w-full"
                        onClick={() => setDrawerOpen(true)}
                        disabled={event.ticketTypes.length === 0}
                    >
                        {event.ticketTypes.length > 0 ? 'Buy Tickets' : 'Tickets Not Available'}
                    </ShimmerButton>
                </div>
                
                <Separator className="my-8" />
                
                <h3 className='text-xl font-bold font-headline mb-4'>About this event</h3>
                <div className="text-muted-foreground space-y-4 leading-relaxed">
                    <p>{event.description}</p>
                </div>

                <div className="mt-8">
                  <Accordion type="single" collapsible className="w-full">
                    {event.artists.length > 0 && (
                      <AccordionItem value="artists">
                        <AccordionTrigger className='text-base font-semibold'>Featuring Artists</AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-3 pt-2">
                            {event.artists.map((artist) => (
                              <li key={artist.name} className="flex items-baseline">
                                <span className="font-semibold text-foreground">{artist.name}</span>
                                <span className="ml-2 text-sm text-muted-foreground">{artist.role}</span>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                    <AccordionItem value="venue">
                      <AccordionTrigger className='text-base font-semibold'>Venue Details</AccordionTrigger>
                      <AccordionContent>
                         <div className="space-y-1 pt-2">
                           <p className="font-semibold text-foreground">{event.venue.name}</p>
                           <p className="text-muted-foreground">{event.venue.address}</p>
                           {event.venue.capacity > 0 && (
                            <p className="text-muted-foreground mt-2 flex items-center"><Users className="mr-2 h-4 w-4"/>Capacity: {event.venue.capacity.toLocaleString()}</p>
                           )}
                         </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TicketSelectionDrawer event={event} isOpen={isDrawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
}
