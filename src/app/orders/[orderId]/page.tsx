'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/cart-provider';
import type { Order } from '@/lib/types';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Ticket, Calendar, User, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
                <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4'>
                    <Ticket className="w-12 h-12 text-accent flex-shrink-0" />
                    <div className='flex-grow'>
                        <CardTitle className='font-headline text-3xl'>{order.eventName}</CardTitle>
                        <CardDescription>Order ID: {order.id}</CardDescription>
                    </div>
                    <div className='text-left sm:text-right'>
                        <p className="font-semibold mb-1">Total Paid</p>
                        <p className='text-2xl font-bold font-headline'>KES {order.total.toFixed(2)}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Separator className="mb-8" />
                <div className="grid md:grid-cols-5 gap-8 mb-8">
                    <div className='md:col-span-2 space-y-2'>
                        <h3 className="font-semibold mb-2">Order Information</h3>
                        <p className='flex items-center gap-2 text-sm'><User className='w-4 h-4 text-muted-foreground' />{order.customerName}</p>
                        <p className='flex items-center gap-2 text-sm'><Mail className='w-4 h-4 text-muted-foreground' />{order.customerEmail}</p>
                        <p className='flex items-center gap-2 text-sm'><Calendar className='w-4 h-4 text-muted-foreground' />{format(new Date(order.orderDate), "PPP, p")}</p>
                    </div>
                     <div className='md:col-span-3 relative aspect-video overflow-hidden rounded-lg min-h-[200px] bg-muted'>
                        <Image
                        src={order.posterUrl}
                        alt={`Poster for ${order.eventName}`}
                        fill
                        className="object-cover"
                        />
                    </div>
                </div>

                <Separator className='my-8'/>

                <h3 className="text-2xl font-bold font-headline mb-4">Your Tickets ({order.tickets.length})</h3>
                <div className='space-y-6'>
                    {order.tickets.map(ticket => (
                        <div key={ticket.id} className="p-4 border rounded-lg bg-background flex flex-col sm:flex-row gap-4 items-center">
                           <div className="flex-grow">
                                <p className="font-semibold text-lg">{ticket.ticketName}</p>
                                <Separator className="my-2" />
                                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm">
                                    <p><span className="font-medium text-muted-foreground">Price:</span> KES {ticket.ticketPrice.toFixed(2)}</p>
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-medium text-muted-foreground">Status:</span>
                                        <Badge variant={ticket.status === 'VALID' ? 'default' : 'secondary'} className='capitalize'>{ticket.status.toLowerCase().replace('_', ' ')}</Badge>
                                    </div>
                                </div>
                            </div>
                           <div className='flex-shrink-0 flex flex-col justify-center items-center gap-1 p-2 bg-muted rounded-md'>
                                {ticket.barcode ? (
                                    <>
                                        <Image
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(ticket.barcode)}`}
                                            alt={`QR Code for ticket ${ticket.id}`}
                                            width={100}
                                            height={100}
                                        />
                                        <p className="font-mono text-xs text-muted-foreground">{ticket.barcode}</p>
                                    </>
                                ) : (
                                    <div className="w-[100px] h-[100px] flex items-center justify-center text-muted-foreground text-xs text-center">
                                        No QR Code
                                    </div>
                                )}
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
