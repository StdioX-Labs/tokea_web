'use client';

import { useState, useEffect } from 'react';
import EventCard from '@/components/event-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { getEvents } from '@/services/event-service';
import type { Event } from '@/lib/types';
import Link from 'next/link';
import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effect';
import { motion } from 'framer-motion';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarX } from 'lucide-react';

function EventCarouselSkeleton() {
  return (
    <div className="flex space-x-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="min-w-0 shrink-0 grow-0 basis-full md:basis-1/2 lg:basis-1/3 p-1">
          <Skeleton className="aspect-[2/3] w-full rounded-lg" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EventGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
       {[...Array(8)].map((_, i) => (
        <div key={i}>
          <Skeleton className="aspect-[2/3] w-full rounded-lg" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}


export default function Home() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const events = await getEvents();
        setAllEvents(events);
      } catch (error) {
        console.error("Failed to fetch events", error);
        // On error, allEvents remains empty, which will trigger the empty state.
      } finally {
        setIsLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const featuredEvents = allEvents.filter((event) => event.isFeatured).slice(0, 3);
  const upcomingEvents = allEvents;

  const titleWords = [
    { text: 'Experience' },
    { text: 'the' },
    { text: 'Vibe' },
    { text: 'of' },
    { text: 'Tokea', className: 'text-accent' },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-20 md:py-32 lg:py-40 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <TypewriterEffectSmooth words={titleWords} />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
              className="max-w-[700px] text-primary-foreground/80 md:text-xl text-balance"
            >
              From sun-drenched festivals to intimate evening concerts, find and
              book tickets for the best events of the season.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.8 }}
            >
              <Link href="#events">
                <ShimmerButton size="lg">
                  Browse Events
                </ShimmerButton>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Events Carousel - Only render if there are featured events */}
       {!isLoading && featuredEvents.length > 0 && (
        <section id="featured-events" className="w-full py-12 md:py-24">
            <div className="container">
            <h2 className="text-3xl font-bold tracking-tighter font-headline mb-8">
                Featured Events
            </h2>
            <Carousel
                opts={{
                align: 'start',
                loop: featuredEvents.length > 2,
                }}
                className="w-full"
            >
                <CarouselContent>
                {featuredEvents.map((event) => (
                    <CarouselItem
                    key={event.id}
                    className="md:basis-1/2 lg:basis-1/3"
                    >
                    <div className="p-1">
                        <EventCard event={event} />
                    </div>
                    </CarouselItem>
                ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
            </div>
        </section>
       )}

      {/* Upcoming Events Grid */}
      <section
        id="events"
        className="w-full pb-12 md:pb-24 lg:pb-32 bg-muted/50 pt-12 md:pt-24"
      >
        <div className="container">
          <h2 className="text-3xl font-bold tracking-tighter font-headline mb-8">
            All Upcoming Events
          </h2>
           {isLoading ? (
            <EventGridSkeleton />
           ) : upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-lg border">
                <CalendarX className="h-16 w-16 mb-4 text-muted-foreground" />
                <h3 className="text-2xl font-bold">No Events Available</h3>
                <p className="mt-2 text-muted-foreground max-w-md">
                  It seems there are no events scheduled at the moment. Please check back later or contact support if you believe this is an error.
                </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
