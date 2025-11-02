'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Send, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
        });
        toast({
          title: 'Message sent successfully!',
          description: 'We\'ll get back to you as soon as possible.',
        });

        // Reset success state after 5 seconds
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
        toast({
          title: 'Failed to send message',
          description: data.error || 'Please try again later.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Failed to send message',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Address',
      details: ['Inside Wonderjoy Ridgeways gardens', 'P.O.Box 2013 -00900 Kiambu'],
    },
    {
      icon: Phone,
      title: 'Telephone',
      details: ['0796555111'],
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['info@tokea.com'],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container px-4 sm:px-6 md:px-8 max-w-5xl mx-auto">
          <div className="text-center space-y-4 sm:space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-headline">
              Contact Us
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              Get in touch with us. We&apos;d love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container px-4 sm:px-6 md:px-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16 md:mb-20">
            {contactInfo.map((info, index) => (
              <Card
                key={index}
                className="border-2 hover:border-accent transition-all duration-300 hover:shadow-lg group"
              >
                <CardContent className="p-6 sm:p-8 text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                    <info.icon className="w-7 h-7 sm:w-8 sm:h-8 text-accent" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold font-headline mb-3">
                    {info.title}
                  </h3>
                  <div className="space-y-1">
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-sm sm:text-base text-muted-foreground">
                        {detail}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <Card className="border-2 max-w-3xl mx-auto">
            <CardHeader className="p-6 sm:p-8">
              <CardTitle className="text-2xl sm:text-3xl font-headline text-center">
                Send us a Message
              </CardTitle>
              <CardDescription className="text-center text-sm sm:text-base">
                Fill out the form below and we&apos;ll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 pt-0">
              {isSuccess ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">Message Sent!</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Thank you for contacting us. We&apos;ll respond to your inquiry shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Name <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        disabled={isSubmitting}
                        className="h-11 sm:h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        disabled={isSubmitting}
                        className="h-11 sm:h-12"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Subject <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="subject"
                      placeholder="How can we help you?"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      disabled={isSubmitting}
                      className="h-11 sm:h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your inquiry..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      disabled={isSubmitting}
                      rows={6}
                      className="resize-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 sm:h-12 text-base font-semibold"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="mr-2">Sending...</span>
                        <span className="animate-spin">⏳</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Map or Additional Info Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-muted/30">
        <div className="container px-4 sm:px-6 md:px-8 max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-headline mb-4 sm:mb-6">
            Visit Our Office
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8">
            We&apos;re located in the heart of Ridgeways, Kiambu. Feel free to stop by during business hours.
          </p>
          <div className="bg-background rounded-lg p-6 sm:p-8 md:p-10 border-2 border-accent/20">
            <div className="flex items-start justify-center gap-3 sm:gap-4">
              <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-accent flex-shrink-0 mt-1" />
              <div className="text-left">
                <p className="text-base sm:text-lg md:text-xl font-semibold mb-2">
                  Inside Wonderjoy Ridgeways gardens
                </p>
                <p className="text-sm sm:text-base text-muted-foreground">
                  P.O.Box 2013 -00900 Kiambu
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
