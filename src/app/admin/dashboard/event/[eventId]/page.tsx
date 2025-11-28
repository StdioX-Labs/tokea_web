'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Loader2, DollarSign, Ticket, TrendingUp, Gift, ArrowLeft, PlusCircle, MoreHorizontal, Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { IssueComplementaryModal } from '@/components/issue-complementary-modal';
import { AddTicketModal } from '@/components/add-ticket-modal';
import { AddEventModal } from '@/components/add-event-modal';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { TicketType, Event } from '@/lib/types';

interface EventData {
    id: number;
    eventName: string;
    eventDescription?: string;
    eventPosterUrl: string;
    eventLocation: string;
    eventStartDate: string;
    eventEndDate?: string;
    isActive: boolean;
    companyId: number;
    category: string;
    currency: string;
    ticketSaleStartDate?: string;
    ticketSaleEndDate?: string;
}

interface TransactionBalances {
    platform_fee: number;
    availableFunds: number;
    grossFee: number;
}

interface EventTicket {
    id: number;
    ticketName: string;
    ticketPrice: number;
    quantityAvailable: number;
    soldQuantity: number;
    isActive: boolean;
    isSoldOut: boolean;
    ticketStatus: string;
    ticketsToIssue?: number;
    ticketLimitPerPerson?: number;
    numberOfComplementary?: number;
    ticketSaleStartDate?: string;
    ticketSaleEndDate?: string;
}

interface GLTransaction {
    id: number;
    ticketName: string;
    transactionType: string;
    creditAmount: number;
    debitAmount: number;
    netEffect: number;
    createdAt: string;
}

interface ComplementaryTicket {
    id: number;
    eventName: string;
    ticketName: string;
    ticketPrice: number;
    ticketGroupCode: string;
    customerMobile: string;
    isComplementary: boolean;
    status: string;
    issuedBy: string;
    createdAt: string;
}

export default function EventDetailsPage() {
    const params = useParams();
    const eventId = params.eventId as string;

    const [event, setEvent] = useState<EventData | null>(null);
    const [balances, setBalances] = useState<TransactionBalances | null>(null);
    const [tickets, setTickets] = useState<EventTicket[]>([]);
    const [transactions, setTransactions] = useState<GLTransaction[]>([]);
    const [complementary, setComplementary] = useState<ComplementaryTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingStates, setLoadingStates] = useState({
        event: true,
        balances: true,
        tickets: true,
        transactions: true,
        complementary: true
    });
    const [errors, setErrors] = useState({
        event: null as string | null,
        balances: null as string | null,
        tickets: null as string | null,
        transactions: null as string | null,
        complementary: null as string | null
    });
    const [userId, setUserId] = useState<number | null>(null);
    const [companyId, setCompanyId] = useState<number | null>(null);
    const [userDataLoaded, setUserDataLoaded] = useState(false);
    const [isComplementaryModalOpen, setIsComplementaryModalOpen] = useState(false);
    const [isAddTicketModalOpen, setIsAddTicketModalOpen] = useState(false);
    const [editingTicket, setEditingTicket] = useState<TicketType | null>(null);
    const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false);

    const fetchComplementary = async (retryCount = 0): Promise<void> => {
        if (!eventId) return;

        try {
            const compsRes = await fetch(`/api/complementary-tickets?eventId=${eventId}`);

            console.log('Fetching complementary tickets, Attempt:', retryCount + 1);

            if (!compsRes.ok) {
                throw new Error(`HTTP error! status: ${compsRes.status}`);
            }

            const compsData = await compsRes.json();

            console.log('Complementary tickets response:', compsData);

            if (compsData?.comps) {
                setComplementary(compsData.comps);
                setErrors(prev => ({ ...prev, complementary: null }));
            } else {
                setErrors(prev => ({ ...prev, complementary: 'No complementary tickets' }));
            }
        } catch (error) {
            console.error('Error fetching complementary tickets:', error, 'Retry count:', retryCount);

            if (retryCount < 5) {
                const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
                console.log(`Retrying complementary tickets in ${delay}ms...`);
                setTimeout(() => fetchComplementary(retryCount + 1), delay);
            } else {
                setErrors(prev => ({ ...prev, complementary: 'Failed to load complementary tickets after 5 attempts' }));
                setLoadingStates(prev => ({ ...prev, complementary: false }));
            }
            return;
        }
        setLoadingStates(prev => ({ ...prev, complementary: false }));
    };

    useEffect(() => {
        const adminUser = localStorage.getItem('adminUser');
        if (adminUser) {
            try {
                const userData = JSON.parse(adminUser);
                const loadedUserId = userData.user_id || userData.userId;
                const loadedCompanyId = userData.company_id || userData.companyId;

                setUserId(loadedUserId);
                setCompanyId(loadedCompanyId);
                setUserDataLoaded(true);

                console.log('Loaded user data:', { userId: loadedUserId, companyId: loadedCompanyId });
            } catch (error) {
                console.error('Error parsing user data:', error);
                setUserDataLoaded(true);
            }
        } else {
            setUserDataLoaded(true);
        }
    }, []);

    useEffect(() => {
        if (!eventId || !userDataLoaded || !userId || !companyId) {
            console.log('Waiting for dependencies:', { eventId, userDataLoaded, userId, companyId });
            return;
        }

        const fetchEventData = async () => {
            try {
                const eventRes = await fetch(`/api/user-events?userId=${userId}`);
                const eventData = await eventRes.json();

                console.log('Event API Response:', eventData);
                console.log('Looking for eventId:', eventId, 'Type:', typeof eventId);

                if (eventData?.status && eventData?.events) {
                    console.log('All event IDs:', eventData.events.map((e: EventData) => ({ id: e.id, type: typeof e.id })));

                    const foundEvent = eventData.events.find((e: EventData) => {
                        // Compare both as strings and numbers to be safe
                        return e.id == eventId || e.id === parseInt(eventId) || String(e.id) === String(eventId);
                    });

                    console.log('Found event:', foundEvent);

                    if (foundEvent) {
                        setEvent(foundEvent);
                        setErrors(prev => ({ ...prev, event: null }));

                        // Use the event's company ID for subsequent API calls
                        const eventCompanyId = foundEvent.companyId || 54;
                        console.log('Using event company ID:', eventCompanyId);

                        // Fetch other data using the event's company ID
                        fetchBalances(eventCompanyId);
                        fetchTransactions(eventCompanyId);
                    } else {
                        setErrors(prev => ({ ...prev, event: 'Event not found' }));
                    }
                } else {
                    console.error('Invalid event data structure:', eventData);
                    setErrors(prev => ({ ...prev, event: 'Failed to load event data' }));
                }
            } catch (error) {
                console.error('Error fetching event:', error);
                setErrors(prev => ({ ...prev, event: 'Failed to load event data' }));
            } finally {
                setLoadingStates(prev => ({ ...prev, event: false }));
                setLoading(false);
            }
        };

        const fetchBalances = async (eventCompanyId?: number, retryCount = 0): Promise<void> => {
            try {
                const companyIdToUse = eventCompanyId || companyId || 54;
                const balancesRes = await fetch(`/api/transaction-balances?companyId=${companyIdToUse}&eventId=${eventId}`);

                console.log('Fetching balances with companyId:', companyIdToUse, 'Attempt:', retryCount + 1);

                if (!balancesRes.ok) {
                    throw new Error(`HTTP error! status: ${balancesRes.status}`);
                }

                const balancesData = await balancesRes.json();

                if (balancesData?.balances) {
                    setBalances(balancesData.balances);
                    setErrors(prev => ({ ...prev, balances: null }));
                } else {
                    setErrors(prev => ({ ...prev, balances: 'No balance data available' }));
                }
            } catch (error) {
                console.error('Error fetching balances:', error, 'Retry count:', retryCount);

                if (retryCount < 5) {
                    // Retry after a delay (exponential backoff)
                    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
                    console.log(`Retrying balances in ${delay}ms...`);
                    setTimeout(() => fetchBalances(eventCompanyId, retryCount + 1), delay);
                } else {
                    setErrors(prev => ({ ...prev, balances: 'Failed to load balances after 5 attempts' }));
                    setLoadingStates(prev => ({ ...prev, balances: false }));
                }
                return;
            }
            setLoadingStates(prev => ({ ...prev, balances: false }));
        };

        const fetchTickets = async (retryCount = 0): Promise<void> => {
            try {
                const ticketsRes = await fetch(`/api/event-tickets?eventId=${eventId}`);

                console.log('Fetching tickets, Attempt:', retryCount + 1);

                if (!ticketsRes.ok) {
                    throw new Error(`HTTP error! status: ${ticketsRes.status}`);
                }

                const ticketsData = await ticketsRes.json();

                if (ticketsData?.ticket) {
                    setTickets(ticketsData.ticket);
                    setErrors(prev => ({ ...prev, tickets: null }));
                } else {
                    setErrors(prev => ({ ...prev, tickets: 'No tickets available' }));
                }
            } catch (error) {
                console.error('Error fetching tickets:', error, 'Retry count:', retryCount);

                if (retryCount < 5) {
                    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
                    console.log(`Retrying tickets in ${delay}ms...`);
                    setTimeout(() => fetchTickets(retryCount + 1), delay);
                } else {
                    setErrors(prev => ({ ...prev, tickets: 'Failed to load tickets after 5 attempts' }));
                    setLoadingStates(prev => ({ ...prev, tickets: false }));
                }
                return;
            }
            setLoadingStates(prev => ({ ...prev, tickets: false }));
        };

        const fetchTransactions = async (eventCompanyId?: number, retryCount = 0): Promise<void> => {
            try {
                const companyIdToUse = eventCompanyId || companyId || 54;
                const transactionsRes = await fetch(`/api/gl-transactions?eventId=${eventId}&companyId=${companyIdToUse}`);

                console.log('Fetching transactions with companyId:', companyIdToUse, 'Attempt:', retryCount + 1);

                if (!transactionsRes.ok) {
                    throw new Error(`HTTP error! status: ${transactionsRes.status}`);
                }

                const transactionsData = await transactionsRes.json();

                if (transactionsData?.data) {
                    setTransactions(transactionsData.data);
                    setErrors(prev => ({ ...prev, transactions: null }));
                } else {
                    setErrors(prev => ({ ...prev, transactions: 'No transactions available' }));
                }
            } catch (error) {
                console.error('Error fetching transactions:', error, 'Retry count:', retryCount);

                if (retryCount < 5) {
                    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
                    console.log(`Retrying transactions in ${delay}ms...`);
                    setTimeout(() => fetchTransactions(eventCompanyId, retryCount + 1), delay);
                } else {
                    setErrors(prev => ({ ...prev, transactions: 'Failed to load transactions after 5 attempts' }));
                    setLoadingStates(prev => ({ ...prev, transactions: false }));
                }
                return;
            }
            setLoadingStates(prev => ({ ...prev, transactions: false }));
        };

        fetchEventData();
        fetchTickets();
        fetchComplementary();
    }, [eventId, userDataLoaded]);

    // Add separate effect for userId and companyId to avoid dependency array size changes
    useEffect(() => {
        if (userId !== null && companyId !== null) {
            console.log('User credentials ready:', { userId, companyId });
        }
    }, [userId, companyId]);

    const handleAddTicket = () => {
        setEditingTicket(null);
        setIsAddTicketModalOpen(true);
    };

    const handleEditTicket = (ticket: EventTicket) => {
        // Convert EventTicket to TicketType format
        const ticketType: TicketType = {
            id: String(ticket.id),
            name: ticket.ticketName,
            price: ticket.ticketPrice,
            quantityAvailable: ticket.quantityAvailable,
            ticketsToIssue: ticket.ticketsToIssue || 1,
            ticketLimitPerPerson: ticket.ticketLimitPerPerson || 0,
            numberOfComplementary: ticket.numberOfComplementary || 0,
            saleStartDate: ticket.ticketSaleStartDate || new Date().toISOString(),
            saleEndDate: ticket.ticketSaleEndDate || new Date().toISOString(),
            status: ticket.isActive ? 'active' : 'disabled',
        };
        setEditingTicket(ticketType);
        setIsAddTicketModalOpen(true);
    };

    const handleTicketModalSuccess = () => {
        setIsAddTicketModalOpen(false);
        setEditingTicket(null);
        // Refetch tickets
        const fetchTickets = async () => {
            try {
                const ticketsRes = await fetch(`/api/event-tickets?eventId=${eventId}`);
                if (ticketsRes.ok) {
                    const ticketsData = await ticketsRes.json();
                    if (ticketsData?.ticket) {
                        setTickets(ticketsData.ticket);
                    }
                }
            } catch (error) {
                console.error('Error refetching tickets:', error);
            }
        };
        fetchTickets();
    };

    const handleEditEvent = () => {
        setIsEditEventModalOpen(true);
    };

    const handleEditEventSuccess = async () => {
        setIsEditEventModalOpen(false);
        // Refetch event data without full page reload
        try {
            const eventRes = await fetch(`/api/user-events?userId=${userId}`);
            const eventData = await eventRes.json();

            if (eventData?.status && eventData?.events) {
                const foundEvent = eventData.events.find((e: EventData) => {
                    return e.id == eventId || e.id === parseInt(eventId) || String(e.id) === String(eventId);
                });

                if (foundEvent) {
                    setEvent(foundEvent);
                    console.log('Event updated successfully:', foundEvent);
                }
            }
        } catch (error) {
            console.error('Error refetching event:', error);
        }
    };

    if (loading) {
        return (
            <div className="container py-8 flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading event details...</p>
            </div>
        );
    }

    if (errors.event || !event) {
        return (
            <div className="container py-8">
                <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
                    {errors.event || 'Event not found'}
                </div>
                <Link href="/admin/dashboard">
                    <Button variant="outline" className="mt-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container py-6 sm:py-8">
            <IssueComplementaryModal
                isOpen={isComplementaryModalOpen}
                onOpenChange={setIsComplementaryModalOpen}
                eventId={parseInt(eventId)}
                availableTickets={tickets.map(t => ({
                    id: t.id,
                    ticketName: t.ticketName,
                    ticketPrice: t.ticketPrice
                }))}
                onSuccess={fetchComplementary}
            />

            <AddTicketModal
                isOpen={isAddTicketModalOpen}
                onOpenChange={setIsAddTicketModalOpen}
                onSuccess={handleTicketModalSuccess}
                ticket={editingTicket}
                eventId={eventId}
            />

            <AddEventModal
                isOpen={isEditEventModalOpen}
                onOpenChange={setIsEditEventModalOpen}
                onSuccess={handleEditEventSuccess}
                event={event ? {
                    id: String(event.id),
                    slug: String(event.id),
                    name: event.eventName,
                    eventName: event.eventName,
                    date: event.eventStartDate,
                    eventStartDate: event.eventStartDate,
                    endDate: event.eventEndDate,
                    eventEndDate: event.eventEndDate,
                    location: event.eventLocation,
                    eventLocation: event.eventLocation,
                    posterImage: event.eventPosterUrl,
                    eventPosterUrl: event.eventPosterUrl,
                    posterImageHint: '',
                    description: event.eventDescription || '',
                    eventDescription: event.eventDescription || '',
                    artists: [],
                    venue: { name: event.eventLocation, address: '', capacity: 0 },
                    ticketTypes: [],
                    isActive: event.isActive,
                    category: { id: '1', name: event.category },
                    promotions: [],
                    ticketSaleStartDate: event.ticketSaleStartDate,
                    ticketSaleEndDate: event.ticketSaleEndDate,
                } as Event : null}
                mode="edit"
            />

            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <Link href="/admin/dashboard">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Events
                        </Button>
                    </Link>
                    <Button onClick={handleEditEvent} variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Event
                    </Button>
                </div>
                <div className="flex flex-col md:flex-row gap-6">
                    <img
                        src={event.eventPosterUrl}
                        alt={event.eventName}
                        className="w-full md:w-64 h-80 object-cover rounded-lg"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/256x320?text=Event';
                        }}
                    />
                    <div className="flex-1">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight font-headline mb-2">
                                    {event.eventName}
                                </h1>
                                <div className="flex items-center gap-4 text-muted-foreground mb-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>{format(new Date(event.eventStartDate), 'EEEE, MMMM d, yyyy')}</span>
                                    </div>
                                    <Badge variant={event.isActive ? "default" : "secondary"}>
                                        {event.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="h-4 w-4" />
                                    <span>{event.eventLocation}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction Balances */}
            <div className="grid gap-4 sm:grid-cols-3 mb-6">
                {loadingStates.balances ? (
                    <Card className="col-span-full">
                        <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Loading balance data...</p>
                        </CardContent>
                    </Card>
                ) : errors.balances ? (
                    <Card className="col-span-full">
                        <CardContent className="py-8">
                            <div className="text-sm text-muted-foreground text-center">
                                {errors.balances}
                            </div>
                        </CardContent>
                    </Card>
                ) : balances ? (
                    <>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Gross Revenue
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    {event.currency} {balances.grossFee.toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    Available Funds
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    {event.currency} {balances.availableFunds.toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Ticket className="h-4 w-4" />
                                    Platform Fee
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    {event.currency} {balances.platform_fee.toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                    </>
                ) : null}
            </div>

            {/* Tickets Available */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle>Tickets Available</CardTitle>
                        <Button onClick={handleAddTicket} className="w-full sm:w-auto">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Ticket
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loadingStates.tickets ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Loading tickets...</p>
                        </div>
                    ) : errors.tickets ? (
                        <div className="text-sm text-muted-foreground text-center py-8">
                            {errors.tickets}
                        </div>
                    ) : tickets.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ticket Name</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Available</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tickets.map((ticket) => (
                                        <TableRow key={ticket.id}>
                                            <TableCell className="font-medium">{ticket.ticketName}</TableCell>
                                            <TableCell>{event.currency} {ticket.ticketPrice.toLocaleString()}</TableCell>
                                            <TableCell>{ticket.quantityAvailable}</TableCell>
                                            <TableCell>
                                                <Badge variant={ticket.isActive ? "default" : "secondary"}>
                                                    {ticket.ticketStatus}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEditTicket(ticket)}>
                                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground text-center py-8">
                            No tickets available
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    {loadingStates.transactions ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Loading transactions...</p>
                        </div>
                    ) : errors.transactions ? (
                        <div className="text-sm text-muted-foreground text-center py-8">
                            {errors.transactions}
                        </div>
                    ) : transactions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Ticket</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.slice(0, 20).map((txn) => (
                                        <TableRow key={txn.id}>
                                            <TableCell className="text-sm">
                                                {format(new Date(txn.createdAt), 'MMM d, yyyy HH:mm')}
                                            </TableCell>
                                            <TableCell>{txn.ticketName}</TableCell>
                                            <TableCell className="text-sm">{txn.transactionType}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                {event.currency} {txn.netEffect.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground text-center py-8">
                            No transactions available
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Complementary Tickets */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Gift className="h-5 w-5" />
                            Complementary Tickets Issued
                        </CardTitle>
                        <Button
                            onClick={() => setIsComplementaryModalOpen(true)}
                            disabled={tickets.length === 0}
                            className="w-full sm:w-auto"
                        >
                            <Gift className="h-4 w-4 mr-2" />
                            Issue Complementary
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loadingStates.complementary ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Loading complementary tickets...</p>
                        </div>
                    ) : errors.complementary ? (
                        <div className="text-sm text-muted-foreground text-center py-8">
                            {errors.complementary}
                        </div>
                    ) : complementary.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ticket Name</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Group Code</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Issued Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {complementary.map((comp) => (
                                        <TableRow key={comp.id}>
                                            <TableCell className="font-medium">{comp.ticketName}</TableCell>
                                            <TableCell>{comp.customerMobile}</TableCell>
                                            <TableCell className="font-mono text-sm">{comp.ticketGroupCode}</TableCell>
                                            <TableCell>
                                                <Badge variant={comp.status === 'REDEEMED' ? 'default' : 'secondary'}>
                                                    {comp.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {format(new Date(comp.createdAt), 'MMM d, yyyy HH:mm')}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground text-center py-8">
                            No complementary tickets issued
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
