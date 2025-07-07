'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { getEvents } from '@/services/event-service';
import { format } from 'date-fns';
import type { Event } from '@/lib/types';
import { AddEventModal } from '@/components/add-event-modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ManageTicketsModal } from '@/components/manage-tickets-modal';
import { ManagePromotionsModal } from '@/components/manage-promotions-modal';
import { Skeleton } from '@/components/ui/skeleton';

function EventsPageSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Event Name</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(5)].map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}


export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit' | 'view';
    event: Event | null;
  }>({
    isOpen: false,
    mode: 'add',
    event: null,
  });

  const [manageTicketsModalState, setManageTicketsModalState] = useState<{
    isOpen: boolean;
    event: Event | null;
  }>({ isOpen: false, event: null });

  const [managePromotionsModalState, setManagePromotionsModalState] = useState<{
    isOpen: boolean;
    event: Event | null;
  }>({ isOpen: false, event: null });

  useEffect(() => {
    async function fetchEvents() {
      try {
        const fetchedEvents = await getEvents();
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchEvents();
  }, []);


  const handleAddNew = () => {
    setModalState({ isOpen: true, mode: 'add', event: null });
  };

  const handleEdit = (event: Event) => {
    setModalState({ isOpen: true, mode: 'edit', event });
  };
  
  const handleView = (event: Event) => {
    setModalState({ isOpen: true, mode: 'view', event });
  };
  
  const handleManageTickets = (event: Event) => {
    setManageTicketsModalState({ isOpen: true, event });
  };

  const handleManagePromotions = (event: Event) => {
    setManagePromotionsModalState({ isOpen: true, event });
  };


  const handleModalClose = () => {
    setModalState({ isOpen: false, mode: 'add', event: null });
  }
  
  const handleManageTicketsModalClose = () => {
     setManageTicketsModalState({ isOpen: false, event: null });
  }

  const handleManagePromotionsModalClose = () => {
    setManagePromotionsModalState({ isOpen: false, event: null });
  }

  return (
    <>
      <AddEventModal
        isOpen={modalState.isOpen}
        onOpenChange={handleModalClose}
        event={modalState.event}
        mode={modalState.mode}
      />
      <ManageTicketsModal
        isOpen={manageTicketsModalState.isOpen}
        onOpenChange={handleManageTicketsModalClose}
        event={manageTicketsModalState.event}
      />
      <ManagePromotionsModal
        isOpen={managePromotionsModalState.isOpen}
        onOpenChange={handleManagePromotionsModalClose}
        event={managePromotionsModalState.event}
      />
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">
              Manage Events
            </h1>
            <p className="text-muted-foreground">
              Create, edit, and manage all your events.
            </p>
          </div>
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All Events</CardTitle>
            <CardDescription>
              A list of all events in your system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <EventsPageSkeleton />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.name}</TableCell>
                      <TableCell>{format(new Date(event.date), 'PP')}</TableCell>
                      <TableCell>{event.location}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            new Date(event.date) > new Date()
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {new Date(event.date) > new Date()
                            ? 'Upcoming'
                            : 'Past'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">More options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(event)}>View</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(event)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleManageTickets(event)}>Manage Tickets</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleManagePromotions(event)}>
                              Promotions
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Deactivate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
