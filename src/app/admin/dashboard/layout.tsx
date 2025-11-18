'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AdminFooter from '@/components/admin-footer';
import Logo from '@/components/logo';

// Session timeout in milliseconds (5 hours)
const SESSION_TIMEOUT = 5 * 60 * 60 * 1000;

function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
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

        // Set user name/email if available
        if (userData.email) {
          setUserName(userData.email);
        } else if (userData.fullName) {
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
    <div className="flex min-h-screen flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Logo />
            <span className="hidden sm:inline-block text-xs rounded-full px-2 py-0.5 bg-muted text-muted-foreground">
              Admin
            </span>
          </div>

          {/* Right side: User info and Logout */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-[200px]">
                {userName}
              </span>
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src="https://github.com/shadcn.png" alt="@admin" />
                <AvatarFallback className="text-xs">
                  {userName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Footer */}
      <AdminFooter />
    </div>
  );
}

export default AdminLayout;
