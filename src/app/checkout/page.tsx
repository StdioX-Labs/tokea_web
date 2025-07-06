'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import PaymentModal from '@/components/payment-modal';
import type { Order } from '@/lib/types';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const checkoutSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

export default function CheckoutPage() {
  const { items, cartTotal, itemCount, createOrder } = useCart();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });
  
  useEffect(() => {
    setIsClient(true);
    if (itemCount === 0) {
      router.replace('/');
    }
  }, [itemCount, router]);

  if (!isClient || itemCount === 0) {
    return (
      <div className="container py-12 text-center">
        <p>Loading your cart or redirecting...</p>
      </div>
    );
  }

  function onSubmit(values: z.infer<typeof checkoutSchema>) {
    const order = createOrder(values.name, values.email);
    setActiveOrder(order);
    setPaymentModalOpen(true);
  }

  function handlePaymentSuccess() {
    setPaymentModalOpen(false);
    if (activeOrder) {
      router.push(`/confirmation/${activeOrder.id}`);
    }
  }

  return (
    <>
      <div className="container mx-auto max-w-5xl py-12 px-4">
        <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to events
        </Link>
        <h1 className="text-3xl font-bold tracking-tight font-headline mb-8">Checkout</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Your Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Jane Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="jane.doe@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                        Proceed to Payment
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.ticketTypeId} className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{item.eventName}</p>
                        <p className="text-sm text-muted-foreground">{`${item.ticketTypeName} x ${item.quantity}`}</p>
                      </div>
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex-col items-start space-y-4">
                <Separator />
                <div className="w-full flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        totalAmount={cartTotal}
      />
    </>
  );
}
