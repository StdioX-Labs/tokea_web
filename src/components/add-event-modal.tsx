'use client';

import { useEffect, useState, useRef } from 'react';
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
import { Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createEvent, updateEvent, type CreateEventPayload, type UpdateEventPayload } from '@/services/event-service';

const eventFormSchema = z.object({
  eventName: z.string().min(3, { message: 'Name must be at least 3 characters.' }),
  eventDescription: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  eventPosterUrl: z.string().min(1, { message: 'Please upload a poster image.' }),
  categoryId: z.string().optional(),
  eventLocation: z.string().min(3, { message: 'Location is required.' }),
  eventStartDate: z.date({ required_error: 'Event start date is required.' }),
  eventEndDate: z.date().optional(),
  ticketSaleStartDate: z.date().optional(),
  ticketSaleEndDate: z.date().optional(),
  startTimeHour: z.string().default('12'),
  startTimeMinute: z.string().default('00'),
  startTimePeriod: z.enum(['AM', 'PM']).default('PM'),
  endTimeHour: z.string().default('12'),
  endTimeMinute: z.string().default('00'),
  endTimePeriod: z.enum(['AM', 'PM']).default('PM'),
  saleStartTimeHour: z.string().default('12'),
  saleStartTimeMinute: z.string().default('00'),
  saleStartTimePeriod: z.enum(['AM', 'PM']).default('AM'),
  saleEndTimeHour: z.string().default('12'),
  saleEndTimeMinute: z.string().default('00'),
  saleEndTimePeriod: z.enum(['AM', 'PM']).default('PM'),
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
  onSuccess: () => void;
  event?: Event | null;
  mode?: 'add' | 'edit' | 'view';
}

export function AddEventModal({ isOpen, onOpenChange, onSuccess, event, mode = 'add' }: AddEventModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle image upload to Cloudinary
  const handleImageUpload = async (file: File) => {
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ml_default');

      const response = await fetch('https://api.cloudinary.com/v1_1/deubdntzs/image/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      form.setValue('eventPosterUrl', data.secure_url);
      toast({ title: 'Success', description: 'Image uploaded successfully' });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'There was an error uploading your image. Please try again.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      eventName: '',
      eventDescription: '',
      eventPosterUrl: '',
      categoryId: '1',
      eventLocation: '',
      ticketSaleStartDate: undefined,
      ticketSaleEndDate: undefined,
      startTimeHour: '12',
      startTimeMinute: '00',
      startTimePeriod: 'PM',
      endTimeHour: '12',
      endTimeMinute: '00',
      endTimePeriod: 'PM',
      saleStartTimeHour: '12',
      saleStartTimeMinute: '00',
      saleStartTimePeriod: 'AM',
      saleEndTimeHour: '12',
      saleEndTimeMinute: '00',
      saleEndTimePeriod: 'PM',
    },
  });

  const isViewMode = mode === 'view';
  const posterUrl = form.watch('eventPosterUrl');

  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setIsSubmitting(false);
    } else if (event) {
      // Parse time from ISO timestamps in eventStartDate and eventEndDate
      let startTimeHour = "12";
      let startTimeMinute = "00";
      let startTimePeriod = "PM";
      let endTimeHour = "12";
      let endTimeMinute = "00";
      let endTimePeriod = "PM";
      let saleStartTimeHour = "12";
      let saleStartTimeMinute = "00";
      let saleStartTimePeriod = "AM";
      let saleEndTimeHour = "12";
      let saleEndTimeMinute = "00";
      let saleEndTimePeriod = "PM";

      if (event.eventStartDate) {
        const startDate = new Date(event.eventStartDate);
        const hours = startDate.getUTCHours();
        const minutes = startDate.getUTCMinutes();

        startTimeHour = hours % 12 === 0 ? '12' : String(hours % 12);
        startTimeMinute = String(minutes).padStart(2, '0');
        startTimePeriod = hours >= 12 ? 'PM' : 'AM';
      } else if (event.time) {
        // Fallback to time string format if available
        const timeParts = event.time.match(/(\d+):(\d+)\s+(AM|PM)/i);
        if (timeParts) {
          startTimeHour = timeParts[1];
          startTimeMinute = timeParts[2];
          startTimePeriod = timeParts[3].toUpperCase() as 'AM' | 'PM';
        }
      }

      if (event.eventEndDate) {
        const endDate = new Date(event.eventEndDate);
        const hours = endDate.getUTCHours();
        const minutes = endDate.getUTCMinutes();

        endTimeHour = hours % 12 === 0 ? '12' : String(hours % 12);
        endTimeMinute = String(minutes).padStart(2, '0');
        endTimePeriod = hours >= 12 ? 'PM' : 'AM';
      } else if (event.endTime) {
        // Fallback to endTime string format if available
        const endTimeParts = event.endTime.match(/(\d+):(\d+)\s+(AM|PM)/i);
        if (endTimeParts) {
          endTimeHour = endTimeParts[1];
          endTimeMinute = endTimeParts[2];
          endTimePeriod = endTimeParts[3].toUpperCase() as 'AM' | 'PM';
        }
      }

      // Parse ticket sale times
      if (event.ticketSaleStartDate) {
        const saleStartDate = new Date(event.ticketSaleStartDate);
        const hours = saleStartDate.getUTCHours();
        const minutes = saleStartDate.getUTCMinutes();

        saleStartTimeHour = hours % 12 === 0 ? '12' : String(hours % 12);
        saleStartTimeMinute = String(minutes).padStart(2, '0');
        saleStartTimePeriod = hours >= 12 ? 'PM' : 'AM';
      }

      if (event.ticketSaleEndDate) {
        const saleEndDate = new Date(event.ticketSaleEndDate);
        const hours = saleEndDate.getUTCHours();
        const minutes = saleEndDate.getUTCMinutes();

        saleEndTimeHour = hours % 12 === 0 ? '12' : String(hours % 12);
        saleEndTimeMinute = String(minutes).padStart(2, '0');
        saleEndTimePeriod = hours >= 12 ? 'PM' : 'AM';
      }

      form.reset({
        eventName: event.eventName || event.name,
        eventDescription: event.eventDescription || event.description,
        eventPosterUrl: event.eventPosterUrl || event.posterImage,
        categoryId: event.category?.id || '1',
        eventLocation: event.eventLocation || event.location,
        eventStartDate: event.eventStartDate ? new Date(event.eventStartDate) : new Date(event.date),
        eventEndDate: event.eventEndDate ? new Date(event.eventEndDate) : event.endDate ? new Date(event.endDate) : undefined,
        ticketSaleStartDate: event.ticketSaleStartDate ? new Date(event.ticketSaleStartDate) : undefined,
        ticketSaleEndDate: event.ticketSaleEndDate ? new Date(event.ticketSaleEndDate) : undefined,
        startTimeHour,
        startTimeMinute,
        startTimePeriod,
        endTimeHour,
        endTimeMinute,
        endTimePeriod,
        saleStartTimeHour,
        saleStartTimeMinute,
        saleStartTimePeriod,
        saleEndTimeHour,
        saleEndTimeMinute,
        saleEndTimePeriod,
      });
    } else {
      form.reset({
        eventName: '',
        eventDescription: '',
        eventPosterUrl: '',
        categoryId: '1',
        eventLocation: '',
        eventStartDate: undefined,
        eventEndDate: undefined,
        ticketSaleStartDate: undefined,
        ticketSaleEndDate: undefined,
        startTimeHour: '12',
        startTimeMinute: '00',
        startTimePeriod: 'PM',
        endTimeHour: '12',
        endTimeMinute: '00',
        endTimePeriod: 'PM',
        saleStartTimeHour: '12',
        saleStartTimeMinute: '00',
        saleStartTimePeriod: 'AM',
        saleEndTimeHour: '12',
        saleEndTimeMinute: '00',
        saleEndTimePeriod: 'PM',
      });
    }
  }, [event, form, isOpen]);

  async function onSubmit(values: z.infer<typeof eventFormSchema>) {
    if (isViewMode) return;
    setIsSubmitting(true);

    try {
      // Convert form time values to hours and minutes
      let startHour = parseInt(values.startTimeHour);
      if (values.startTimePeriod === 'PM' && startHour !== 12) {
        startHour += 12;
      } else if (values.startTimePeriod === 'AM' && startHour === 12) {
        startHour = 0;
      }
      const startMinute = parseInt(values.startTimeMinute);

      let endHour = parseInt(values.endTimeHour);
      if (values.endTimePeriod === 'PM' && endHour !== 12) {
        endHour += 12;
      } else if (values.endTimePeriod === 'AM' && endHour === 12) {
        endHour = 0;
      }
      const endMinute = parseInt(values.endTimeMinute);

      // Create proper date objects with the combined date and time
      // First clone the date objects to avoid modifying the original values
      const startDate = new Date(values.eventStartDate);
      // Make sure we're setting UTC hours to maintain consistency with the incoming ISO format
      startDate.setUTCHours(startHour, startMinute, 0, 0);

      let endDate = values.eventEndDate ? new Date(values.eventEndDate) : null;
      if (endDate) {
        endDate.setUTCHours(endHour, endMinute, 0, 0);
      }

      // Convert ticket sale time values to hours and minutes
      let saleStartHour = parseInt(values.saleStartTimeHour);
      if (values.saleStartTimePeriod === 'PM' && saleStartHour !== 12) {
        saleStartHour += 12;
      } else if (values.saleStartTimePeriod === 'AM' && saleStartHour === 12) {
        saleStartHour = 0;
      }
      const saleStartMinute = parseInt(values.saleStartTimeMinute);

      let saleEndHour = parseInt(values.saleEndTimeHour);
      if (values.saleEndTimePeriod === 'PM' && saleEndHour !== 12) {
        saleEndHour += 12;
      } else if (values.saleEndTimePeriod === 'AM' && saleEndHour === 12) {
        saleEndHour = 0;
      }
      const saleEndMinute = parseInt(values.saleEndTimeMinute);

      // Prepare ticket sale dates with time
      let ticketSaleStartDate = null;
      let ticketSaleEndDate = null;

      if (values.ticketSaleStartDate) {
        ticketSaleStartDate = new Date(values.ticketSaleStartDate);
        ticketSaleStartDate.setUTCHours(saleStartHour, saleStartMinute, 0, 0);
      }

      if (values.ticketSaleEndDate) {
        ticketSaleEndDate = new Date(values.ticketSaleEndDate);
        ticketSaleEndDate.setUTCHours(saleEndHour, saleEndMinute, 0, 0);
      }

      if (mode === 'add') {
        // Only include the specified fields in the payload
        const payload = {
          eventName: values.eventName,
          eventDescription: values.eventDescription,
          eventPosterUrl: values.eventPosterUrl,
          categoryId: values.categoryId,
          eventLocation: values.eventLocation,
          eventStartDate: startDate.toISOString(), // This will include both the date and time
          eventEndDate: endDate?.toISOString(), // This will include both the date and time
          ticketSaleStartDate: ticketSaleStartDate?.toISOString() || startDate.toISOString(),
          ticketSaleEndDate: ticketSaleEndDate?.toISOString() || endDate?.toISOString(),
        };
        await createEvent(payload as CreateEventPayload);
        toast({ title: "Success", description: "Event created successfully." });
      } else if (mode === 'edit' && event) {
        // Only include the specified fields in the payload
        const payload: UpdateEventPayload = {
          eventName: values.eventName,
          eventDescription: values.eventDescription,
          eventPosterUrl: values.eventPosterUrl,
          eventCategory: values.categoryId ? { id: parseInt(values.categoryId) } : undefined,
          eventLocation: values.eventLocation,
          eventStartDate: startDate.toISOString(),
          eventEndDate: endDate?.toISOString(),
          ticketSaleStartDate: ticketSaleStartDate?.toISOString() || startDate.toISOString(),
          ticketSaleEndDate: ticketSaleEndDate?.toISOString() || endDate?.toISOString(),
        };
        console.log('Submitting event update with payload:', payload);
        await updateEvent(event.id, payload);
        console.log('Event update completed');
        toast({ title: "Success", description: "Event updated successfully." });
      }
      onSuccess();
    } catch (error) {
      console.error(`Failed to ${mode} event:`, error);
      toast({ variant: 'destructive', title: "Error", description: `Failed to ${mode} event.` });
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {mode === 'add' && 'Add New Event'}
            {mode === 'edit' && 'Edit Event'}
            {mode === 'view' && 'View Event Details'}
          </DialogTitle>
          <DialogDescription>
            {isViewMode ? `Viewing details for "${event?.name}".` : "Fill in the details below. Click save when you're done."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="md:col-span-3 space-y-6">
                <FormField
                  control={form.control}
                  name="eventName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Summer Solstice Fest" {...field} disabled={isViewMode || isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="eventDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us more about the event..."
                          className="resize-y min-h-[100px]"
                          {...field}
                          disabled={isViewMode || isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="eventPosterUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Poster</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input placeholder="Click 'Upload' to select an image" value={field.value} readOnly disabled />
                          {!isViewMode && (
                            <>
                              <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleImageUpload(file);
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isSubmitting || isUploading}
                              >
                                {isUploading ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Upload className="mr-2 h-4 w-4" />
                                )}
                                Upload
                              </Button>
                            </>
                          )}
                        </div>
                      </FormControl>
                      {!isViewMode && <FormDescription>Upload an image for your event poster.</FormDescription>}
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
                    <p className="text-sm text-muted-foreground">No image</p>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={isViewMode || isSubmitting}>
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
                name="eventLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Green Meadows Park" {...field} disabled={isViewMode || isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />
            <h3 className="font-semibold text-foreground">Event Dates & Times</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="eventStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Start Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                        className="w-full"
                        disabled={isViewMode || isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="eventEndDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event End Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                        className="w-full"
                        disabled={isViewMode || isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormItem>
                <FormLabel>Event Start Time</FormLabel>
                <div className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name="startTimeHour"
                    render={({ field }) => (
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="HH"
                          {...field}
                          disabled={isViewMode || isSubmitting}
                          maxLength={2}
                          className="w-16"
                        />
                      </FormControl>
                    )}
                  />
                  <span className="text-center">:</span>
                  <FormField
                    control={form.control}
                    name="startTimeMinute"
                    render={({ field }) => (
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="MM"
                          {...field}
                          disabled={isViewMode || isSubmitting}
                          maxLength={2}
                          className="w-16"
                        />
                      </FormControl>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startTimePeriod"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        disabled={isViewMode || isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="w-20">
                            <SelectValue placeholder="AM/PM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="PM">PM</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </FormItem>
              <FormItem>
                <FormLabel>Event End Time</FormLabel>
                <div className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name="endTimeHour"
                    render={({ field }) => (
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="HH"
                          {...field}
                          disabled={isViewMode || isSubmitting}
                          maxLength={2}
                          className="w-16"
                        />
                      </FormControl>
                    )}
                  />
                  <span className="text-center">:</span>
                  <FormField
                    control={form.control}
                    name="endTimeMinute"
                    render={({ field }) => (
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="MM"
                          {...field}
                          disabled={isViewMode || isSubmitting}
                          maxLength={2}
                          className="w-16"
                        />
                      </FormControl>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endTimePeriod"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        disabled={isViewMode || isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="w-20">
                            <SelectValue placeholder="AM/PM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="PM">PM</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </FormItem>
            </div>

            {mode === 'edit' && (
              <>
                <Separator />
                <h3 className="font-semibold text-foreground">Ticket Sale Period</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="ticketSaleStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ticket Sale Start Date</FormLabel>
                        <FormControl>
                          <DatePicker
                            date={field.value}
                            setDate={field.onChange}
                            className="w-full"
                            disabled={isViewMode || isSubmitting}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">When tickets go on sale</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ticketSaleEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ticket Sale End Date</FormLabel>
                        <FormControl>
                          <DatePicker
                            date={field.value}
                            setDate={field.onChange}
                            className="w-full"
                            disabled={isViewMode || isSubmitting}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">When ticket sales close</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormItem>
                    <FormLabel>Ticket Sale Start Time</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name="saleStartTimeHour"
                        render={({ field }) => (
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="HH"
                              {...field}
                              disabled={isViewMode || isSubmitting}
                              maxLength={2}
                              className="w-16"
                            />
                          </FormControl>
                        )}
                      />
                      <span className="text-center">:</span>
                      <FormField
                        control={form.control}
                        name="saleStartTimeMinute"
                        render={({ field }) => (
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="MM"
                              {...field}
                              disabled={isViewMode || isSubmitting}
                              maxLength={2}
                              className="w-16"
                            />
                          </FormControl>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="saleStartTimePeriod"
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                            disabled={isViewMode || isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger className="w-20">
                                <SelectValue placeholder="AM/PM" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="AM">AM</SelectItem>
                              <SelectItem value="PM">PM</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </FormItem>

                  <FormItem>
                    <FormLabel>Ticket Sale End Time</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name="saleEndTimeHour"
                        render={({ field }) => (
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="HH"
                              {...field}
                              disabled={isViewMode || isSubmitting}
                              maxLength={2}
                              className="w-16"
                            />
                          </FormControl>
                        )}
                      />
                      <span className="text-center">:</span>
                      <FormField
                        control={form.control}
                        name="saleEndTimeMinute"
                        render={({ field }) => (
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="MM"
                              {...field}
                              disabled={isViewMode || isSubmitting}
                              maxLength={2}
                              className="w-16"
                            />
                          </FormControl>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="saleEndTimePeriod"
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                            disabled={isViewMode || isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger className="w-20">
                                <SelectValue placeholder="AM/PM" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="AM">AM</SelectItem>
                              <SelectItem value="PM">PM</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </FormItem>
                </div>
              </>
            )}

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  {isViewMode ? 'Close' : 'Cancel'}
                </Button>
              </DialogClose>
              {!isViewMode && (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mode === 'add' ? 'Save Event' : 'Save Changes'}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent >
    </Dialog >
  );
}
