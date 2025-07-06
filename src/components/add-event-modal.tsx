'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import type { Event, EventCategory } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from './ui/separator';

const eventFormSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  posterImage: z.string().url({ message: 'Please enter a valid image URL.' }),
  categoryId: z.string({ required_error: 'Please select a category.' }),
  location: z.string().min(3, { message: 'Location is required.' }),
  date: z.date({ required_error: 'Event start date is required.' }),
  endDate: z.date({ required_error: 'Event end date is required.' }),
  ticketSaleStartDate: z.date({ required_error: 'Ticket sale start date is required.' }),
  ticketSaleEndDate: z.date({ required_error: 'Ticket sale end date is required.' }),
});


const categories: EventCategory[] = [
  { id: '1', name: 'Music' },
  { id: '2', name: 'Conference' },
  { id: '3', name: 'Festival' },
  { id: '4', name: 'Workshop' },
  { id: '5', name: 'Arts & Culture' },
];

interface AddEventModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  event?: Event | null;
}

export function AddEventModal({ isOpen, onOpenChange, event }: AddEventModalProps) {
  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: '',
      description: '',
      posterImage: '',
      location: '',
    },
  });

  const posterUrl = form.watch('posterImage');

  useEffect(() => {
    if (event && isOpen) {
      form.reset({
        name: event.name,
        description: event.description,
        posterImage: event.posterImage,
        categoryId: event.category?.id || undefined,
        location: event.location,
        date: new Date(event.date),
        endDate: event.endDate ? new Date(event.endDate) : undefined,
        ticketSaleStartDate: event.ticketSaleStartDate ? new Date(event.ticketSaleStartDate) : undefined,
        ticketSaleEndDate: event.ticketSaleEndDate ? new Date(event.ticketSaleEndDate) : undefined,
      });
    } else if (!event && isOpen) {
      form.reset({
        name: '',
        description: '',
        posterImage: '',
        categoryId: undefined,
        location: '',
        date: undefined,
        endDate: undefined,
        ticketSaleStartDate: undefined,
        ticketSaleEndDate: undefined,
      });
    }
  }, [event, form, isOpen]);

  function onSubmit(values: z.infer<typeof eventFormSchema>) {
    // In a real app, you'd handle saving the data here
    console.log('Form submitted:', values);
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {event ? 'Edit Event' : 'Add New Event'}
          </DialogTitle>
          <DialogDescription>
            Fill in the details below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="md:col-span-3 space-y-6">
                 <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Summer Solstice Fest" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us more about the event..."
                          className="resize-y min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="posterImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Poster URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/poster.jpg" {...field} />
                      </FormControl>
                      <FormDescription>Provide a URL for the event poster image.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-2">
                 <FormLabel>Poster Preview</FormLabel>
                 <div className="w-full aspect-[2/3] mt-2 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                    {posterUrl ? (
                         <Image src={posterUrl} alt="Event poster preview" width={400} height={600} className="w-full h-full object-cover" />
                    ) : (
                        <p className="text-sm text-muted-foreground">No image URL</p>
                    )}
                 </div>
              </div>
            </div>

            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an event category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Green Meadows Park" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Event Start Date</FormLabel>
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
                    name="endDate"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Event End Date</FormLabel>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="ticketSaleStartDate"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Ticket Sale Starts</FormLabel>
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
                    name="ticketSaleEndDate"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Ticket Sale Ends</FormLabel>
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
              <Button type="submit">Save Event</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
