'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/context/cart-provider';
import type { Order } from '@/lib/types';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Ticket, Calendar, User, Mail, QrCode } from 'lucide-react';

export default function OrderDetailsPage({ params }: { params: { orderId: string } }) {
  const { getOrder } = useCart();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    const foundOrder = getOrder(params.orderId);
    setOrder(foundOrder);
  }, [getOrder, params.orderId]);

  if (order === undefined) {
    return <div className='container py-12 text-center'>Loading order details...</div>;
  }

  if (order === null) {
    notFound();
  }

  return (
    <div className="bg-muted/50 min-h-screen py-12 md:py-24">
      <div className="container">
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <div className='flex items-center gap-4'>
                    <Ticket className="w-12 h-12 text-accent" />
                    <div>
                        <CardTitle className='font-headline text-3xl'>Your Tickets</CardTitle>
                        <CardDescription>Order ID: {order.id}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <h3 className="font-semibold mb-2">Order Information</h3>
                        <p className='flex items-center gap-2'><User className='w-4 h-4 text-muted-foreground' />{order.customerName}</p>
                        <p className='flex items-center gap-2'><Mail className='w-4 h-4 text-muted-foreground' />{order.customerEmail}</p>
                        <p className='flex items-center gap-2'><Calendar className='w-4 h-4 text-muted-foreground' />{format(new Date(order.orderDate), "PPP, p")}</p>
                    </div>
                    <div className='text-right'>
                        <h3 className="font-semibold mb-2">Total Paid</h3>
                        <p className='text-3xl font-bold'>KES {order.total.toFixed(2)}</p>
                    </div>
                </div>

                <Separator className='my-8'/>

                <div className='space-y-6'>
                    {order.items.map(item => (
                        <div key={item.ticketTypeId} className="p-4 border rounded-lg bg-background">
                            <h4 className='font-bold text-lg'>{item.eventName}</h4>
                            <p className='text-muted-foreground'>{item.ticketTypeName}</p>
                            <Separator className='my-4' />
                            <div className='grid md:grid-cols-3 items-center gap-4'>
                                <div className='md:col-span-2'>
                                    <p><span className="font-semibold">Quantity:</span> {item.quantity}</p>
                                    <p><span className="font-semibold">Price per ticket:</span> KES {item.price.toFixed(2)}</p>
                                </div>
                                <div className='flex justify-center items-center'>
                                    <QrCode className='w-24 h-24 text-foreground' />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
