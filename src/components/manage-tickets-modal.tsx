'use client';

import { useState, useEffect } from 'react';
import type { Event, TicketType } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Edit, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddTicketModal } from './add-ticket-modal';
import { format } from 'date-fns';
import { getEventTickets } from '@/services/event-service';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';

interface ManageTicketsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  event: Event | null;
}

function TicketsTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticket Name</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Qty Available</TableHead>
          <TableHead>Sale Dates</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(3)].map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function ManageTicketsModal({ isOpen, onOpenChange, event }: ManageTicketsModalProps) {
  const [addTicketModalOpen, setAddTicketModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketType | null>(null);
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchTickets() {
      if (isOpen && event) {
        setIsLoading(true);
        try {
          const fetchedTickets = await getEventTickets(event.id);
          setTickets(fetchedTickets);
        } catch (error) {
          console.error("Failed to fetch tickets:", error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not load ticket information.' });
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchTickets();
  }, [isOpen, event, toast]);

  const handleAddTicket = () => {
    setEditingTicket(null);
    setAddTicketModalOpen(true);
  };

  const handleEditTicket = (ticket: TicketType) => {
    setEditingTicket(ticket);
    setAddTicketModalOpen(true);
  };
  
  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle className="font-headline text-2xl">Manage Tickets</DialogTitle>
              <DialogDescription>For event: {event.name}</DialogDescription>
            </div>
            <Button onClick={handleAddTicket}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Ticket
            </Button>
          </div>
        </DialogHeader>

        <div className="py-4 max-h-[60vh] overflow-y-auto pr-4">
            {isLoading ? (
                <TicketsTableSkeleton />
            ) : tickets.length > 0 ? (
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ticket Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Qty Available</TableHead>
                            <TableHead>Sale Dates</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tickets.map((ticket) => (
                        <TableRow key={ticket.id}>
                            <TableCell className="font-medium">{ticket.name}</TableCell>
                            <TableCell>KES {ticket.price.toFixed(2)}</TableCell>
                            <TableCell>{ticket.quantityAvailable}</TableCell>
                             <TableCell>{`${format(new Date(ticket.saleStartDate), 'PP')} - ${format(new Date(ticket.saleEndDate), 'PP')}`}</TableCell>
                            <TableCell>
                                <Badge variant={ticket.status === 'active' ? 'default' : 'secondary'}>{ticket.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditTicket(ticket)}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    {ticket.status === 'active' ? <ToggleLeft className="mr-2 h-4 w-4" /> : <ToggleRight className="mr-2 h-4 w-4" />}
                                    {ticket.status === 'active' ? 'Disable' : 'Enable'}
                                </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center py-10 bg-muted rounded-md">
                    <p className="font-semibold">No tickets found for this event.</p>
                    <p className="text-sm text-muted-foreground">Click "Add Ticket" to get started.</p>
                </div>
            )}
        </div>

         <AddTicketModal 
            isOpen={addTicketModalOpen} 
            onOpenChange={setAddTicketModalOpen} 
            ticket={editingTicket}
        />
      </DialogContent>
    </Dialog>
  );
}
