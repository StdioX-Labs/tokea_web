'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Event, TicketType } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Edit, ToggleLeft, ToggleRight, Loader2, Eye, Trash2, AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddTicketModal } from './add-ticket-modal';
import { format } from 'date-fns';
import { getEventTickets, updateTicketStatus } from '@/services/event-service';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  const [deletingTicketId, setDeletingTicketId] = useState<string | null>(null);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchTickets = useCallback(async () => {
    if (event) {
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
  }, [event, toast]);

  useEffect(() => {
    if (isOpen) {
      fetchTickets();
    }
  }, [isOpen, fetchTickets]);

  const handleAddTicket = () => {
    setEditingTicket(null);
    setAddTicketModalOpen(true);
  };

  const handleEditTicket = (ticket: TicketType) => {
    setEditingTicket(ticket);
    setAddTicketModalOpen(true);
  };

  const handleDeleteTicket = async () => {
    if (deletingTicketId) {
      try {
        // Call the delete API here
        // await deleteTicket(deletingTicketId);
        toast({ variant: 'success', title: 'Success', description: 'Ticket deleted successfully.' });
        setDeletingTicketId(null);
        setAlertDialogOpen(false);
        fetchTickets();
      } catch (error) {
        console.error("Failed to delete ticket:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete ticket.' });
      }
    }
  };

  const handleStatusToggle = async (ticket: TicketType) => {
    try {
      await updateTicketStatus(ticket.id, { status: ticket.status === 'active' ? 'inactive' : 'active' });
      toast({ variant: 'success', title: 'Success', description: `Ticket ${ticket.status === 'active' ? 'disabled' : 'enabled'} successfully.` });
      fetchTickets();
    } catch (error) {
      console.error("Failed to update ticket status:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update ticket status.' });
    }
  };

  if (!event) return null;

  return (
    <>
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
                                  <DropdownMenuItem onClick={() => handleStatusToggle(ticket)}>
                                      {ticket.status === 'active' ? <ToggleLeft className="mr-2 h-4 w-4" /> : <ToggleRight className="mr-2 h-4 w-4" />}
                                      {ticket.status === 'active' ? 'Disable' : 'Enable'}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => { setDeletingTicketId(ticket.id); setAlertDialogOpen(true); }}>
                                      <Trash2 className="mr-2 h-4 w-4" /> Delete
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
        </DialogContent>
      </Dialog>
      <AddTicketModal 
          isOpen={addTicketModalOpen} 
          onOpenChange={setAddTicketModalOpen} 
          ticket={editingTicket}
          eventId={event.id}
          onSuccess={fetchTickets}
      />
      <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this ticket? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAlertDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTicket} className="bg-red-500 hover:bg-red-600">
              <Trash2 className="mr-2 h-4 w-4" /> Delete Ticket
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
