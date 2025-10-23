import type { Event } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useMemo } from 'react';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const [imageError, setImageError] = useState(false);

  // Process the image URL to handle encoding issues
  const imageUrl = useMemo(() => {
    try {
      // First decode the URL in case it's already encoded from the API
      const decodedUrl = decodeURIComponent(event.posterImage);

      // Handle relative URLs if needed
      if (decodedUrl.startsWith('/')) {
        return `https://api.soldoutafrica.com${decodedUrl}`;
      }

      // Return the properly decoded URL
      return decodedUrl;
    } catch (error) {
      console.error(`Error processing image URL for ${event.name}:`, error);
      return event.posterImage; // Fallback to original if decoding fails
    }
  }, [event.posterImage, event.name]);

  return (
    <Link href={`/events/${event.slug}`} className="group block">
      <div className="overflow-hidden rounded-lg bg-card text-card-foreground shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        {imageError ? (
          <div className="aspect-[2/3] w-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">Image unavailable</span>
          </div>
        ) : (
          <Image
            src={imageUrl}
            alt={`Poster for ${event.name}`}
            width={400}
            height={600}
            className="aspect-[2/3] w-full object-cover"
            data-ai-hint={event.posterImageHint}
            onError={() => {
              console.error(`Failed to load image: ${imageUrl}`);
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
