'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { SuperAdminUserManagement } from "@/components/super-admin-user-management";

// Super admin user IDs
const SUPER_ADMIN_IDS = [1, 2, 76, 133, 5, 52];

interface UserEvent {
    id: number;
    eventName: string;
    eventPosterUrl: string;
    eventLocation: string;
    eventStartDate: string;
    isActive: boolean;
    companyId: number;
    category: string;
    currency: string;
}

export default function DashboardPage() {
    const [events, setEvents] = useState<UserEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    useEffect(() => {
        const adminUser = localStorage.getItem('adminUser');
        if (adminUser) {
            try {
                const userData = JSON.parse(adminUser);
                const currentUserId = userData.user_id || userData.userId;
                setUserId(currentUserId);

                // Check if user is a super admin
                setIsSuperAdmin(SUPER_ADMIN_IDS.includes(currentUserId));
            } catch (error) {
                console.error('Error parsing user data:', error);
                setError('Failed to load user data');
                setLoading(false);
            }
        } else {
            setError('User not logged in');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (userId === null) return;

        const fetchUserEvents = async () => {
            try {
                const response = await fetch(`/api/user-events?userId=${userId}`);
                if (!response.ok) throw new Error('Failed to fetch events');

                const data = await response.json();
                if (data.status) {
                    setEvents(data.events);
                }
            } catch (error) {
                console.error('Error fetching user events:', error);
                setError('Failed to load events');
            } finally {
                setLoading(false);
            }
        };

        fetchUserEvents();
    }, [userId]);

    if (loading) {
        return (
            <div className="container py-8 flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-8">
                <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-headline">
                        {isSuperAdmin ? 'Super Admin Dashboard' : 'My Events'}
                    </h1>
                    {isSuperAdmin && (
                        <p className="text-sm text-muted-foreground mt-1">
                            You have super admin privileges
                        </p>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">
                    {events.length} {events.length === 1 ? 'event' : 'events'}
                </p>
            </div>

            {isSuperAdmin && (
                <div className="mb-8">
                    <SuperAdminUserManagement />
                </div>
            )}

            {events.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium text-muted-foreground">No events found</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {events.map((event) => (
                        <Link
                            key={event.id}
                            href={`/admin/dashboard/event/${event.id}`}
                            className="group"
                        >
                            <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
                                <div className="aspect-[4/5] w-full overflow-hidden">
                                    <img
                                        src={event.eventPosterUrl}
                                        alt={event.eventName}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = 'https://via.placeholder.com/400x500?text=Event';
                                        }}
                                    />
                                </div>
                                <CardHeader className="pb-3">
                                    <CardTitle className="line-clamp-2 text-lg">
                                        {event.eventName}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                                        <span className="truncate">
                                            {format(new Date(event.eventStartDate), 'eee, MMM d, yyyy')}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pt-1">
                                        <Badge variant={event.isActive ? "default" : "secondary"}>
                                            {event.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {event.category}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
