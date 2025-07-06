'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { Button } from "@/components/ui/button"
import { Search, FileDown } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const mockTransactions = [
    { id: 'TRN-001', orderId: 'SUMMER-12345', customer: 'Jane Doe', date: '2024-07-20', total: 150.00, status: 'Completed' },
    { id: 'TRN-002', orderId: 'SUMMER-12346', customer: 'John Smith', date: '2024-07-19', total: 75.00, status: 'Completed' },
    { id: 'TRN-003', orderId: 'SUMMER-12347', customer: 'Alice Johnson', date: '2024-07-18', total: 55.00, status: 'Refunded' },
    { id: 'TRN-004', orderId: 'SUMMER-12348', customer: 'Bob Brown', date: '2024-07-17', total: 80.00, status: 'Completed' },
]

export default function TransactionsPage() {
    const [date, setDate] = useState<Date | undefined>();

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold tracking-tight font-headline mb-8">
                Manage Transactions
            </h1>
            <Card>
                <CardHeader>
                    <CardTitle>All Transactions</CardTitle>
                    <CardDescription>Search and filter through all transactions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="Search by Order ID or Transaction Ref..." className="pl-10" />
                        </div>
                        <DatePicker date={date} setDate={setDate} placeholder="Filter by date" />
                        <Button variant="outline">
                            <FileDown className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockTransactions.map((trx) => (
                                <TableRow key={trx.id}>
                                    <TableCell className="font-mono text-xs">{trx.id}</TableCell>
                                    <TableCell className="font-medium">{trx.orderId}</TableCell>
                                    <TableCell>{trx.customer}</TableCell>
                                    <TableCell>{trx.date}</TableCell>
                                    <TableCell>
                                        <Badge variant={trx.status === 'Completed' ? 'default' : 'destructive'}>{trx.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">${trx.total.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
