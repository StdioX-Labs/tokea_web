'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { events } from '@/lib/events';
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

export default function EventsPage() {
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


  const handleModalClose = () => {
    setModalState({ isOpen: false, mode: 'add', event: null });
  }
  
  const handleManageTicketsModalClose = () => {
     setManageTicketsModalState({ isOpen: false, event: null });
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
                          <DropdownMenuItem>Promotions</DropdownMenuItem>
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
          </CardContent>
        </Card>
      </div>
    </>
  );
}
