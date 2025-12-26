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
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, CheckCircle2, ShieldCheck, Tag, CreditCard } from 'lucide-react';
import { purchaseTickets, type PurchasePayload, checkPaymentStatus } from '@/services/event-service';
import { useToast } from '@/hooks/use-toast';

const checkoutSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid 10-digit phone number.' }).max(15, { message: 'Phone number is too long.' }),
  couponCode: z.string().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions to proceed.',
  }),
});

type PaymentStatus = 'idle' | 'processing' | 'awaitingVerification' | 'success' | 'error';

const formatPhoneNumberForApi = (phone: string | undefined): string => {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return '254' + cleaned.substring(1);
  }
  if (cleaned.startsWith('254') && cleaned.length === 12) {
    return cleaned;
  }
  if (cleaned.length === 9) {
    return '254' + cleaned;
  }
  return cleaned;
}

export default function CheckoutPage() {
  const { items, cartTotal, itemCount, createOrder, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [ticketGroup, setTicketGroup] = useState<string | null>(null);

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      couponCode: '',
      termsAccepted: false,
    },
  });

  useEffect(() => {
    setIsClient(true);
    if (isClient && itemCount === 0 && !ticketGroup) {
      router.replace('/');
    }
  }, [itemCount, router, isClient, ticketGroup]);

  const handlePaymentSuccess = useCallback((orderId: string) => {
    clearCart();
    setTimeout(() => {
      router.push(`/confirmation/${orderId}`);
    }, 1500);
  }, [router, clearCart]);


  useEffect(() => {
    if (paymentStatus !== 'awaitingVerification' || !ticketGroup) {
      return;
    }

    const pollInterval = 5000;
    const pollTimeout = 120000;

    let pollTimer: NodeJS.Timeout | null = null;

    const timeoutTimer = setTimeout(() => {
      if (pollTimer) clearInterval(pollTimer);
      setPaymentStatus('error');
      toast({
        variant: 'destructive',
        title: 'Payment Timed Out',
        description: 'We did not receive payment confirmation in time. Please try again.',
      });
      setPaymentStatus('idle');
      setTicketGroup(null);
    }, pollTimeout);

    const poll = async () => {
      if (!ticketGroup) return;
      const result = await checkPaymentStatus(ticketGroup);
      if (result) {
        if (pollTimer) clearInterval(pollTimer);
        clearTimeout(timeoutTimer);

        setPaymentStatus('success');

        const values = form.getValues();
        const order = createOrder(
          ticketGroup,
          values.name,
          values.email,
          result.tickets,
          result.total,
          result.posterUrl,
          result.eventName,
          values.couponCode
        );
        handlePaymentSuccess(order.id);
      }
    };

    poll();
    pollTimer = setInterval(poll, pollInterval);

    return () => {
      if (pollTimer) clearInterval(pollTimer);
      clearTimeout(timeoutTimer);
    };
  }, [paymentStatus, ticketGroup, handlePaymentSuccess, form, createOrder, toast]);


  const startPaymentProcess = async (values: z.infer<typeof checkoutSchema>) => {
    setPaymentStatus('processing');
    if (items.length === 0) return;

    const firstItem = items[0];
    const paymentPhoneNumber = formatPhoneNumberForApi(values.phone);

    try {
      // Check if all tickets are still valid before proceeding
      const eventId = firstItem.eventId;
      const event = await import('@/services/event-service').then(module => module.getEventById(eventId));

      if (!event) {
        throw new Error('Event not found or no longer available');
      }

      // Verify that all tickets in the cart are still valid
      const invalidTickets = items.filter(item => {
        const ticketType = event.ticketTypes.find(tt => tt.id === item.ticketTypeId);
        return !ticketType || !ticketType.quantityAvailable || ticketType.status !== 'active';
      });

      if (invalidTickets.length > 0) {
        throw new Error(`Some tickets are no longer available: ${invalidTickets.map(t => t.ticketTypeName).join(', ')}`);
      }

      // Use card payment channel for Paystack
      const payload: PurchasePayload = {
        eventId: Number(firstItem.eventId),
        amountDisplayed: cartTotal,
        coupon_code: values.couponCode || "",
        channel: 'card',
        customer: {
          email: values.email,
          mobile_number: paymentPhoneNumber,
        },
        tickets: items.map(item => ({
          ticketId: Number(item.ticketTypeId),
          quantity: item.quantity,
        })),
      };

      console.log('Sending payment payload:', payload);
      const response = await purchaseTickets(payload);
      console.log('Payment response received:', response);

      if (!response) {
        throw new Error('No response received from payment server');
      }

      if (typeof response !== 'object') {
        console.error('Unexpected response type:', typeof response);
        throw new Error('Received invalid response format from payment server');
      }

      // Check specifically for the ticketGroup property
      if (!response.ticketGroup) {
        console.error('Missing ticketGroup in response:', response);
        throw new Error('Payment initiated but missing confirmation code');
      }

      // Store the ticket group for order confirmation
      setTicketGroup(response.ticketGroup);
      console.log('Set ticketGroup to:', response.ticketGroup);

      // Redirect to Paystack checkout
      if (response.checkoutUrl) {
        setPaymentStatus('success');
        // Build the return URL with the ticket group
        const baseUrl = window.location.origin;
        const returnUrl = `${baseUrl}/orders/${response.ticketGroup}`;
        // Append return URL as query parameter to Paystack checkout and redirect
        window.location.href = `${response.checkoutUrl}${response.checkoutUrl.includes('?') ? '&' : '?'}callback_url=${encodeURIComponent(returnUrl)}`;
        return;
      }

      throw new Error('Payment checkout URL not provided');

    } catch (error) {
      console.error("Payment failed", error);
      setPaymentStatus('error');
      toast({
        variant: 'destructive',
        title: 'Payment Failed',
        description: error instanceof Error ? error.message : 'There was a problem processing your payment. Please try again.',
      });
      setPaymentStatus('idle');
    }
  };

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      startPaymentProcess(form.getValues());
    }
  };

  if (!isClient || (itemCount === 0 && !ticketGroup)) {
    return (
      <div className="container py-12 text-center">
        <p>Loading your cart or redirecting...</p>
      </div>
    );
  }

  const renderPaymentStatus = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[250px]">
      {paymentStatus === 'processing' && (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-accent" />
          <h3 className="mt-4 text-xl font-semibold">Processing Payment...</h3>
          <p className="mt-2 text-muted-foreground">Please wait, this won't take long.</p>
        </>
      )}
      {paymentStatus === 'awaitingVerification' && (
        <>
          <ShieldCheck className="h-12 w-12 text-blue-500" />
          <h3 className="mt-4 text-xl font-semibold">Awaiting Verification</h3>
          <p className="mt-2 text-muted-foreground">Please complete the payment on your mobile phone.</p>
        </>
      )}
      {paymentStatus === 'success' && (
        <>
          <CheckCircle2 className="h-16 w-16 text-green-500" />
          <h3 className="mt-4 text-xl font-semibold">Redirecting...</h3>
          <p className="mt-2 text-muted-foreground">
            Please wait while we redirect you to our secure payment partner.
          </p>
        </>
      )}
    </div>
  );

  return (
    <div className="container mx-auto max-w-5xl py-12 px-4">
      <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to events
      </Link>
      <h1 className="text-3xl font-bold tracking-tight font-headline mb-8">Checkout</h1>
      <Form {...form}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className='space-y-8'>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">1. Your Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Doe" {...field} disabled={paymentStatus !== 'idle'} />
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
                          <Input placeholder="jane.doe@example.com" {...field} disabled={paymentStatus !== 'idle'} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 0712345678" {...field} disabled={paymentStatus !== 'idle'} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline">2. Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentStatus !== 'idle' ? renderPaymentStatus() : (
                  <div className='space-y-6'>
                    <FormField
                      control={form.control}
                      name="couponCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Coupon Code (Optional)</FormLabel>
                          <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <FormControl>
                              <Input placeholder="e.g. SUMMER24" {...field} className="pl-10" />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="termsAccepted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border-2 border-red-300 bg-red-50 p-4 hover:border-red-400 transition-colors">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="mt-1 h-5 w-5 border-red-500 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-medium cursor-pointer text-red-900">
                              I agree to the{' '}
                              <Link href="/terms" target="_blank" className="underline font-semibold hover:text-red-700">
                                Terms and Conditions
                              </Link>
                              {' '}and{' '}
                              <Link href="/privacy" target="_blank" className="underline font-semibold hover:text-red-700">
                                Privacy Policy
                              </Link>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    <div className="bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-900/10 dark:to-transparent p-4 rounded-lg border border-blue-100 dark:border-blue-900/20">
                      <div className="flex items-start">
                        <div className="mr-3 mt-1">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1 text-sm">Secure Payment</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            You will be redirected to our secure payment partner where you can pay with card or mobile money.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Your payment information is secure and encrypted</span>
                    </div>
                    <Button onClick={handleSubmit} size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Proceed to Payment - KES {cartTotal.toFixed(2)}
                    </Button>
                  </div>
                )}
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
                      <p className="font-medium">KES {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex-col items-start space-y-4">
                <Separator />
                <div className="w-full flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>KES {cartTotal.toFixed(2)}</span>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </Form>
    </div>
  );
}
