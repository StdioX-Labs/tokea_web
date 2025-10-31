'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Order } from '@/lib/types';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Ticket, Calendar, User, Mail, Loader2, Download, Clock, Share2 } from 'lucide-react';
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
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 1200;
      canvas.height = 500;

      // Gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(1, '#f8fafc');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Main border
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

      // Inner border
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.strokeRect(25, 25, canvas.width - 50, canvas.height - 50);

      // Left section background
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(25, 25, 380, canvas.height - 50);

      // Vertical tear line
      ctx.setLineDash([8, 8]);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(405, 25);
      ctx.lineTo(405, canvas.height - 25);
      ctx.stroke();
      ctx.setLineDash([]);

      // Event name (rotated on left side)
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 32px Arial';
      ctx.save();
      ctx.translate(70, 250);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText(eventName.toUpperCase(), 0, 0);
      ctx.restore();

      // Ticket type badge
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(140, 50, 200, 40);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(ticket.ticketName.toUpperCase(), 240, 77);

      // Load and draw QR code
      const qrImage = new window.Image();
      qrImage.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        qrImage.onload = resolve;
        qrImage.onerror = reject;
        qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(ticket.barcode)}`;
      });

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(160, 130, 180, 180);
      ctx.drawImage(qrImage, 170, 140, 160, 160);

      // Barcode text
      ctx.fillStyle = '#64748b';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(ticket.barcode, 260, 340);

      // Right section - Event details
      ctx.textAlign = 'left';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 36px Arial';

      const maxWidth = 700;
      let eventNameLines = [];
      let words = eventName.split(' ');
      let currentLine = '';

      for (let word of words) {
        let testLine = currentLine + word + ' ';
        let metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine !== '') {
          eventNameLines.push(currentLine.trim());
          currentLine = word + ' ';
        } else {
          currentLine = testLine;
        }
      }
      eventNameLines.push(currentLine.trim());

      let yPos = 80;
      eventNameLines.forEach((line, index) => {
        ctx.fillText(line, 450, yPos + (index * 45));
      });

      yPos += eventNameLines.length * 45 + 20;

      // Decorative line
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(450, yPos);
      ctx.lineTo(650, yPos);
      ctx.stroke();

      yPos += 40;

      // Ticket details
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 18px Arial';
      ctx.fillText('TICKET DETAILS', 450, yPos);

      yPos += 30;
      ctx.fillStyle = '#64748b';
      ctx.font = '16px Arial';
      ctx.fillText(`Type: ${ticket.ticketName}`, 450, yPos);

      yPos += 30;
      ctx.fillText(`Price: KES ${ticket.ticketPrice.toFixed(2)}`, 450, yPos);

      yPos += 30;
      ctx.fillText(`Status: ${ticket.status}`, 450, yPos);

      yPos += 30;
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Arial';
      ctx.fillText(`Ticket ID: ${ticket.id}`, 450, yPos);

      // Bottom section
      const bottomY = canvas.height - 60;
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(25, bottomY - 20, canvas.width - 50, 60);

      ctx.fillStyle = '#475569';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PRESENT THIS TICKET AT THE ENTRANCE', canvas.width / 2, bottomY + 10);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Arial';
      ctx.fillText('This ticket is non-transferable and valid for one-time entry only', canvas.width / 2, bottomY + 30);

      // Convert to blob and download
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

  const shareTicket = async (ticket: any, eventName: string) => {
    if (!ticket.barcode) {
      toast({
        variant: 'destructive',
        title: 'No QR Code',
        description: 'This ticket does not have a QR code to share.',
      });
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 1200;
      canvas.height = 500;

      // Gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(1, '#f8fafc');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Main border
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

      // Inner border
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.strokeRect(25, 25, canvas.width - 50, canvas.height - 50);

      // Left section background
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(25, 25, 380, canvas.height - 50);

      // Vertical tear line
      ctx.setLineDash([8, 8]);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(405, 25);
      ctx.lineTo(405, canvas.height - 25);
      ctx.stroke();
      ctx.setLineDash([]);

      // Event name (rotated on left side)
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 32px Arial';
      ctx.save();
      ctx.translate(70, 250);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText(eventName.toUpperCase(), 0, 0);
      ctx.restore();

      // Ticket type badge
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(140, 50, 200, 40);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(ticket.ticketName.toUpperCase(), 240, 77);

      // Load and draw QR code
      const qrImage = new window.Image();
      qrImage.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        qrImage.onload = resolve;
        qrImage.onerror = reject;
        qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(ticket.barcode)}`;
      });

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(160, 130, 180, 180);
      ctx.drawImage(qrImage, 170, 140, 160, 160);

      // Barcode text
      ctx.fillStyle = '#64748b';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(ticket.barcode, 260, 340);

      // Right section - Event details
      ctx.textAlign = 'left';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 36px Arial';

      const maxWidth = 700;
      let eventNameLines = [];
      let words = eventName.split(' ');
      let currentLine = '';

      for (let word of words) {
        let testLine = currentLine + word + ' ';
        let metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine !== '') {
          eventNameLines.push(currentLine.trim());
          currentLine = word + ' ';
        } else {
          currentLine = testLine;
        }
      }
      eventNameLines.push(currentLine.trim());

      let yPos = 80;
      eventNameLines.forEach((line, index) => {
        ctx.fillText(line, 450, yPos + (index * 45));
      });

      yPos += eventNameLines.length * 45 + 20;

      // Decorative line
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(450, yPos);
      ctx.lineTo(650, yPos);
      ctx.stroke();

      yPos += 40;

      // Ticket details
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 18px Arial';
      ctx.fillText('TICKET DETAILS', 450, yPos);

      yPos += 30;
      ctx.fillStyle = '#64748b';
      ctx.font = '16px Arial';
      ctx.fillText(`Type: ${ticket.ticketName}`, 450, yPos);

      yPos += 30;
      ctx.fillText(`Price: KES ${ticket.ticketPrice.toFixed(2)}`, 450, yPos);

      yPos += 30;
      ctx.fillText(`Status: ${ticket.status}`, 450, yPos);

      yPos += 30;
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Arial';
      ctx.fillText(`Ticket ID: ${ticket.id}`, 450, yPos);

      // Bottom section
      const bottomY = canvas.height - 60;
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(25, bottomY - 20, canvas.width - 50, 60);

      ctx.fillStyle = '#475569';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PRESENT THIS TICKET AT THE ENTRANCE', canvas.width / 2, bottomY + 10);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Arial';
      ctx.fillText('This ticket is non-transferable and valid for one-time entry only', canvas.width / 2, bottomY + 30);

      // Convert to blob and share
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const fileName = `ticket-${ticket.id}-${eventName.replace(/\s+/g, '-')}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });

        // Check if Web Share API is available and supports files
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: `Ticket for ${eventName}`,
              text: `My ticket for ${eventName} - ${ticket.ticketName}`,
              files: [file],
            });
            toast({
              title: 'Ticket Shared',
              description: 'Your ticket has been shared successfully.',
            });
          } catch (error: any) {
            if (error.name !== 'AbortError') {
              console.error('Error sharing:', error);
              toast({
                variant: 'destructive',
                title: 'Share Failed',
                description: 'Could not share the ticket. Try downloading instead.',
              });
            }
          }
        } else {
          // Fallback: Download the ticket
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          toast({
            title: 'Ticket Downloaded',
            description: 'Share not available. Ticket downloaded to share manually.',
          });
        }
      });
    } catch (error) {
      console.error('Error sharing ticket:', error);
      toast({
        variant: 'destructive',
        title: 'Share Failed',
        description: 'Failed to share the ticket. Please try again.',
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
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold font-headline mb-2">Your Tickets</h1>
          <p className="text-muted-foreground">Order ID: {order.id}</p>
        </div>

        {/* Order Summary Card */}
        <Card className="max-w-4xl mx-auto mb-8 border-2 shadow-lg">
          <CardHeader>
            <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4'>
              <Ticket className="w-12 h-12 text-accent flex-shrink-0" />
              <div className='flex-grow'>
                <CardTitle className='font-headline text-3xl'>{order.eventName}</CardTitle>
                <CardDescription>{format(new Date(order.orderDate), "EEEE, MMMM d, yyyy 'at' h:mm a")}</CardDescription>
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
          </CardContent>
        </Card>

        {/* Tickets Section */}
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
            <Ticket className="w-6 h-6 text-accent" />
            Your Tickets ({order.tickets.length})
          </h2>

          {order.tickets.map((ticket, index) => (
            <Card key={ticket.id} className="overflow-hidden border-2 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="relative">
                {/* Ticket perforation effect */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-border to-transparent opacity-50"></div>
                <div className="absolute left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-border to-transparent opacity-30"></div>

                <div className="grid md:grid-cols-[1fr,auto] gap-0">
                  {/* Left section - Ticket details */}
                  <div className="p-6 md:p-8 bg-background">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs font-semibold border-accent text-accent">
                            TICKET #{index + 1}
                          </Badge>
                          <Badge variant={ticket.status === 'VALID' ? 'default' : 'secondary'} className='capitalize'>
                            {ticket.status.toLowerCase().replace('_', ' ')}
                          </Badge>
                        </div>
                        <h3 className="text-2xl font-bold font-headline mb-1">{ticket.ticketName}</h3>
                        <p className="text-3xl font-bold text-accent">KES {ticket.ticketPrice.toFixed(2)}</p>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Calendar className="w-4 h-4 text-accent" />
                        <span>{format(new Date(order.orderDate), "EEEE, MMMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Clock className="w-4 h-4 text-accent" />
                        <span>{format(new Date(order.orderDate), "h:mm a")}</span>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="bg-muted rounded-lg p-3 border">
                      <p className="text-xs text-muted-foreground mb-1 font-medium">TICKET ID</p>
                      <p className="font-mono text-sm break-all">{ticket.id}</p>
                    </div>

                    {ticket.barcode && (
                      <div className="flex gap-4 mt-4">
                        <Button
                          onClick={() => downloadTicket(ticket, order.eventName)}
                          className="w-full font-semibold"
                          size="lg"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Ticket
                        </Button>
                        <Button
                          onClick={() => shareTicket(ticket, order.eventName)}
                          className="w-full font-semibold"
                          size="lg"
                          variant="outline"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share Ticket
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Right section - QR Code */}
                  <div className="relative bg-muted/50 p-6 md:p-8 flex flex-col items-center justify-center md:min-w-[280px] border-l-2 border-dashed">
                    {/* Decorative circles for tear effect */}
                    <div className="absolute left-0 top-0 w-6 h-6 bg-background rounded-full -translate-x-1/2 -translate-y-1/2 border-2"></div>
                    <div className="absolute left-0 bottom-0 w-6 h-6 bg-background rounded-full -translate-x-1/2 translate-y-1/2 border-2"></div>

                    {ticket.barcode ? (
                      <div className="text-center">
                        <div className="bg-background p-4 rounded-xl shadow-lg mb-4 inline-block border">
                          <Image
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(ticket.barcode)}`}
                            alt={`QR Code for ticket ${ticket.id}`}
                            width={180}
                            height={180}
                            className="rounded"
                          />
                        </div>
                        <p className="font-mono text-xs text-muted-foreground mb-2 break-all px-2">{ticket.barcode}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Scan at entrance</p>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <div className="w-[180px] h-[180px] bg-muted rounded-xl flex items-center justify-center mb-4 border">
                          <p className="text-xs">No QR Code</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Important Information */}
        <Card className="max-w-4xl mx-auto mt-8 bg-muted/50 border-2">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Mail className="w-5 h-5 text-accent" />
              Important Information
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">•</span>
                <span>Present your ticket QR code at the entrance for scanning</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">•</span>
                <span>Each ticket is valid for one-time entry only</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">•</span>
                <span>Download your tickets for offline access</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
