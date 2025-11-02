'use client';

import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function ContactPage() {
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
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
        </div>
      </section>

      {/* Office Visit Section */}
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
