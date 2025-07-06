'use client';

import Link from 'next/link';
import { ShoppingCart, User, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-provider';
import CartSheet from './cart-sheet';
import { useState } from 'react';
import SearchDrawer from './search-drawer';

export default function Header() {
  const { itemCount, setCartOpen } = useCart();
  const [isSearchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-headline text-xl font-bold tracking-tighter">
              Summer
            </span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/login">
                <User className="h-5 w-5" />
                <span className="sr-only">Profile</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setCartOpen(true)}
            >
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                  {itemCount}
                </span>
              )}
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Open Cart</span>
            </Button>
          </div>
        </div>
      </header>
      <CartSheet />
      <SearchDrawer isOpen={isSearchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
