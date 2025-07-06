'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import { getEventById } from '@/lib/events';
import Image from 'next/image';
import { format } from 'date-fns';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import TicketSelectionDrawer from '@/components/ticket-selection-drawer';
import { Calendar, MapPin, Users, Mic, Building, Info } from 'lucide-react';

export default function EventDetailsPage({ params }: { params: { id: string } }) {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const event = getEventById(params.id);

  if (!event) {
    notFound();
  }

  return (
    <>
      <div className="relative min-h-screen">
        {/* Background Image */}
        <Image
          src={event.posterImage}
          alt={`Background for ${event.name}`}
          layout="fill"
          objectFit="cover"
          className="opacity-10 blur-lg"
          data-ai-hint={event.posterImageHint}
        />
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />

        {/* Content */}
        <div className="container relative py-12 md:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              <div className="md:col-span-1">
                <Image
                  src={event.posterImage}
                  alt={`Poster for ${event.name}`}
                  width={400}
                  height={600}
                  className="w-full rounded-lg shadow-2xl aspect-[2/3] object-cover"
                  data-ai-hint={event.posterImageHint}
                />
              </div>
              <div className="md:col-span-2">
                <div className="bg-card/80 backdrop-blur-md p-6 rounded-lg shadow-lg">
                  <h1 className="font-headline text-4xl font-bold tracking-tight text-balance">
                    {event.name}
                  </h1>
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-lg text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      <span>{format(new Date(event.date), 'MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-5 w-5" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <div className="mt-8">
                    <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger className='font-headline text-lg'><Info className='mr-2' />Description</AccordionTrigger>
                        <AccordionContent className="text-base">
                          {event.description}
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-2">
                        <AccordionTrigger className='font-headline text-lg'><Mic className='mr-2' />Artists</AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-2">
                            {event.artists.map((artist) => (
                              <li key={artist.name}>
                                <span className="font-semibold">{artist.name}</span> - <span className="text-muted-foreground">{artist.role}</span>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-3">
                        <AccordionTrigger className='font-headline text-lg'><Building className='mr-2' />Venue</AccordionTrigger>
                        <AccordionContent>
                           <p><span className="font-semibold">{event.venue.name}</span></p>
                           <p className="text-muted-foreground">{event.venue.address}</p>
                           <p className="text-muted-foreground mt-2 flex items-center"><Users className="mr-2 h-4 w-4"/>Capacity: {event.venue.capacity.toLocaleString()}</p>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                  
                  <Button
                    size="lg"
                    className="mt-8 w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6"
                    onClick={() => setDrawerOpen(true)}
                  >
                    Buy Tickets
                  </Button>
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
