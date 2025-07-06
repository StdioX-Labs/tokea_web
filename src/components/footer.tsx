'use client';

import Link from 'next/link';
import { Twitter, Instagram, Facebook } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="text-muted-foreground transition-colors hover:text-foreground">
    {children}
  </Link>
);

const SocialLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-foreground">
        {children}
    </Link>
)

export default function Footer() {
    const pathname = usePathname();

    if (pathname.startsWith('/admin')) {
        return null;
    }

  return (
    <footer 
        className={cn( "w-full border-t bg-background")}
    >
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-y-10 gap-x-8 py-20">
        <div className="flex flex-col gap-4 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2">
                <span className="font-headline text-2xl font-bold tracking-tighter">
                Summer
                </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
                Made by{' '}
                <a 
                    href="https://soldout.africa" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                    SoldoutAfrica
                </a>
                . Your one-stop shop for the hottest summer events.
            </p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-headline font-semibold text-lg mb-1">Navigate</h3>
          <FooterLink href="#">About</FooterLink>
          <FooterLink href="#">Contact</FooterLink>
          <FooterLink href="#">Terms of Service</FooterLink>
          <FooterLink href="#">Privacy Policy</FooterLink>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-headline font-semibold text-lg mb-1">Connect</h3>
          <div className="flex gap-4">
            <SocialLink href="https://twitter.com">
                <Twitter className="h-6 w-6" />
                <span className="sr-only">Twitter</span>
            </SocialLink>
             <SocialLink href="https://instagram.com">
                <Instagram className="h-6 w-6" />
                 <span className="sr-only">Instagram</span>
            </SocialLink>
             <SocialLink href="https://facebook.com">
                <Facebook className="h-6 w-6" />
                 <span className="sr-only">Facebook</span>
            </SocialLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
