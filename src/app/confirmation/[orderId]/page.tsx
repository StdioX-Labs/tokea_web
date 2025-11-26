import { use } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ConfirmationPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  return (
    <div className="container flex min-h-[calc(100vh-14rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-green-100 rounded-full p-3 w-fit">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="mt-4 font-headline text-3xl">Thank You for Your Order!</CardTitle>
          <CardDescription className="text-lg">
            Your purchase has been confirmed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Your order ID is: <br />
            <span className="font-mono font-bold text-foreground">{orderId}</span>
          </p>
          <p className='text-muted-foreground'>A confirmation email with your tickets has been sent to you.</p>
          <Button asChild size="lg" className="w-full">
            <Link href={`/orders/${orderId}`}>View Order Details</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
