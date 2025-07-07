'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import type { TicketType } from '@/lib/types';
import { Separator } from './ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { createTicket, updateTicket, type CreateTicketPayload, type UpdateTicketPayload } from '@/services/event-service';

const ticketFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  price: z.coerce.number().min(0, 'Price must be 0 or more.'),
  quantityAvailable: z.coerce.number().int().min(1, 'Quantity must be at least 1.'),
  ticketsToIssue: z.coerce.number().int().min(1, 'Must issue at least 1 ticket.').default(1),
  ticketLimitPerPerson: z.coerce.number().int().min(0, 'Limit must be 0 or more. 0 for unlimited.').default(0),
  numberOfComplementary: z.coerce.number().int().min(0, 'Must be 0 or more.').default(0),
  saleStartDate: z.date({ required_error: 'Sale start date is required.' }),
  saleEndDate: z.date({ required_error: 'Sale end date is required.' }),
});

interface AddTicketModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
  ticket?: TicketType | null;
  eventId: string | null;
}

export function AddTicketModal({ isOpen, onOpenChange, onSuccess, ticket, eventId }: AddTicketModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mode = ticket ? 'edit' : 'add';

  const form = useForm<z.infer<typeof ticketFormSchema>>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      name: '',
      price: 0,
      quantityAvailable: 100,
      ticketsToIssue: 1,
      ticketLimitPerPerson: 0,
      numberOfComplementary: 0,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (ticket) {
        form.reset({
          name: ticket.name,
          price: ticket.price,
          quantityAvailable: ticket.quantityAvailable,
          ticketsToIssue: ticket.ticketsToIssue,
          ticketLimitPerPerson: ticket.ticketLimitPerPerson,
          // Since numberOfComplementary is not part of TicketType, we can't pre-fill it for edit.
          // Defaulting to 0, or you can add it to your TicketType interface.
          numberOfComplementary: 0, 
          saleStartDate: new Date(ticket.saleStartDate),
          saleEndDate: new Date(ticket.saleEndDate),
        });
      } else {
        form.reset({
          name: '',
          price: 0,
          quantityAvailable: 100,
          ticketsToIssue: 1,
          ticketLimitPerPerson: 0,
          numberOfComplementary: 0,
          saleStartDate: new Date(),
          saleEndDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Default to 30 days from now
        });
      }
    }
  }, [ticket, isOpen, form]);

  async function onSubmit(values: z.infer<typeof ticketFormSchema>) {
    setIsSubmitting(true);
    
    const commonPayload = {
        ticketName: values.name,
        ticketPrice: values.price,
        quantityAvailable: values.quantityAvailable,
        ticketsToIssue: values.ticketsToIssue,
        ticketLimitPerPerson: values.ticketLimitPerPerson,
        numberOfComplementary: values.numberOfComplementary,
        ticketSaleStartDate: values.saleStartDate.toISOString(),
        ticketSaleEndDate: values.saleEndDate.toISOString(),
        isFree: values.price === 0,
    }

    try {
      if (mode === 'add' && eventId) {
        const payload: CreateTicketPayload = {
            ...commonPayload,
            event: { id: parseInt(eventId) },
        };
        await createTicket(payload);
        toast({ title: "Success", description: "Ticket created successfully." });
      } else if (mode === 'edit' && ticket) {
        const payload: UpdateTicketPayload = commonPayload;
        await updateTicket(ticket.id, payload);
        toast({ title: "Success", description: "Ticket updated successfully." });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
       console.error(`Failed to ${mode} ticket:`, error);
       toast({ variant: 'destructive', title: "Error", description: `Failed to ${mode} ticket.` });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {ticket ? 'Edit Ticket' : 'Add New Ticket'}
          </DialogTitle>
          <DialogDescription>
            Fill in the details for this ticket type.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ticket Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. VIP, Early Bird" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />
            <h3 className="font-semibold text-foreground">Inventory & Limits</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField
                    control={form.control}
                    name="quantityAvailable"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Quantity Available</FormLabel>
                        <FormControl><Input type="number" {...field} disabled={isSubmitting} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="ticketsToIssue"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tickets per sale</FormLabel>
                        <FormControl><Input type="number" {...field} disabled={isSubmitting} /></FormControl>
                        <FormDescription className="text-xs">e.g. 2 for a couple's ticket.</FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="ticketLimitPerPerson"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Limit per person</FormLabel>
                        <FormControl><Input type="number" {...field} disabled={isSubmitting} /></FormControl>
                        <FormDescription className="text-xs">0 for unlimited.</FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="numberOfComplementary"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Complementary</FormLabel>
                        <FormControl><Input type="number" {...field} disabled={isSubmitting} /></FormControl>
                        <FormDescription className="text-xs">Number of free tickets.</FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>

            <Separator />
            <h3 className="font-semibold text-foreground">Sale Period</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="saleStartDate"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Sale Starts</FormLabel>
                        <FormControl>
                        <DatePicker
                            date={field.value}
                            setDate={field.onChange}
                            className="w-full"
                             disabled={isSubmitting}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="saleEndDate"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Sale Ends</FormLabel>
                        <FormControl>
                        <DatePicker
                            date={field.value}
                            setDate={field.onChange}
                            className="w-full"
                             disabled={isSubmitting}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'add' ? 'Save Ticket' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
