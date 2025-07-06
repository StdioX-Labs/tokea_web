import Link from 'next/link';

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href}>
    <span className="animated-text-stroke font-headline text-lg font-medium transition-colors hover:text-primary/80">
      {children}
    </span>
  </Link>
);

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-6 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by your local event enthusiasts.
          </p>
        </div>
        <div className="flex items-center gap-4">
            <FooterLink href="#">About</FooterLink>
            <FooterLink href="#">Contact</FooterLink>
            <FooterLink href="#">Terms</FooterLink>
        </div>
      </div>
    </footer>
  );
}
