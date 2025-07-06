import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrdersPage() {
    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold tracking-tight font-headline mb-8">
                View Orders
            </h1>
            <Card>
                <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Orders management functionality will be here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
