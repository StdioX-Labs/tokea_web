'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Order } from '@/lib/types';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Ticket, Calendar, User, Mail, Loader2, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getPublicOrderDetails } from '@/services/event-service';
import { useToast } from '@/hooks/use-toast';

export default function OrderDetailsPage({ params }: { params: { orderId: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const fetchedOrder = await getPublicOrderDetails(params.orderId);
        if (fetchedOrder) {
          setOrder(fetchedOrder);
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Failed to fetch order details:", error);
        toast({
          variant: 'destructive',
          title: 'Error loading order',
          description: 'We could not find the order you were looking for.',
        });
        notFound();
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrder();
  }, [params.orderId, toast]);

  const downloadTicket = async (ticket: any, eventName: string) => {
    if (!ticket.barcode) {
      toast({
        variant: 'destructive',
        title: 'No QR Code',
        description: 'This ticket does not have a QR code to download.',
      });
      return;
    }

    try {
      // Create a canvas to draw the ticket
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size (ticket dimensions)
      canvas.width = 800;
      canvas.height = 400;

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add border
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      // Event name
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 28px Arial';
      ctx.fillText(eventName, 40, 60);

      // Separator line
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, 80);
      ctx.lineTo(760, 80);
      ctx.stroke();

      // Ticket name
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 20px Arial';
      ctx.fillText(ticket.ticketName, 40, 120);

      // Ticket details
      ctx.fillStyle = '#6b7280';
      ctx.font = '16px Arial';
      ctx.fillText(`Price: KES ${ticket.ticketPrice.toFixed(2)}`, 40, 160);
      ctx.fillText(`Status: ${ticket.status}`, 40, 190);
      ctx.fillText(`Ticket ID: ${ticket.id}`, 40, 220);

      // Load and draw QR code
      const qrImage = new window.Image();
      qrImage.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        qrImage.onload = resolve;
        qrImage.onerror = reject;
        qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(ticket.barcode)}`;
      });

      ctx.drawImage(qrImage, 500, 100, 250, 250);

      // Barcode text
      ctx.fillStyle = '#6b7280';
      ctx.font = '14px monospace';
      const barcodeText = ticket.barcode;
      const textWidth = ctx.measureText(barcodeText).width;
      ctx.fillText(barcodeText, 625 - textWidth / 2, 370);

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ticket-${ticket.id}-${eventName.replace(/\s+/g, '-')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: 'Ticket Downloaded',
          description: 'Your ticket has been downloaded successfully.',
        });
      });
    } catch (error) {
      console.error('Error downloading ticket:', error);
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'Failed to download the ticket. Please try again.',
      });
    }
  };

  if (isLoading) {
    return (
        <div className="container py-12 text-center flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return notFound();
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
                        {order.customerName && (
                          <p className='flex items-center gap-2 text-sm'><User className='w-4 h-4 text-muted-foreground' />{order.customerName}</p>
                        )}
                        {order.customerEmail && (
                            <p className='flex items-center gap-2 text-sm'><Mail className='w-4 h-4 text-muted-foreground' />{order.customerEmail}</p>
                        )}
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
                           <div className='flex-shrink-0 flex flex-col justify-center items-center gap-2'>
                                <div className='p-2 bg-muted rounded-md'>
                                    {ticket.barcode ? (
                                        <>
                                            <Image
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(ticket.barcode)}`}
                                                alt={`QR Code for ticket ${ticket.id}`}
                                                width={100}
                                                height={100}
                                            />
                                            <p className="font-mono text-xs text-muted-foreground text-center mt-1">{ticket.barcode}</p>
                                        </>
                                    ) : (
                                        <div className="w-[100px] h-[100px] flex items-center justify-center text-muted-foreground text-xs text-center">
                                            No QR Code
                                        </div>
                                    )}
                                </div>
                                {ticket.barcode && (
                                    <Button
                                        onClick={() => downloadTicket(ticket, order.eventName)}
                                        size="sm"
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download Ticket
                                    </Button>
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
