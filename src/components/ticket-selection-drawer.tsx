'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
  SheetDescription,
} from '@/components/ui/sheet';
import type { Event, TicketType } from '@/lib/types';
import { Button } from './ui/button';
import { Minus, Plus } from 'lucide-react';
import { useCart } from '@/context/cart-provider';
import { useToast } from '@/hooks/use-toast';

interface TicketSelectionDrawerProps {
  event: Event;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function TicketSelectionDrawer({
  event,
  isOpen,
  onOpenChange,
}: TicketSelectionDrawerProps) {
  const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>(
    event.ticketTypes.reduce((acc, type) => ({ ...acc, [type.id]: 0 }), {})
  );

  const { addItem } = useCart();
  const { toast } = useToast();

  const handleQuantityChange = (ticketTypeId: string, change: number) => {
    setTicketQuantities((prev) => ({
      ...prev,
      [ticketTypeId]: Math.max(0, prev[ticketTypeId] + change),
    }));
  };

  const handleAddToCart = () => {
    let itemsAdded = false;
    event.ticketTypes.forEach((ticketType) => {
      const quantity = ticketQuantities[ticketType.id];
      if (quantity > 0) {
        addItem(event.id, event.name, ticketType, quantity);
        itemsAdded = true;
      }
    });

    if (itemsAdded) {
      toast({
        title: "Tickets added to cart!",
        description: `Your tickets for ${event.name} are waiting for you.`,
      });
      onOpenChange(false);
    } else {
        toast({
            title: "No tickets selected",
            description: "Please select at least one ticket to add to your cart.",
            variant: "destructive"
        })
    }
  };

  const total = event.ticketTypes.reduce((acc, type) => {
    return acc + type.price * (ticketQuantities[type.id] || 0);
  }, 0);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-lg">
        <SheetHeader className="text-left">
          <SheetTitle className="font-headline">{event.name}</SheetTitle>
          <SheetDescription>Select your tickets</SheetDescription>
        </SheetHeader>
        <div className="my-4 space-y-4">
          {event.ticketTypes.map((ticketType) => (
            <div key={ticketType.id} className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{ticketType.name}</p>
                <p className="text-muted-foreground">KES {ticketType.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleQuantityChange(ticketType.id, -1)}
                  disabled={ticketQuantities[ticketType.id] === 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center text-lg font-bold">
                  {ticketQuantities[ticketType.id]}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleQuantityChange(ticketType.id, 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <SheetFooter>
          <div className="flex w-full items-center justify-between gap-4">
             <div className="text-xl font-bold">
                Total: <span className="text-accent">KES {total.toFixed(2)}</span>
            </div>
            <Button
              size="lg"
              className="flex-grow bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
