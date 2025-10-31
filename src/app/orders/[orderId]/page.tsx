'use client';

import { useEffect, useState } from 'react';
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
    <div className="bg-muted/50 min-h-screen py-6 md:py-12 lg:py-24">
      <div className="container px-4 md:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-headline mb-2">Your Tickets</h1>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base">Order ID: {order.id}</p>
        </div>

        {/* Order Summary Card */}
        <Card className="max-w-4xl mx-auto mb-6 md:mb-8 border-2 shadow-lg">
          <CardHeader className="p-4 sm:p-5 md:p-6">
            <div className='flex flex-col gap-3 sm:gap-4'>
              <div className="flex items-start gap-3 sm:gap-4">
                <Ticket className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-accent flex-shrink-0" />
                <div className='flex-grow min-w-0'>
                  <CardTitle className='font-headline text-lg sm:text-xl md:text-2xl lg:text-3xl mb-1 break-words'>{order.eventName}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm md:text-base">{format(new Date(order.orderDate), "EEEE, MMMM d, yyyy 'at' h:mm a")}</CardDescription>
                </div>
              </div>
              <div className='bg-muted/50 rounded-lg p-3 sm:p-4 border'>
                <p className="font-semibold mb-1 text-xs sm:text-sm md:text-base">Total Paid</p>
                <p className='text-xl sm:text-2xl font-bold font-headline text-accent'>KES {order.total.toFixed(2)}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 md:p-6">
            <Separator className="mb-4 md:mb-6 lg:mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
              <div className='md:col-span-2 space-y-2 sm:space-y-3'>
                <h3 className="font-semibold mb-2 text-sm md:text-base">Order Information</h3>
                {order.customerName && (
                  <p className='flex items-center gap-2 text-xs sm:text-sm'><User className='w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0' /><span className="truncate">{order.customerName}</span></p>
                )}
                {order.customerEmail && (
                  <p className='flex items-start gap-2 text-xs sm:text-sm'><Mail className='w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0 mt-0.5' /><span className="break-all">{order.customerEmail}</span></p>
                )}
                <p className='flex items-center gap-2 text-xs sm:text-sm'><Calendar className='w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0' /><span className="break-words">{format(new Date(order.orderDate), "PPP, p")}</span></p>
              </div>
              <div className='md:col-span-3 relative aspect-video overflow-hidden rounded-lg min-h-[180px] sm:min-h-[200px] md:min-h-[200px] bg-muted order-first md:order-last'>
                <img
                  src={order.posterUrl}
                  alt={`Poster for ${order.eventName}`}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tickets Section */}
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold font-headline flex items-center gap-2">
            <Ticket className="w-5 h-5 md:w-6 md:h-6 text-accent flex-shrink-0" />
            <span>Your Tickets ({order.tickets.length})</span>
          </h2>

          {order.tickets.map((ticket, index) => (
            <Card key={ticket.id} className="overflow-hidden border-2 shadow-lg md:shadow-xl hover:shadow-xl md:hover:shadow-2xl transition-shadow duration-300">
              <div className="relative">
                {/* Ticket perforation effect - only show on desktop */}
                <div className="hidden md:block absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-border to-transparent opacity-50"></div>
                <div className="hidden md:block absolute left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-border to-transparent opacity-30"></div>

                <div className="flex flex-col md:grid md:grid-cols-[1fr,auto] gap-0">
                  {/* Left section - Ticket details */}
                  <div className="p-4 sm:p-5 md:p-6 lg:p-8 bg-background">
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                          <Badge variant="outline" className="text-[10px] sm:text-xs font-semibold border-accent text-accent whitespace-nowrap">
                            TICKET #{index + 1}
                          </Badge>
                          <Badge variant={ticket.status === 'VALID' ? 'default' : 'secondary'} className='capitalize text-[10px] sm:text-xs whitespace-nowrap'>
                            {ticket.status.toLowerCase().replace('_', ' ')}
                          </Badge>
                        </div>
                        <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold font-headline mb-1 break-words">{ticket.ticketName}</h3>
                        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-accent">KES {ticket.ticketPrice.toFixed(2)}</p>
                      </div>
                    </div>

                    <Separator className="my-3 md:my-4" />

                    <div className="space-y-2 md:space-y-3 text-xs sm:text-sm">
                      <div className="flex items-center gap-2 md:gap-3 text-muted-foreground">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-accent flex-shrink-0" />
                        <span className="break-words">{format(new Date(order.orderDate), "EEEE, MMMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3 text-muted-foreground">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-accent flex-shrink-0" />
                        <span>{format(new Date(order.orderDate), "h:mm a")}</span>
                      </div>
                    </div>

                    <Separator className="my-3 md:my-4" />

                    <div className="bg-muted rounded-lg p-2.5 sm:p-3 border">
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 font-medium">TICKET ID</p>
                      <p className="font-mono text-[10px] sm:text-xs md:text-sm break-all leading-relaxed">{ticket.id}</p>
                    </div>

                    {ticket.barcode && (
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 mt-3 md:mt-4">
                        <Button
                          onClick={() => downloadTicket(ticket, order.eventName)}
                          className="w-full font-semibold text-xs sm:text-sm md:text-base h-9 sm:h-10 md:h-11"
                          size="lg"
                        >
                          <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                          <span className="hidden sm:inline">Download Ticket</span>
                          <span className="sm:hidden">Download</span>
                        </Button>
                        <Button
                          onClick={() => shareTicket(ticket, order.eventName)}
                          className="w-full font-semibold text-xs sm:text-sm md:text-base h-9 sm:h-10 md:h-11"
                          size="lg"
                          variant="outline"
                        >
                          <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                          <span className="hidden sm:inline">Share Ticket</span>
                          <span className="sm:hidden">Share</span>
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Right section - QR Code */}
                  <div className="relative bg-muted/30 md:bg-muted/50 p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col items-center justify-center md:min-w-[280px] border-t-2 md:border-t-0 md:border-l-2 border-dashed">
                    {/* Decorative circles for tear effect */}
                    <div className="absolute left-1/2 -translate-x-1/2 md:left-0 md:-translate-x-1/2 top-0 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-background rounded-full border-2"></div>
                    <div className="hidden md:block absolute left-0 -translate-x-1/2 bottom-0 translate-y-1/2 w-6 h-6 bg-background rounded-full border-2"></div>

                    {ticket.barcode ? (
                      <div className="text-center w-full">
                        <div className="bg-background p-3 sm:p-3.5 md:p-4 rounded-lg md:rounded-xl shadow-lg mb-3 md:mb-4 inline-block border mx-auto">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticket.barcode)}`}
                            alt={`QR Code for ticket ${ticket.id}`}
                            width={140}
                            height={140}
                            className="rounded w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] md:w-[180px] md:h-[180px] mx-auto"
                          />
                        </div>
                        <p className="font-mono text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mb-1 md:mb-2 break-all px-2 sm:px-3 leading-relaxed">{ticket.barcode}</p>
                        <p className="text-[8px] sm:text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Scan at entrance</p>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <div className="w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] md:w-[180px] md:h-[180px] bg-muted rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4 border mx-auto">
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
        <Card className="max-w-4xl mx-auto mt-6 md:mt-8 bg-muted/50 border-2">
          <CardContent className="p-4 sm:p-5 md:p-6">
            <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-2 md:mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4 md:w-5 md:h-5 text-accent flex-shrink-0" />
              <span>Important Information</span>
            </h3>
            <ul className="space-y-1.5 md:space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5 md:mt-1 flex-shrink-0">•</span>
                <span>Present your ticket QR code at the entrance for scanning</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5 md:mt-1 flex-shrink-0">•</span>
                <span>Each ticket is valid for one-time entry only</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5 md:mt-1 flex-shrink-0">•</span>
                <span>Download your tickets for offline access</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
