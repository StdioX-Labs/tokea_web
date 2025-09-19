'use client';

import { useEffect, useState } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AdminFooter from '@/components/admin-footer';
import Logo from '@/components/logo';

// Session timeout in milliseconds (5 hours)
const SESSION_TIMEOUT = 5 * 60 * 60 * 1000;

function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userMobile, setUserMobile] = useState<string>('Admin User');
  const [userName, setUserName] = useState<string>('Admin User');
  const [sessionExpired, setSessionExpired] = useState(false);

  // Check for session expiration and get user mobile number
  useEffect(() => {
    const checkSession = () => {
      try {
        const adminUser = localStorage.getItem('adminUser');
        if (!adminUser) {
          // No user data found, redirect to login
          router.push('/admin/login');
          return;
        }

        const userData = JSON.parse(adminUser);

        // Check if session has expired (5 hours)
        if (userData.loginTime) {
          const currentTime = Date.now();
          const sessionAge = currentTime - userData.loginTime;

          if (sessionAge > SESSION_TIMEOUT) {
            // Session expired, log user out
            setSessionExpired(true);
            localStorage.removeItem('adminUser');
            router.push('/admin/login');
            return;
          }

          // Update the login time to extend the session on activity
          userData.loginTime = currentTime;
          localStorage.setItem('adminUser', JSON.stringify(userData));
        }

        // Set user name if available
        if (userData.fullName) {
          setUserName(userData.fullName);
        } else if (userData.mobileNumber) {
          setUserName(userData.mobileNumber);
        }
      } catch (error) {
        console.error('Error reading user data from localStorage:', error);
      }
    };

    // Check session on mount
    checkSession();

    // Set up periodic check every minute
    const interval = setInterval(checkSession, 60 * 1000);

    // Set up event listeners for user activity to extend session
    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    const handleUserActivity = checkSession;

    activityEvents.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });

    // Cleanup
    return () => {
      clearInterval(interval);
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [router]);

  const handleLogout = () => {
    // Clear user session
    localStorage.removeItem('adminUser');
    console.log('Logging out...');
    router.push('/admin/login');
  };

  // If session expired, don't render the layout
  if (sessionExpired) {
    return null;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-xs rounded-full px-2 py-0.5 bg-sidebar-accent text-sidebar-accent-foreground">
              Admin
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/admin/dashboard'}
                tooltip="Dashboard"
              >
                <Link href="/admin/dashboard">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/admin/dashboard/events'}
                tooltip="Events"
              >
                <Link href="/admin/dashboard/events">
                  <Calendar />
                  <span>Events</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/admin/dashboard/orders'}
                tooltip="Transactions"
              >
                <Link href="/admin/dashboard/orders">
                  <Ticket />
                  <span>Transactions</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="flex items-center justify-between p-2 border-t">
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1" /> Logout
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b bg-background px-4 lg:justify-end">
          <SidebarTrigger className="lg:hidden" />
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{userName}</span>
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" alt="@admin" />
              <AvatarFallback>{userName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <AdminFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}

export default AdminLayout;
