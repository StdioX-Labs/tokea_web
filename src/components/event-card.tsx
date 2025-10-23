import type { Event } from '@/lib/types';
import Link from 'next/link';
import { Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link href={`/events/${event.slug}`} className="group block">
      <div className="overflow-hidden rounded-lg bg-card text-card-foreground shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        {imageError ? (
          <div className="aspect-[2/3] w-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">Image unavailable</span>
          </div>
        ) : (
          <img
            src={event.posterImage}
            alt={`Poster for ${event.name}`}
            className="aspect-[2/3] w-full object-cover"
            loading="lazy"
            onError={() => {
              console.error(`Failed to load image: ${event.posterImage}`);
              setImageError(true);
            }}
          />
        )}
        <div className="p-4">
          <h3 className="font-headline text-xl font-bold truncate">{event.name}</h3>
          <div className="mt-2 flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>{format(new Date(event.date), 'eee, MMM d, yyyy')}</span>
          </div>
          <div className="mt-1 flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4" />
            <span>{event.location}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
