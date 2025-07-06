'use client';

import { useEffect } from 'react';
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

const ticketFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  price: z.coerce.number().min(0, 'Price must be 0 or more.'),
  quantityAvailable: z.coerce.number().int().min(1, 'Quantity must be at least 1.'),
  ticketsToIssue: z.coerce.number().int().min(1, 'Must issue at least 1 ticket.').default(1),
  ticketLimitPerPerson: z.coerce.number().int().min(0, 'Limit must be 0 or more. 0 for unlimited.').default(0),
  saleStartDate: z.date({ required_error: 'Sale start date is required.' }),
  saleEndDate: z.date({ required_error: 'Sale end date is required.' }),
});

interface AddTicketModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  ticket?: TicketType | null;
}

export function AddTicketModal({ isOpen, onOpenChange, ticket }: AddTicketModalProps) {
  const form = useForm<z.infer<typeof ticketFormSchema>>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      name: '',
      price: 0,
      quantityAvailable: 100,
      ticketsToIssue: 1,
      ticketLimitPerPerson: 0,
    },
  });

  useEffect(() => {
    if (ticket && isOpen) {
      form.reset({
        name: ticket.name,
        price: ticket.price,
        quantityAvailable: ticket.quantityAvailable,
        ticketsToIssue: ticket.ticketsToIssue,
        ticketLimitPerPerson: ticket.ticketLimitPerPerson,
        saleStartDate: new Date(ticket.saleStartDate),
        saleEndDate: new Date(ticket.saleEndDate),
      });
    } else if (!ticket && isOpen) {
      form.reset({
        name: '',
        price: 0,
        quantityAvailable: 100,
        ticketsToIssue: 1,
        ticketLimitPerPerson: 0,
        saleStartDate: undefined,
        saleEndDate: undefined,
      });
    }
  }, [ticket, form, isOpen]);

  function onSubmit(values: z.infer<typeof ticketFormSchema>) {
    console.log('Ticket form submitted:', values);
    onOpenChange(false);
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
                      <Input placeholder="e.g. VIP, Early Bird" {...field} />
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
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />
            <h3 className="font-semibold text-foreground">Inventory & Limits</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                    control={form.control}
                    name="quantityAvailable"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Quantity Available</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="ticketsToIssue"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tickets per purchase</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
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
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormDescription className="text-xs">0 for unlimited.</FormDescription>
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
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save Ticket</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
