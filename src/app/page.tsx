import EventCard from '@/components/event-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { events } from '@/lib/events';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const featuredEvents = events.filter((event) => event.isFeatured);
  const upcomingEvents = events;

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter font-headline sm:text-5xl xl:text-6xl/none text-balance">
                  Experience the Vibe of Summer
                </h1>
                <p className="max-w-[600px] text-primary-foreground/80 md:text-xl">
                  From sun-drenched festivals to intimate evening concerts, find and book tickets for the best events of the season.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href="#upcoming-events">
                    Browse Events
                  </Link>
                </Button>
              </div>
            </div>
            <Image
              src="https://placehold.co/600x600.png"
              width="600"
              height="600"
              alt="Hero"
              className="mx-auto aspect-square overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              data-ai-hint="happy people concert"
            />
          </div>
        </div>
      </section>
      
      {/* Featured Events Carousel */}
      <section className="w-full py-12 md:py-24">
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
                <CarouselItem key={event.id} className="md:basis-1/2 lg:basis-1/3">
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
      <section id="upcoming-events" className="w-full pb-12 md:pb-24 lg:pb-32 bg-muted/50 pt-12 md:pt-24">
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
