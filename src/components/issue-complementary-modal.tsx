'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Ticket {
    ticketId: number;
    quantity: number;
}

interface TicketOption {
    id: number;
    ticketName: string;
    ticketPrice: number;
}

interface IssueComplementaryModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    eventId: number;
    availableTickets: TicketOption[];
    onSuccess?: () => void;
}

export function IssueComplementaryModal({
    isOpen,
    onOpenChange,
    eventId,
    availableTickets,
    onSuccess,
}: IssueComplementaryModalProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        mobile_number: '',
        email: '',
    });
    const [selectedTicket, setSelectedTicket] = useState<number>(0);
    const [quantity, setQuantity] = useState<number>(1);

    useEffect(() => {
        if (!isOpen) {
            // Reset form when modal closes
            setFormData({ mobile_number: '', email: '' });
            setSelectedTicket(0);
            setQuantity(1);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.mobile_number && !formData.email) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Please provide at least mobile number or email',
            });
            return;
        }

        if (selectedTicket === 0 || quantity < 1) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Please select a ticket and enter a valid quantity',
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/issue-complementary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    eventId,
                    customer: {
                        mobile_number: formData.mobile_number || undefined,
                        email: formData.email || undefined,
                    },
                    tickets: [{ ticketId: selectedTicket, quantity }],
                }),
            });

            const data = await response.json();

            if (response.ok || data.status) {
                toast({
                    title: 'Success',
                    description: `${quantity} complementary ticket(s) issued successfully`,
                });
                onOpenChange(false);
                onSuccess?.();
            } else {
                // Check for specific error cases
                if (data.message === 'Unexpected end of JSON input' || data.error === 'Failed to issue complementary tickets') {
                    throw new Error('The selected ticket type does not have any available complementary tickets to issue');
                }
                throw new Error(data.message || data.error || 'Failed to issue complementary tickets');
            }
        } catch (error: any) {
            console.error('Error issuing complementary tickets:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to issue complementary tickets. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Issue Complementary Tickets</DialogTitle>
                    <DialogDescription>
                        Send free tickets to customers for this event
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer Information */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold">Customer Information</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="mobile_number">Mobile Number</Label>
                                <Input
                                    id="mobile_number"
                                    type="tel"
                                    placeholder="254715066651"
                                    value={formData.mobile_number}
                                    onChange={(e) =>
                                        setFormData({ ...formData, mobile_number: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="customer@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Provide at least one contact method (mobile number or email)
                        </p>
                    </div>

                    {/* Tickets */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold">Ticket to Issue</h3>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="ticket">Ticket Type</Label>
                                <Select
                                    value={selectedTicket.toString()}
                                    onValueChange={(value) => setSelectedTicket(parseInt(value))}
                                >
                                    <SelectTrigger id="ticket">
                                        <SelectValue placeholder="Select ticket type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableTickets.map((t) => (
                                            <SelectItem key={t.id} value={t.id.toString()}>
                                                {t.ticketName} - KES {t.ticketPrice.toLocaleString()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Issuing...
                                </>
                            ) : (
                                'Issue Tickets'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
