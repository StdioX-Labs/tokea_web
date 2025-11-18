'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Check if the current path is an admin route
    const isAdminRoute = pathname?.startsWith('/admin');

    // For admin routes, render children without Header and Footer
    if (isAdminRoute) {
        return <>{children}</>;
    }

    // For non-admin routes, render with Header and Footer
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
        </div>
    );
}
