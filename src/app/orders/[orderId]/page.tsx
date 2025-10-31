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

      canvas.width = 800;
      canvas.height = 800;

      // Elegant gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#1e293b');
      gradient.addColorStop(0.5, '#334155');
      gradient.addColorStop(1, '#1e293b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add subtle pattern overlay
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      for (let i = 0; i < canvas.width; i += 20) {
        for (let j = 0; j < canvas.height; j += 20) {
          ctx.fillRect(i, j, 1, 1);
        }
      }

      // Golden accent bar at top
      const goldGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      goldGradient.addColorStop(0, '#d4af37');
      goldGradient.addColorStop(0.5, '#f4e5a1');
      goldGradient.addColorStop(1, '#d4af37');
      ctx.fillStyle = goldGradient;
      ctx.fillRect(0, 0, canvas.width, 8);
      ctx.fillRect(0, canvas.height - 8, canvas.width, 8);

      // Main content area with glass morphism effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(30, 30, canvas.width - 60, canvas.height - 60);

      // Border with gradient
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

      // Event name at top - centered
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 10;

      const maxWidth = 680;
      let eventNameLines: string[] = [];
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

      let yPos = 70;
      eventNameLines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, yPos + (index * 40));
      });
      ctx.shadowBlur = 0;

      yPos += eventNameLines.length * 40 + 20;

      // Golden decorative line
      const lineGradient = ctx.createLinearGradient(canvas.width / 2 - 200, yPos, canvas.width / 2 + 200, yPos);
      lineGradient.addColorStop(0, 'rgba(212, 175, 55, 0)');
      lineGradient.addColorStop(0.5, 'rgba(212, 175, 55, 1)');
      lineGradient.addColorStop(1, 'rgba(212, 175, 55, 0)');
      ctx.strokeStyle = lineGradient;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 200, yPos);
      ctx.lineTo(canvas.width / 2 + 200, yPos);
      ctx.stroke();

      yPos += 40;

      // Ticket type badge - centered
      const badgeY = yPos;
      const badgeX = canvas.width / 2;
      const badgeWidth = 200;
      const badgeHeight = 50;

      const badgeGradient = ctx.createLinearGradient(badgeX - badgeWidth/2, badgeY, badgeX + badgeWidth/2, badgeY);
      badgeGradient.addColorStop(0, '#d4af37');
      badgeGradient.addColorStop(0.5, '#f4e5a1');
      badgeGradient.addColorStop(1, '#d4af37');
      ctx.fillStyle = badgeGradient;

      ctx.beginPath();
      ctx.roundRect(badgeX - badgeWidth/2, badgeY - badgeHeight/2, badgeWidth, badgeHeight, 10);
      ctx.fill();

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(ticket.ticketName.toUpperCase(), badgeX, badgeY + 6);

      yPos += 60;

      // QR Code section - centered and prominent
      const qrSize = 280;
      const qrX = canvas.width / 2 - qrSize / 2;
      const qrY = yPos;

      // QR background with shadow
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 5;
      ctx.beginPath();
      ctx.roundRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40, 15);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Load and draw QR code
      const qrImage = new window.Image();
      qrImage.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        qrImage.onload = resolve;
        qrImage.onerror = reject;
        qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(ticket.barcode)}`;
      });

      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

      yPos += qrSize + 30;

      // Barcode text below QR - centered
      ctx.fillStyle = 'rgba(248, 250, 252, 0.6)';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(ticket.barcode, canvas.width / 2, yPos);

      yPos += 30;

      // Ticket details section - centered
      const detailsX = canvas.width / 2;

      ctx.fillStyle = '#d4af37';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('TICKET DETAILS', detailsX, yPos);

      yPos += 35;

      // Detail items - centered
      const details = [
        { label: 'Price', value: `KES ${ticket.ticketPrice.toFixed(2)}` },
        { label: 'Status', value: ticket.status },
      ];

      ctx.font = '16px Arial';
      details.forEach((detail, index) => {
        ctx.fillStyle = 'rgba(248, 250, 252, 0.6)';
        ctx.fillText(`${detail.label}: `, detailsX - 80, yPos + (index * 28));

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(detail.value, detailsX + 20, yPos + (index * 28));
        ctx.font = '16px Arial';
      });

      yPos += details.length * 28 + 20;

      // Ticket ID in a premium box - centered
      const idBoxWidth = 500;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.roundRect(canvas.width / 2 - idBoxWidth / 2, yPos - 10, idBoxWidth, 50, 8);
      ctx.fill();

      ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = 'rgba(248, 250, 252, 0.6)';
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('TICKET ID', canvas.width / 2, yPos + 8);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '12px monospace';
      ctx.fillText(ticket.id, canvas.width / 2, yPos + 28);

      yPos += 70;

      // Footer text - centered
      ctx.fillStyle = '#d4af37';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PRESENT THIS TICKET AT THE ENTRANCE', canvas.width / 2, yPos);

      ctx.fillStyle = 'rgba(248, 250, 252, 0.5)';
      ctx.font = '12px Arial';
      ctx.fillText('Valid for one-time entry only', canvas.width / 2, yPos + 22);

      // Watermark
      ctx.fillStyle = 'rgba(212, 175, 55, 0.08)';
      ctx.font = 'bold 100px Arial';
      ctx.textAlign = 'center';
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 6);
      ctx.fillText('TOKEA', 0, 0);
      ctx.restore();

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
          description: 'Your premium ticket has been downloaded successfully.',
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

      canvas.width = 800;
      canvas.height = 800;

      // Elegant gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#1e293b');
      gradient.addColorStop(0.5, '#334155');
      gradient.addColorStop(1, '#1e293b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add subtle pattern overlay
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      for (let i = 0; i < canvas.width; i += 20) {
        for (let j = 0; j < canvas.height; j += 20) {
          ctx.fillRect(i, j, 1, 1);
        }
      }

      // Golden accent bar at top
      const goldGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      goldGradient.addColorStop(0, '#d4af37');
      goldGradient.addColorStop(0.5, '#f4e5a1');
      goldGradient.addColorStop(1, '#d4af37');
      ctx.fillStyle = goldGradient;
      ctx.fillRect(0, 0, canvas.width, 8);
      ctx.fillRect(0, canvas.height - 8, canvas.width, 8);

      // Main content area with glass morphism effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(30, 30, canvas.width - 60, canvas.height - 60);

      // Border with gradient
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

      // Event name at top - centered
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 10;

      const maxWidth = 680;
      let eventNameLines: string[] = [];
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

      let yPos = 70;
      eventNameLines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, yPos + (index * 40));
      });
      ctx.shadowBlur = 0;

      yPos += eventNameLines.length * 40 + 20;

      // Golden decorative line
      const lineGradient = ctx.createLinearGradient(canvas.width / 2 - 200, yPos, canvas.width / 2 + 200, yPos);
      lineGradient.addColorStop(0, 'rgba(212, 175, 55, 0)');
      lineGradient.addColorStop(0.5, 'rgba(212, 175, 55, 1)');
      lineGradient.addColorStop(1, 'rgba(212, 175, 55, 0)');
      ctx.strokeStyle = lineGradient;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 200, yPos);
      ctx.lineTo(canvas.width / 2 + 200, yPos);
      ctx.stroke();

      yPos += 40;

      // Ticket type badge - centered
      const badgeY = yPos;
      const badgeX = canvas.width / 2;
      const badgeWidth = 200;
      const badgeHeight = 50;

      const badgeGradient = ctx.createLinearGradient(badgeX - badgeWidth/2, badgeY, badgeX + badgeWidth/2, badgeY);
      badgeGradient.addColorStop(0, '#d4af37');
      badgeGradient.addColorStop(0.5, '#f4e5a1');
      badgeGradient.addColorStop(1, '#d4af37');
      ctx.fillStyle = badgeGradient;

      ctx.beginPath();
      ctx.roundRect(badgeX - badgeWidth/2, badgeY - badgeHeight/2, badgeWidth, badgeHeight, 10);
      ctx.fill();

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(ticket.ticketName.toUpperCase(), badgeX, badgeY + 6);

      yPos += 60;

      // QR Code section - centered and prominent
      const qrSize = 280;
      const qrX = canvas.width / 2 - qrSize / 2;
      const qrY = yPos;

      // QR background with shadow
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 5;
      ctx.beginPath();
      ctx.roundRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40, 15);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Load and draw QR code
      const qrImage = new window.Image();
      qrImage.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        qrImage.onload = resolve;
        qrImage.onerror = reject;
        qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(ticket.barcode)}`;
      });

      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

      yPos += qrSize + 30;

      // Barcode text below QR - centered
      ctx.fillStyle = 'rgba(248, 250, 252, 0.6)';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(ticket.barcode, canvas.width / 2, yPos);

      yPos += 30;

      // Ticket details section - centered
      const detailsX = canvas.width / 2;

      ctx.fillStyle = '#d4af37';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('TICKET DETAILS', detailsX, yPos);

      yPos += 35;

      // Detail items - centered
      const details = [
        { label: 'Price', value: `KES ${ticket.ticketPrice.toFixed(2)}` },
        { label: 'Status', value: ticket.status },
      ];

      ctx.font = '16px Arial';
      details.forEach((detail, index) => {
        ctx.fillStyle = 'rgba(248, 250, 252, 0.6)';
        ctx.fillText(`${detail.label}: `, detailsX - 80, yPos + (index * 28));

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(detail.value, detailsX + 20, yPos + (index * 28));
        ctx.font = '16px Arial';
      });

      yPos += details.length * 28 + 20;

      // Ticket ID in a premium box - centered
      const idBoxWidth = 500;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.roundRect(canvas.width / 2 - idBoxWidth / 2, yPos - 10, idBoxWidth, 50, 8);
      ctx.fill();

      ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = 'rgba(248, 250, 252, 0.6)';
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('TICKET ID', canvas.width / 2, yPos + 8);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '12px monospace';
      ctx.fillText(ticket.id, canvas.width / 2, yPos + 28);

      yPos += 70;

      // Footer text - centered
      ctx.fillStyle = '#d4af37';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PRESENT THIS TICKET AT THE ENTRANCE', canvas.width / 2, yPos);

      ctx.fillStyle = 'rgba(248, 250, 252, 0.5)';
      ctx.font = '12px Arial';
      ctx.fillText('Valid for one-time entry only', canvas.width / 2, yPos + 22);

      // Watermark
      ctx.fillStyle = 'rgba(212, 175, 55, 0.08)';
      ctx.font = 'bold 100px Arial';
      ctx.textAlign = 'center';
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 6);
      ctx.fillText('TOKEA', 0, 0);
      ctx.restore();

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
              text: `My premium ticket for ${eventName} - ${ticket.ticketName}`,
              files: [file],
            });
            toast({
              title: 'Ticket Shared',
              description: 'Your premium ticket has been shared successfully.',
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
