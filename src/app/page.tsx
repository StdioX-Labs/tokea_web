'use client';

import EventCard from '@/components/event-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { events } from '@/lib/events';
import Link from 'next/link';
import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effect';
import { motion } from 'framer-motion';
import { ShimmerButton } from '@/components/ui/shimmer-button';

export default function Home() {
  const featuredEvents = events.filter((event) => event.isFeatured);
  const upcomingEvents = events;

  const titleWords = [
    { text: 'Experience' },
    { text: 'the' },
    { text: 'Vibe' },
    { text: 'of' },
    { text: 'Summer', className: 'text-accent' },
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
              <Link href="#featured-events">
                <ShimmerButton size="lg">
                  Browse Events
                </ShimmerButton>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Events Carousel */}
      <section id="featured-events" className="w-full py-12 md:py-24">
        <div className="container">
          <h2 className="text-3xl font-bold tracking-tighter font-headline mb-8">
            Featured Events
          </h2>
          <Carousel
            opts={{
              align: 'start',
              loop: true,
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

      {/* Upcoming Events Grid */}
      <section
        id="upcoming-events"
        className="w-full pb-12 md:pb-24 lg:pb-32 bg-muted/50 pt-12 md:pt-24"
      >
        <div className="container">
          <h2 className="text-3xl font-bold tracking-tighter font-headline mb-8">
            All Upcoming Events
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
