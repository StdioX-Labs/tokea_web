import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
       <h1 className="text-4xl font-bold tracking-tight font-headline mb-8 text-center">
        Get In Touch
      </h1>
       <p className="text-center text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
        Have questions about an event, need help with your order, or just want to say hi? We'd love to hear from you.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Mail className="w-5 h-5 text-accent" />
                        <span className="text-muted-foreground">support@summer.events</span>
                    </div>
                     <div className="flex items-center gap-4">
                        <Phone className="w-5 h-5 text-accent" />
                        <span className="text-muted-foreground">+254 712 345 678</span>
                    </div>
                     <div className="flex items-start gap-4">
                        <MapPin className="w-5 h-5 text-accent mt-1" />
                        <span className="text-muted-foreground">123 Event Avenue, Metropolia, Kenya</span>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Business Hours</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-muted-foreground">
                   <p><span className="font-semibold text-foreground">Monday - Friday:</span> 9:00 AM - 5:00 PM</p>
                   <p><span className="font-semibold text-foreground">Saturday:</span> 10:00 AM - 2:00 PM</p>
                   <p><span className="font-semibold text-foreground">Sunday & Public Holidays:</span> Closed</p>
                </CardContent>
            </Card>
        </div>
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Send us a Message</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input placeholder="Your Name" />
                    <Input type="email" placeholder="Your Email" />
                    <Input placeholder="Subject" />
                    <Textarea placeholder="Your message..." className="min-h-[150px]" />
                    <Button size="lg" className="w-full">Send Message</Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
