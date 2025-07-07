'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useCallback } from 'react';
import type { Order } from '@/lib/types';
import Link from 'next/link';
import { ArrowLeft, Loader2, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from '@/components/ui/progress';
import { purchaseTickets, type PurchasePayload } from '@/services/event-service';
import { useToast } from '@/hooks/use-toast';

const checkoutSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid 10-digit phone number.' }).max(15, { message: 'Phone number is too long.' }),
  mpesaPhone: z.string().min(10, { message: 'Please enter a valid 10-digit phone number.' }).max(15, { message: 'Phone number is too long.' }).optional().or(z.literal('')),
  couponCode: z.string().optional(),
});

type PaymentStatus = 'idle' | 'processing' | 'awaitingVerification' | 'success' | 'error';
type PaymentMethod = 'mpesa' | 'card';

/**
 * Formats a phone number to the 254... format for the API.
 * @param phone The raw phone number string.
 * @returns The formatted phone number.
 */
const formatPhoneNumberForApi = (phone: string | undefined): string => {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, ''); // Remove all non-digit characters
    
    // Case: Starts with 0 (e.g., 0712345678)
    if (cleaned.startsWith('0') && cleaned.length === 10) {
        return '254' + cleaned.substring(1);
    }
    
    // Case: Starts with 254 (e.g., 254712345678)
    if (cleaned.startsWith('254') && cleaned.length === 12) {
        return cleaned;
    }
    
    // Case: Starts without 0 or 254 (e.g., 712345678) - assumes it's a Kenyan number
    if (cleaned.length === 9) {
        return '254' + cleaned;
    }

    // Fallback: Return the cleaned number. This handles cases where user might have entered +254...
    // as the '+' is stripped by `replace`.
    return cleaned;
}

export default function CheckoutPage() {
  const { items, cartTotal, itemCount, createOrder, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [progress, setProgress] = useState(0);

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      mpesaPhone: '',
      couponCode: '',
    },
  });
  
  useEffect(() => {
    setIsClient(true);
    if (isClient && itemCount === 0 && !activeOrder) {
      router.replace('/');
    }
  }, [itemCount, router, isClient, activeOrder]);
  
  const handlePaymentSuccess = useCallback(() => {
    if (activeOrder) {
        clearCart();
        setTimeout(() => {
            router.push(`/confirmation/${activeOrder.id}`);
        }, 1500);
    }
  }, [activeOrder, router, clearCart]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (paymentStatus === 'processing') {
      setProgress(10);
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(timer);
            return 95;
          }
          return prev + Math.floor(Math.random() * 10) + 5;
        });
      }, 500);
    }
    return () => clearInterval(timer);
  }, [paymentStatus]);

  useEffect(() => {
    if (progress >= 95 && paymentStatus === 'processing') {
      if (paymentMethod === 'mpesa') {
        setPaymentStatus('awaitingVerification');
        setTimeout(() => {
          setProgress(100);
          setPaymentStatus('success');
        }, 3000);
      } else {
        setProgress(100);
        setPaymentStatus('success');
      }
    }
    if (paymentStatus === 'success') {
      handlePaymentSuccess();
    }
  }, [progress, paymentStatus, paymentMethod, handlePaymentSuccess]);

  const startPaymentProcess = async (values: z.infer<typeof checkoutSchema>, channel: PaymentMethod) => {
    setPaymentStatus('processing');

    if (items.length === 0) return;

    const firstItem = items[0];
    const rawPaymentPhoneNumber = channel === 'mpesa' && values.mpesaPhone ? values.mpesaPhone : values.phone;
    const paymentPhoneNumber = formatPhoneNumberForApi(rawPaymentPhoneNumber);

    const payload: PurchasePayload = {
      eventId: Number(firstItem.eventId),
      amountDisplayed: cartTotal,
      coupon_code: values.couponCode || undefined,
      channel,
      customer: {
        email: values.email,
        mobile_number: paymentPhoneNumber,
      },
      tickets: items.map(item => ({
        ticketId: Number(item.ticketTypeId),
        quantity: item.quantity,
      })),
    };

    try {
      await purchaseTickets(payload);

      const order = createOrder(values.name, values.email, values.couponCode);
      setActiveOrder(order);

    } catch (error) {
      console.error("Payment failed", error);
      setPaymentStatus('error');
      toast({
        variant: 'destructive',
        title: 'Payment Failed',
        description: 'There was a problem processing your payment. Please try again.',
      });
      setPaymentStatus('idle');
    }
  };

  const handleSubmit = async (channel: PaymentMethod) => {
    setPaymentMethod(channel);
    const isValid = await form.trigger();
    if (isValid) {
      startPaymentProcess(form.getValues(), channel);
    }
  };
  
  if (!isClient || (itemCount === 0 && !activeOrder)) {
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
          <Progress value={progress} className="w-full mt-4" />
          <p className='text-sm text-muted-foreground mt-2'>{progress}% complete</p>
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
          <h3 className="mt-4 text-xl font-semibold">Payment Successful!</h3>
          <p className="mt-2 text-muted-foreground">Redirecting to your order confirmation...</p>
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
                            <Tabs defaultValue="mpesa" className="w-full" onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="mpesa">Mobile Money</TabsTrigger>
                                    <TabsTrigger value="card">Card</TabsTrigger>
                                </TabsList>
                                <TabsContent value="mpesa" className="pt-4 space-y-4">
                                    <p className="text-sm text-muted-foreground">You will receive a push notification to your M-Pesa number to complete the payment.</p>
                                    <FormField
                                        control={form.control}
                                        name="mpesaPhone"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>M-Pesa Phone Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. 0712345678" {...field} />
                                            </FormControl>
                                            <FormDescription>The number to pay with. If blank, your contact number will be used.</FormDescription>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button onClick={() => handleSubmit('mpesa')} size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                                        Pay KES {cartTotal.toFixed(2)} with M-Pesa
                                    </Button>
                                </TabsContent>
                                <TabsContent value="card" className="pt-4">
                                    <p className="text-sm text-muted-foreground mb-4">You will be redirected to our secure payment partner to complete your purchase.</p>
                                    <Button onClick={() => handleSubmit('card')} size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                                        Proceed to Card Payment
                                    </Button>
                                </TabsContent>
                            </Tabs>
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
