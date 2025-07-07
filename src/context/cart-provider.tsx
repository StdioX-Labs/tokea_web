'use client';

import type { CartItem, Order, TicketType } from '@/lib/types';
import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useToast } from '@/hooks/use-toast';

interface CartContextType {
  items: CartItem[];
  addItem: (
    eventId: string,
    eventName: string,
    ticketType: TicketType,
    quantity: number
  ) => void;
  removeItem: (ticketTypeId: string) => void;
  updateQuantity: (ticketTypeId: string, quantity: number) => void;
  clearCart: () => void;
  createOrder: (customerName: string, customerEmail: string, couponCode?: string) => Order;
  getOrder: (orderId: string) => Order | null;
  cartTotal: number;
  itemCount: number;
  isCartOpen: boolean;
  setCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCartOpen, setCartOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedItems = localStorage.getItem('summer_cart_items');
      if (storedItems) {
        setItems(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error('Failed to parse cart items from localStorage', error);
      setItems([]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('summer_cart_items', JSON.stringify(items));
      } catch (error) {
        console.error('Failed to save cart items to localStorage', error);
      }
    }
  }, [items, isLoaded]);
  
  const addItem = useCallback(
    (
      eventId: string,
      eventName: string,
      ticketType: TicketType,
      quantity: number
    ) => {
      setItems((prevItems) => {
        const isNewEvent = prevItems.length > 0 && prevItems[0].eventId !== eventId;

        if (isNewEvent) {
            toast({
                title: "Cart Cleared",
                description: "Your cart was cleared to add tickets for a new event."
            })
        }
        
        const currentCart = isNewEvent ? [] : prevItems;

        const existingItem = currentCart.find(item => item.ticketTypeId === ticketType.id);

        if (existingItem) {
          // Update quantity of existing item
          return currentCart.map(item =>
            item.ticketTypeId === ticketType.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          // Add new item
          return [
            ...currentCart,
            {
              eventId,
              eventName,
              ticketTypeId: ticketType.id,
              ticketTypeName: ticketType.name,
              price: ticketType.price,
              quantity,
            },
          ];
        }
      });
    },
    [toast]
  );

  const removeItem = useCallback((ticketTypeId: string) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.ticketTypeId !== ticketTypeId)
    );
  }, []);

  const updateQuantity = useCallback((ticketTypeId: string, quantity: number) => {
    setItems((prevItems) => {
      if (quantity <= 0) {
        return prevItems.filter((item) => item.ticketTypeId !== ticketTypeId);
      }
      return prevItems.map((item) =>
        item.ticketTypeId === ticketTypeId ? { ...item, quantity } : item
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    if (isLoaded) {
       localStorage.removeItem('summer_cart_items');
    }
  }, [isLoaded]);

  const createOrder = useCallback((customerName: string, customerEmail: string, couponCode?: string): Order => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newOrder: Order = {
      id: `SUMMER-${Date.now()}`,
      customerName,
      customerEmail,
      items: [...items],
      total,
      orderDate: new Date().toISOString(),
      couponCode: couponCode,
    };
    
    try {
      localStorage.setItem(`order_${newOrder.id}`, JSON.stringify(newOrder));
    } catch (error) {
      console.error("Failed to save order to localStorage", error);
    }

    // Don't clear cart here, it will be cleared after successful payment
    return newOrder;
  }, [items]);

  const getOrder = useCallback((orderId: string): Order | null => {
    try {
      const storedOrder = localStorage.getItem(`order_${orderId}`);
      return storedOrder ? JSON.parse(storedOrder) : null;
    } catch (error) {
      console.error("Failed to retrieve order from localStorage", error);
      return null;
    }
  }, []);

  const cartTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    createOrder,
    getOrder,
    cartTotal,
    itemCount,
    isCartOpen,
    setCartOpen,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
