'use client';

import { useEffect, useState, useRef, use } from 'react';
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
import { QRCode } from '@/components/ui/qr-code';

export default function OrderDetailsPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const qrCodeRef = useRef<QRCode>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const fetchedOrder = await getPublicOrderDetails(orderId);
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
  }, [orderId, toast]);

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

      canvas.width = 1080;
      canvas.height = 1920;

      // Movie ticket style - black and red gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#000000');
      gradient.addColorStop(0.5, '#0a0a0a');
      gradient.addColorStop(1, '#000000');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Red top bar - movie ticket style
      const redGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      redGradient.addColorStop(0, '#b91c1c');
      redGradient.addColorStop(0.5, '#dc2626');
      redGradient.addColorStop(1, '#b91c1c');
      ctx.fillStyle = redGradient;
      ctx.fillRect(0, 0, canvas.width, 20);

      // Decorative perforated edge effect at top
      ctx.fillStyle = '#000000';
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.arc(i, 20, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      let yPos = 100;

      // "ADMIT ONE" header - classic ticket style
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '8px';
      ctx.fillText('ADMIT ONE', canvas.width / 2, yPos);

      yPos += 80;

      // Event name - large and prominent
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 56px Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(220, 38, 38, 0.3)';
      ctx.shadowBlur = 15;

      const maxWidth = 950;
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

      eventNameLines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, yPos + (index * 68));
      });

      ctx.shadowBlur = 0;
      yPos += eventNameLines.length * 68 + 40;

      // Decorative line
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(140, yPos);
      ctx.lineTo(canvas.width - 140, yPos);
      ctx.stroke();
      ctx.setLineDash([]);

      yPos += 60;

      // Ticket Type
      ctx.fillStyle = '#dc2626';
      ctx.font = '28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('TICKET TYPE', canvas.width / 2, yPos);

      yPos += 50;

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 40px Arial';
      ctx.fillText(ticket.ticketName.toUpperCase(), canvas.width / 2, yPos);

      yPos += 70;

      // Status Badge - movie ticket style
      const statusBadgeWidth = 320;
      const statusBadgeHeight = 75;
      const statusColor = ticket.status === 'VALID' ? '#10b981' : '#dc2626';

      ctx.fillStyle = statusColor;
      ctx.beginPath();
      ctx.roundRect(canvas.width / 2 - statusBadgeWidth / 2, yPos - statusBadgeHeight / 2, statusBadgeWidth, statusBadgeHeight, 10);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      const statusText = ticket.status === 'VALID' ? '\u2713 VALID' : '\u2717 USED';
      ctx.fillText(statusText, canvas.width / 2, yPos + 12);

      yPos += 80;

      // CENTER: QR CODE - Main focus
      const qrSize = 500;
      const qrX = canvas.width / 2 - qrSize / 2;
      const qrY = yPos;

      // QR background with red border - movie ticket style
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(220, 38, 38, 0.4)';
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.roundRect(qrX - 25, qrY - 25, qrSize + 50, qrSize + 50, 15);
      ctx.fill();

      ctx.shadowBlur = 0;

      // Red decorative border
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Corner decorations
      const cornerSize = 30;
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 6;

      // Top-left corner
      ctx.beginPath();
      ctx.moveTo(qrX - 25, qrY - 25 + cornerSize);
      ctx.lineTo(qrX - 25, qrY - 25);
      ctx.lineTo(qrX - 25 + cornerSize, qrY - 25);
      ctx.stroke();

      // Top-right corner
      ctx.beginPath();
      ctx.moveTo(qrX + qrSize + 25 - cornerSize, qrY - 25);
      ctx.lineTo(qrX + qrSize + 25, qrY - 25);
      ctx.lineTo(qrX + qrSize + 25, qrY - 25 + cornerSize);
      ctx.stroke();

      // Bottom-left corner
      ctx.beginPath();
      ctx.moveTo(qrX - 25, qrY + qrSize + 25 - cornerSize);
      ctx.lineTo(qrX - 25, qrY + qrSize + 25);
      ctx.lineTo(qrX - 25 + cornerSize, qrY + qrSize + 25);
      ctx.stroke();

      // Bottom-right corner
      ctx.beginPath();
      ctx.moveTo(qrX + qrSize + 25 - cornerSize, qrY + qrSize + 25);
      ctx.lineTo(qrX + qrSize + 25, qrY + qrSize + 25);
      ctx.lineTo(qrX + qrSize + 25, qrY + qrSize + 25 - cornerSize);
      ctx.stroke();

      // Load and draw QR code - using QRCode component
      const qrContainer = document.createElement('div');
      qrContainer.style.position = 'absolute';
      qrContainer.style.left = '-9999px';
      document.body.appendChild(qrContainer);

      const qrWrapper = document.createElement('div');
      qrContainer.appendChild(qrWrapper);

      const { createRoot } = await import('react-dom/client');
      const root = createRoot(qrWrapper);

      await new Promise<HTMLCanvasElement>((resolve) => {
        root.render(
          <QRCode
            value={ticket.barcode}
            size={500}
            quietZone={10}
            bgColor="#FFFFFF"
            fgColor="#000000"
            qrStyle="fluid"
            eyeRadius={[
              { outer: 10, inner: 0 },
              { outer: 10, inner: 0 },
              { outer: 10, inner: 0 }
            ]}
            eyeColor="#dc2626"
          />
        );

        setTimeout(() => {
          const qrCanvas = qrWrapper.querySelector('canvas');
          if (qrCanvas) {
            resolve(qrCanvas);
          }
        }, 100);
      }).then((qrCanvas) => {
        ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
        root.unmount();
        document.body.removeChild(qrContainer);
      });

      yPos += qrSize + 55;

      // Barcode text
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(ticket.barcode, canvas.width / 2, yPos);

      yPos += 45;

      ctx.fillStyle = '#94a3b8';
      ctx.font = '22px Arial';
      ctx.fillText('SCAN AT ENTRANCE', canvas.width / 2, yPos);

      yPos += 80;

      // Price section - prominent
      ctx.fillStyle = '#dc2626';
      ctx.font = '32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('TICKET PRICE', canvas.width / 2, yPos);

      yPos += 55;

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 60px Arial';
      ctx.fillText(`KES ${ticket.ticketPrice.toFixed(2)}`, canvas.width / 2, yPos);

      yPos += 80;

      // Decorative perforated edge effect at bottom section
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(140, yPos);
      ctx.lineTo(canvas.width - 140, yPos);
      ctx.stroke();
      ctx.setLineDash([]);

      yPos += 60;

      // Fine print at bottom
      ctx.fillStyle = '#94a3b8';
      ctx.font = '18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('This ticket is valid for one-time entry only', canvas.width / 2, yPos);

      yPos += 35;

      ctx.fillText('Present this ticket at the entrance for scanning', canvas.width / 2, yPos);

      yPos += 35;

      ctx.font = '16px Arial';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`Ticket ID: #${ticket.id}`, canvas.width / 2, yPos);

      yPos += 30;

      ctx.fillText('Non-transferable • No refunds', canvas.width / 2, yPos);

      yPos += 60;

      // Tokea Logo - using SVG data
      const logoSvg = `
        <svg height="40" viewBox="0 0 430.63 119.44" xmlns="http://www.w3.org/2000/svg">
          <g>
            <path d="M26.79,117.05l-3.14-71L3,48.22l-3-27,74.84-3.7L76.69,44,56,44.52l-.92,74.32Z" fill="#f8fafc"></path>
            <path d="M113.05,119.44,86.25,112l-4.8-74.68,14.6-16.61,46.75-3.47L155,39.62l-6.65,74.8Zm13.86-23.9,3.69-44.09L118,45,107,51.21l1.48,46.36,10,5Z" fill="#f8fafc"></path>
            <path d="M161.23,118.25l-1.1-98.71,24.2-2.39,1.85,41.23,12.57-3.59,8.87-37.28,24.94,1.19L222.4,64.59l-8,2,18.11,49.24-24.94,1.55L192.46,71.28l-5,1.32,1.85,43.26Z" fill="#f8fafc"></path>
            <path d="M253.32,119.08l-16.26-9,2-90.46L301,16.79l2.4,28.08-38.25,3.71L265,62.2l34.55-1.91L297.3,78.21l-32.33,1L264.41,96,301,92.32l3,22.1Z" fill="#f8fafc"></path>
            <path d="M356,117.05v-4.3l-32.34,3.94L310.3,98.17l2.41-33.34L351,58.74,350.4,45l-12.75.84.56,8.6L312.71,56l-4.25-33.34,39.54-6,29.75,6,2.4,92.85Zm-3.14-43.73-14.05,2-.55,12.19,17,2.62Z" fill="#f8fafc"></path>
            <path d="M420.1,85.7l-23.19-1.4-9.63-70L395.41.84,422.65,0l8,17.14Zm-24.39,7.87,25.89,1.68-1.81,21.36-22.27.56-4.22-11.8Z" fill="#dc2626"></path>
          </g>
        </svg>
      `;

      const logoBlob = new Blob([logoSvg], { type: 'image/svg+xml' });
      const logoUrl = URL.createObjectURL(logoBlob);
      const logoImg = new window.Image();

      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
        logoImg.src = logoUrl;
      });

      // Draw logo centered
      const logoWidth = 150;
      const logoHeight = (logoWidth * 119.44) / 430.63;
      ctx.drawImage(logoImg, canvas.width / 2 - logoWidth / 2, yPos, logoWidth, logoHeight);
      URL.revokeObjectURL(logoUrl);

      yPos += logoHeight + 15;

      // "Powered by SoldOutAfrica" text - styled better
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Powered by', canvas.width / 2, yPos);

      yPos += 22;

      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 18px Arial';
      ctx.fillText('SoldOutAfrica', canvas.width / 2, yPos);

      // Bottom red bar
      yPos = canvas.height - 20;
      ctx.fillStyle = redGradient;
      ctx.fillRect(0, yPos, canvas.width, 20);

      // Decorative perforated edge effect at bottom
      ctx.fillStyle = '#000000';
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.arc(i, yPos, 8, 0, Math.PI * 2);
        ctx.fill();
      }

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

      canvas.width = 1080;
      canvas.height = 1920;

      // Movie ticket style - black and red gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#000000');
      gradient.addColorStop(0.5, '#0a0a0a');
      gradient.addColorStop(1, '#000000');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Red top bar - movie ticket style
      const redGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      redGradient.addColorStop(0, '#b91c1c');
      redGradient.addColorStop(0.5, '#dc2626');
      redGradient.addColorStop(1, '#b91c1c');
      ctx.fillStyle = redGradient;
      ctx.fillRect(0, 0, canvas.width, 20);

      // Decorative perforated edge effect at top
      ctx.fillStyle = '#000000';
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.arc(i, 20, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      let yPos = 100;

      // "ADMIT ONE" header - classic ticket style
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '8px';
      ctx.fillText('ADMIT ONE', canvas.width / 2, yPos);

      yPos += 80;

      // Event name - large and prominent
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 56px Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(220, 38, 38, 0.3)';
      ctx.shadowBlur = 15;

      const maxWidth = 950;
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

      eventNameLines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, yPos + (index * 68));
      });

      ctx.shadowBlur = 0;
      yPos += eventNameLines.length * 68 + 40;

      // Decorative line
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(140, yPos);
      ctx.lineTo(canvas.width - 140, yPos);
      ctx.stroke();
      ctx.setLineDash([]);

      yPos += 60;

      // Ticket Type
      ctx.fillStyle = '#dc2626';
      ctx.font = '28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('TICKET TYPE', canvas.width / 2, yPos);

      yPos += 50;

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 40px Arial';
      ctx.fillText(ticket.ticketName.toUpperCase(), canvas.width / 2, yPos);

      yPos += 70;

      // Status Badge - movie ticket style
      const statusBadgeWidth = 320;
      const statusBadgeHeight = 75;
      const statusColor = ticket.status === 'VALID' ? '#10b981' : '#dc2626';

      ctx.fillStyle = statusColor;
      ctx.beginPath();
      ctx.roundRect(canvas.width / 2 - statusBadgeWidth / 2, yPos - statusBadgeHeight / 2, statusBadgeWidth, statusBadgeHeight, 10);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      const statusText = ticket.status === 'VALID' ? '\u2713 VALID' : '\u2717 USED';
      ctx.fillText(statusText, canvas.width / 2, yPos + 12);

      yPos += 80;

      // CENTER: QR CODE - Main focus
      const qrSize = 500;
      const qrX = canvas.width / 2 - qrSize / 2;
      const qrY = yPos;

      // QR background with red border - movie ticket style
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(220, 38, 38, 0.4)';
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.roundRect(qrX - 25, qrY - 25, qrSize + 50, qrSize + 50, 15);
      ctx.fill();

      ctx.shadowBlur = 0;

      // Red decorative border
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Corner decorations
      const cornerSize = 30;
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 6;

      // Top-left corner
      ctx.beginPath();
      ctx.moveTo(qrX - 25, qrY - 25 + cornerSize);
      ctx.lineTo(qrX - 25, qrY - 25);
      ctx.lineTo(qrX - 25 + cornerSize, qrY - 25);
      ctx.stroke();

      // Top-right corner
      ctx.beginPath();
      ctx.moveTo(qrX + qrSize + 25 - cornerSize, qrY - 25);
      ctx.lineTo(qrX + qrSize + 25, qrY - 25);
      ctx.lineTo(qrX + qrSize + 25, qrY - 25 + cornerSize);
      ctx.stroke();

      // Bottom-left corner
      ctx.beginPath();
      ctx.moveTo(qrX - 25, qrY + qrSize + 25 - cornerSize);
      ctx.lineTo(qrX - 25, qrY + qrSize + 25);
      ctx.lineTo(qrX - 25 + cornerSize, qrY + qrSize + 25);
      ctx.stroke();

      // Bottom-right corner
      ctx.beginPath();
      ctx.moveTo(qrX + qrSize + 25 - cornerSize, qrY + qrSize + 25);
      ctx.lineTo(qrX + qrSize + 25, qrY + qrSize + 25);
      ctx.lineTo(qrX + qrSize + 25, qrY + qrSize + 25 - cornerSize);
      ctx.stroke();

      // Load and draw QR code - using QRCode component
      const qrContainer = document.createElement('div');
      qrContainer.style.position = 'absolute';
      qrContainer.style.left = '-9999px';
      document.body.appendChild(qrContainer);

      const qrWrapper = document.createElement('div');
      qrContainer.appendChild(qrWrapper);

      const { createRoot } = await import('react-dom/client');
      const root = createRoot(qrWrapper);

      await new Promise<HTMLCanvasElement>((resolve) => {
        root.render(
          <QRCode
            value={ticket.barcode}
            size={500}
            quietZone={10}
            bgColor="#FFFFFF"
            fgColor="#000000"
            qrStyle="fluid"
            eyeRadius={[
              { outer: 10, inner: 0 },
              { outer: 10, inner: 0 },
              { outer: 10, inner: 0 }
            ]}
            eyeColor="#dc2626"
          />
        );

        setTimeout(() => {
          const qrCanvas = qrWrapper.querySelector('canvas');
          if (qrCanvas) {
            resolve(qrCanvas);
          }
        }, 100);
      }).then((qrCanvas) => {
        ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
        root.unmount();
        document.body.removeChild(qrContainer);
      });

      yPos += qrSize + 55;

      // Barcode text
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(ticket.barcode, canvas.width / 2, yPos);

      yPos += 45;

      ctx.fillStyle = '#94a3b8';
      ctx.font = '22px Arial';
      ctx.fillText('SCAN AT ENTRANCE', canvas.width / 2, yPos);

      yPos += 80;

      // Price section - prominent
      ctx.fillStyle = '#dc2626';
      ctx.font = '32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('TICKET PRICE', canvas.width / 2, yPos);

      yPos += 55;

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 60px Arial';
      ctx.fillText(`KES ${ticket.ticketPrice.toFixed(2)}`, canvas.width / 2, yPos);

      yPos += 80;

      // Decorative perforated edge effect at bottom section
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(140, yPos);
      ctx.lineTo(canvas.width - 140, yPos);
      ctx.stroke();
      ctx.setLineDash([]);

      yPos += 60;

      // Fine print at bottom
      ctx.fillStyle = '#94a3b8';
      ctx.font = '18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('This ticket is valid for one-time entry only', canvas.width / 2, yPos);

      yPos += 35;

      ctx.fillText('Present this ticket at the entrance for scanning', canvas.width / 2, yPos);

      yPos += 35;

      ctx.font = '16px Arial';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`Ticket ID: #${ticket.id}`, canvas.width / 2, yPos);

      yPos += 30;

      ctx.fillText('Non-transferable • No refunds', canvas.width / 2, yPos);

      yPos += 60;

      // Tokea Logo - using SVG data
      const logoSvg = `
        <svg height="40" viewBox="0 0 430.63 119.44" xmlns="http://www.w3.org/2000/svg">
          <g>
            <path d="M26.79,117.05l-3.14-71L3,48.22l-3-27,74.84-3.7L76.69,44,56,44.52l-.92,74.32Z" fill="#f8fafc"></path>
            <path d="M113.05,119.44,86.25,112l-4.8-74.68,14.6-16.61,46.75-3.47L155,39.62l-6.65,74.8Zm13.86-23.9,3.69-44.09L118,45,107,51.21l1.48,46.36,10,5Z" fill="#f8fafc"></path>
            <path d="M161.23,118.25l-1.1-98.71,24.2-2.39,1.85,41.23,12.57-3.59,8.87-37.28,24.94,1.19L222.4,64.59l-8,2,18.11,49.24-24.94,1.55L192.46,71.28l-5,1.32,1.85,43.26Z" fill="#f8fafc"></path>
            <path d="M253.32,119.08l-16.26-9,2-90.46L301,16.79l2.4,28.08-38.25,3.71L265,62.2l34.55-1.91L297.3,78.21l-32.33,1L264.41,96,301,92.32l3,22.1Z" fill="#f8fafc"></path>
            <path d="M356,117.05v-4.3l-32.34,3.94L310.3,98.17l2.41-33.34L351,58.74,350.4,45l-12.75.84.56,8.6L312.71,56l-4.25-33.34,39.54-6,29.75,6,2.4,92.85Zm-3.14-43.73-14.05,2-.55,12.19,17,2.62Z" fill="#f8fafc"></path>
            <path d="M420.1,85.7l-23.19-1.4-9.63-70L395.41.84,422.65,0l8,17.14Zm-24.39,7.87,25.89,1.68-1.81,21.36-22.27.56-4.22-11.8Z" fill="#dc2626"></path>
          </g>
        </svg>
      `;

      const logoBlob = new Blob([logoSvg], { type: 'image/svg+xml' });
      const logoUrl = URL.createObjectURL(logoBlob);
      const logoImg = new window.Image();

      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
        logoImg.src = logoUrl;
      });

      // Draw logo centered
      const logoWidth = 150;
      const logoHeight = (logoWidth * 119.44) / 430.63;
      ctx.drawImage(logoImg, canvas.width / 2 - logoWidth / 2, yPos, logoWidth, logoHeight);
      URL.revokeObjectURL(logoUrl);

      yPos += logoHeight + 15;

      // "Powered by SoldOutAfrica" text - styled better
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Powered by', canvas.width / 2, yPos);

      yPos += 22;

      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 18px Arial';
      ctx.fillText('SoldOutAfrica', canvas.width / 2, yPos);

      // Bottom red bar
      yPos = canvas.height - 20;
      ctx.fillStyle = redGradient;
      ctx.fillRect(0, yPos, canvas.width, 20);

      // Decorative perforated edge effect at bottom
      ctx.fillStyle = '#000000';
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.arc(i, yPos, 8, 0, Math.PI * 2);
        ctx.fill();
      }

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
                        </div>
                        <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold font-headline mb-1 break-words">{ticket.ticketName}</h3>
                        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-accent">KES {ticket.ticketPrice.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Status Badge - Prominent in left section */}
                    <div className="mb-3 md:mb-4">
                      <Badge
                        variant={ticket.status === 'VALID' ? 'default' : 'secondary'}
                        className={`text-xs sm:text-sm md:text-base px-3 sm:px-4 py-1.5 sm:py-2 font-bold ${ticket.status === 'VALID'
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-gray-400 hover:bg-gray-500 text-white'
                          }`}
                      >
                        {ticket.status === 'VALID' ? '✓ VALID TICKET' : '✗ ALREADY REDEEMED'}
                      </Badge>
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
                  <div className="relative bg-muted/30 md:bg-muted/50 p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col items-center justify-center md:min-w-[320px] lg:min-w-[380px] border-t-2 md:border-t-0 md:border-l-2 border-dashed">
                    {/* Decorative circles for tear effect */}
                    <div className="absolute left-1/2 -translate-x-1/2 md:left-0 md:-translate-x-1/2 top-0 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-background rounded-full border-2"></div>
                    <div className="hidden md:block absolute left-0 -translate-x-1/2 bottom-0 translate-y-1/2 w-6 h-6 bg-background rounded-full border-2"></div>

                    {ticket.barcode ? (
                      <div className="text-center w-full">
                        {/* Status Badge - Prominent */}
                        <div className="mb-4">
                          <Badge
                            variant={ticket.status === 'VALID' ? 'default' : 'secondary'}
                            className={`text-sm sm:text-base md:text-lg px-4 py-2 font-bold ${ticket.status === 'VALID'
                              ? 'bg-green-500 hover:bg-green-600 text-white'
                              : 'bg-gray-400 hover:bg-gray-500 text-white'
                              }`}
                          >
                            {ticket.status === 'VALID' ? '✓ VALID' : '✗ REDEEMED'}
                          </Badge>
                        </div>

                        {/* Larger QR Code - Optimized for Mobile Scanning */}
                        <div className="bg-background p-4 sm:p-5 md:p-6 rounded-lg md:rounded-xl shadow-lg mb-3 md:mb-4 inline-block border mx-auto">
                          <QRCode
                            value={ticket.barcode}
                            size={320}
                            quietZone={10}
                            bgColor="#FFFFFF"
                            fgColor="#000000"
                            qrStyle="fluid"
                            eyeRadius={[
                              { outer: 10, inner: 0 },
                              { outer: 10, inner: 0 },
                              { outer: 10, inner: 0 }
                            ]}
                            eyeColor="#dc2626"
                            style={{
                              maxWidth: '100%',
                              height: 'auto'
                            }}
                          />
                        </div>
                        <p className="font-mono text-xs sm:text-sm md:text-base text-muted-foreground mb-2 md:mb-3 break-all px-2 sm:px-3 leading-relaxed font-semibold">{ticket.barcode}</p>
                        <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground uppercase tracking-wider font-medium">Scan at entrance</p>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <div className="w-[280px] h-[280px] sm:w-[300px] sm:h-[300px] md:w-[320px] md:h-[320px] lg:w-[340px] lg:h-[340px] bg-muted rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4 border mx-auto">
                          <p className="text-sm">No QR Code</p>
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
