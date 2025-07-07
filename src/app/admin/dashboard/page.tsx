import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Ticket, Users, Activity } from "lucide-react";
import { getCompanyEvents } from "@/services/event-service";
import { isFuture } from 'date-fns';

export default async function DashboardPage() {
    let activeEventsCount = 0;
    try {
        const allEvents = await getCompanyEvents();
        // An event is considered active if its start date is in the future.
        activeEventsCount = allEvents.filter(event => isFuture(new Date(event.date))).length;
    } catch (error) {
        console.error("Failed to fetch events for dashboard:", error);
        // If the API fails, the count will remain 0, which is a safe fallback.
    }

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold tracking-tight font-headline mb-8">
                Dashboard
            </h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">KES 45,231.89</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+2350</div>
                        <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+573</div>
                        <p className="text-xs text-muted-foreground">+19% from last month</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeEventsCount}</div>
                        <p className="text-xs text-muted-foreground">Upcoming events</p>
                    </CardContent>
                </Card>
            </div>
             <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                        <CardDescription>A chart displaying sales over time will be here.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-96 bg-muted/50 rounded-md flex items-center justify-center">
                        <p className="text-muted-foreground">Chart Placeholder</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
