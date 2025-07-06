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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Promotion } from '@/lib/types';

const promotionFormSchema = z.object({
  codeBatchName: z.string().min(3, 'Batch name must be at least 3 characters.'),
  numberOfPromoCodes: z.coerce.number().int().min(1, 'Must generate at least 1 code.'),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT'], { required_error: 'Please select a discount type.' }),
  discountValue: z.coerce.number().min(0.01, 'Discount value must be greater than 0.'),
  maxUses: z.coerce.number().int().min(1, 'Max uses must be at least 1.'),
  validFrom: z.date({ required_error: 'Start date is required.' }),
  validUntil: z.date({ required_error: 'End date is required.' }),
});

interface AddPromotionModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  promotion?: Promotion | null;
}

export function AddPromotionModal({ isOpen, onOpenChange, promotion }: AddPromotionModalProps) {
  const form = useForm<z.infer<typeof promotionFormSchema>>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: {
      codeBatchName: '',
      numberOfPromoCodes: 50,
      discountType: 'PERCENTAGE',
      discountValue: 10,
      maxUses: 100,
    },
  });

  useEffect(() => {
    if (promotion && isOpen) {
      form.reset({
        codeBatchName: promotion.codeBatchName,
        numberOfPromoCodes: promotion.numberOfCodes,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        maxUses: promotion.maxUses,
        validFrom: new Date(promotion.validFrom),
        validUntil: new Date(promotion.validUntil),
      });
    } else if (!promotion && isOpen) {
      form.reset({
        codeBatchName: '',
        numberOfPromoCodes: 50,
        discountType: 'PERCENTAGE',
        discountValue: 10,
        maxUses: 100,
        validFrom: undefined,
        validUntil: undefined,
      });
    }
  }, [promotion, form, isOpen]);

  function onSubmit(values: z.infer<typeof promotionFormSchema>) {
    console.log('Promotion form submitted:', values);
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {promotion ? 'Edit Promotion' : 'Create New Promotion'}
          </DialogTitle>
          <DialogDescription>
            Fill in the details to generate a new batch of promo codes.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
            
            <FormField
              control={form.control}
              name="codeBatchName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promotion Batch Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Early Bird Special" {...field} />
                  </FormControl>
                  <FormDescription>A name to help you identify this batch of codes.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormField
                  control={form.control}
                  name="discountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select discount type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                          <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="discountValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Value</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 10 or 10.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="numberOfPromoCodes"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Number of Codes</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormDescription>How many unique codes to generate.</FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="maxUses"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Max Total Uses</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormDescription>Total redemptions allowed for this batch.</FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="validFrom"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Valid From</FormLabel>
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
                    name="validUntil"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Valid Until</FormLabel>
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
              <Button type="submit">Save Promotion</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
