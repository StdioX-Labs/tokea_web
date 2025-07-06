'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { events } from '@/lib/events';
import type { Event } from '@/lib/types';
import { Loader2, Search, XCircle, FileQuestion } from 'lucide-react';
import { format, isSameDay } from 'date-fns';

interface SearchDrawerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const uniqueLocations = [...new Set(events.map(event => event.location))];

export default function SearchDrawer({ isOpen, onOpenChange }: SearchDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [results, setResults] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

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
        setTimeout(() => {
          let filteredEvents = events;

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
              isSameDay(new Date(event.date), date)
            );
          }
          
          setResults(filteredEvents);
          setIsLoading(false);
        }, 500); 
      } else {
        setResults([]);
        setHasSearched(false);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, location, date]);
  
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
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : hasSearched ? (
            results.length > 0 ? (
              <ul className="space-y-2">
                {results.map(event => (
                  <li key={event.id}>
                    <Link href={`/events/${event.id}`} onClick={() => onOpenChange(false)} className='block p-3 rounded-md hover:bg-muted'>
                        <p className="font-semibold">{event.name}</p>
                        <p className="text-sm text-muted-foreground">{event.location} - {format(new Date(event.date), 'PPP')}</p>
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
