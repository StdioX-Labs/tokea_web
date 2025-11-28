'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Power, PowerOff } from 'lucide-react';
import { getUserEvents, activateEvent } from '@/services/event-service';
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
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
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

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      // Using getUserEvents with userId=3 as requested
      const fetchedEvents = await getUserEvents('3');
      setEvents(fetchedEvents);
    } catch (error) {
      console.error("Failed to fetch user events:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch events.' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);


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

  const handleToggleStatus = async (event: Event) => {
    if (event.isActive) {
      toast({ title: 'Info', description: 'Deactivation endpoint not yet implemented.' });
      return;
    }
    try {
      await activateEvent(event.id);
      toast({ title: 'Success', description: `Event "${event.name}" activated.` });
      fetchEvents();
    } catch (error) {
      console.error("Failed to activate event:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to activate event.' });
    }
  };


  const handleModalClose = () => {
    setModalState({ isOpen: false, mode: 'add', event: null });
  }

  const handleModalSuccess = () => {
    setModalState({ isOpen: false, mode: 'add', event: null });
    fetchEvents();
  };

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
        onSuccess={handleModalSuccess}
        event={modalState.event}
        mode={modalState.mode}
      />
      {manageTicketsModalState.event && (
        <ManageTicketsModal
          isOpen={manageTicketsModalState.isOpen}
          onOpenChange={handleManageTicketsModalClose}
          event={manageTicketsModalState.event}
        />
      )}
      <ManagePromotionsModal
        isOpen={managePromotionsModalState.isOpen}
        onOpenChange={handleManagePromotionsModalClose}
        event={managePromotionsModalState.event}
      />
      <div className="p-4 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-headline">
              Manage Events
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Create, edit, and manage all your events.
            </p>
          </div>
          <Button onClick={handleAddNew} className="w-full sm:w-auto">
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
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">Event Name</TableHead>
                      <TableHead className="hidden sm:table-cell min-w-[120px]">Date</TableHead>
                      <TableHead className="hidden md:table-cell min-w-[150px]">Location</TableHead>
                      <TableHead className="min-w-[80px]">Status</TableHead>
                      <TableHead className="text-right min-w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col gap-1">
                            <span>{event.name}</span>
                            <span className="text-xs text-muted-foreground sm:hidden">
                              {format(new Date(event.date), 'PP')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{format(new Date(event.date), 'PP')}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="line-clamp-1" title={event.location}>{event.location}</span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              event.isActive
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {event.isActive
                              ? 'Active'
                              : 'Inactive'}
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
                              <DropdownMenuItem onClick={() => handleToggleStatus(event)} disabled={event.isActive}>
                                {event.isActive ? <PowerOff className="mr-2 h-4 w-4" /> : <Power className="mr-2 h-4 w-4" />}
                                {event.isActive ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
