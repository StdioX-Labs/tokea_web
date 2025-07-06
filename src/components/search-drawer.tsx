'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { getEvents } from '@/services/event-service';
import type { Event } from '@/lib/types';
import { Loader2, Search, XCircle, FileQuestion } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';

interface SearchDrawerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function SearchDrawer({ isOpen, onOpenChange }: SearchDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [results, setResults] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [uniqueLocations, setUniqueLocations] = useState<string[]>([]);

  // Fetch initial data when drawer opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      async function fetchInitialData() {
        try {
          const events = await getEvents();
          setAllEvents(events);
          const locations = [...new Set(events.map(event => event.location).filter(Boolean))];
          setUniqueLocations(locations);
        } catch (error) {
          console.error("Failed to fetch events for search", error);
        } finally {
          setIsLoading(false);
        }
      }
      fetchInitialData();
    }
  }, [isOpen]);


  const resetFilters = () => {
    setSearchQuery('');
    setLocation('');
    setDate(undefined);
    setResults([]);
    setHasSearched(false);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery || location || date) {
        setIsLoading(true);
        setHasSearched(true);
        
        // Simulating network delay for filtering, as data is already client-side
        setTimeout(() => {
          let filteredEvents = allEvents;

          if (searchQuery) {
            filteredEvents = filteredEvents.filter(event =>
              event.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }

          if (location) {
            filteredEvents = filteredEvents.filter(event => event.location === location);
          }

          if (date) {
            filteredEvents = filteredEvents.filter(event =>
              isSameDay(parseISO(event.date), date)
            );
          }
          
          setResults(filteredEvents);
          setIsLoading(false);
        }, 300); 
      } else {
        setResults([]);
        setHasSearched(false);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, location, date, allEvents]);
  
  useEffect(() => {
    if(!isOpen) {
        resetFilters();
    }
  }, [isOpen])

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="top" className="h-auto max-h-[90vh] flex flex-col">
        <SheetHeader>
          <SheetTitle className='font-headline'>Search for Events</SheetTitle>
          <SheetDescription>Find your next experience. Use the filters below to narrow your search.</SheetDescription>
        </SheetHeader>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 py-4">
          <div className="relative col-span-1 sm:col-span-2 md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by event name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              {uniqueLocations.map(loc => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <DatePicker date={date} setDate={setDate} />
        </div>

        <div className="flex justify-start mb-4">
          <Button variant="ghost" onClick={resetFilters} className="text-sm">
            <XCircle className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        </div>
        
        <div className="flex-grow overflow-y-auto">
          {isLoading && !hasSearched ? (
             <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : hasSearched && isLoading ? (
             <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : hasSearched ? (
            results.length > 0 ? (
              <ul className="space-y-2">
                {results.map(event => (
                  <li key={event.id}>
                    <Link href={`/events/${event.slug}`} onClick={() => onOpenChange(false)} className='block p-3 rounded-md hover:bg-muted'>
                        <p className="font-semibold">{event.name}</p>
                        <p className="text-sm text-muted-foreground">{event.location} - {format(parseISO(event.date), 'PPP')}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                 <FileQuestion className="h-12 w-12 mb-4" />
                 <p className="font-semibold">No results found</p>
                 <p className="text-sm">Try adjusting your search or filters.</p>
              </div>
            )
          ) : null }
        </div>

      </SheetContent>
    </Sheet>
  );
}
