'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from './ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  totalAmount: number;
}

type PaymentStatus = 'idle' | 'selecting' | 'processing' | 'success';

export default function PaymentModal({
  isOpen,
  onClose,
  onPaymentSuccess,
  totalAmount,
}: PaymentModalProps) {
  const [status, setStatus] = useState<PaymentStatus>('selecting');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal is closed
      setTimeout(() => {
        setStatus('selecting');
        setProgress(0);
      }, 300);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'processing') {
      setProgress(10);
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(timer);
            return 100;
          }
          return prev + Math.floor(Math.random() * 10) + 5;
        });
      }, 500);
    }
    return () => clearInterval(timer);
  }, [status]);
  
  useEffect(() => {
    if (progress === 100) {
      setStatus('success');
      setTimeout(() => {
        onPaymentSuccess();
      }, 1500);
    }
  }, [progress, onPaymentSuccess]);

  const handlePaymentMethodSelect = () => {
    setStatus('processing');
  };

  const renderContent = () => {
    switch (status) {
      case 'selecting':
        return (
          <>
            <DialogDescription>
              Please select a payment method to pay ${totalAmount.toFixed(2)}.
            </DialogDescription>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <Button size="lg" onClick={handlePaymentMethodSelect}>Pay with M-Pesa</Button>
              <Button size="lg" onClick={handlePaymentMethodSelect}>Pay with Paystack</Button>
            </div>
          </>
        );
      case 'processing':
        return (
          <div className='flex flex-col items-center gap-4 text-center'>
            <Loader2 className="h-12 w-12 animate-spin text-accent" />
            <DialogDescription>
                Processing your payment. Please do not close this window.
            </DialogDescription>
            <Progress value={progress} className="w-full" />
            <p className='text-sm text-muted-foreground'>{progress}% complete</p>
          </div>
        );
      case 'success':
        return (
            <div className='flex flex-col items-center gap-4 text-center'>
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <DialogTitle className='text-2xl'>Payment Successful!</DialogTitle>
            <DialogDescription>
                Your order is confirmed. Redirecting you to the confirmation page...
            </DialogDescription>
          </div>
        )
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='font-headline text-center text-2xl'>Complete Your Purchase</DialogTitle>
        </DialogHeader>
        <div className="py-4">
            {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
