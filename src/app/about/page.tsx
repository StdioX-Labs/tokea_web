'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Zap, Sparkles, Database, BarChart3, FileText } from 'lucide-react';

export default function AboutPage() {
  const features = [
    {
      icon: Shield,
      title: 'Access Control',
      description: 'Speed up entry times which makes a huge difference to your guests, and your bottom line.',
    },
    {
      icon: Zap,
      title: 'Cashless Payments',
      description: 'Reduce friction by accepting payments through mobile money and cards effortlessly and in real time.',
    },
    {
      icon: Sparkles,
      title: 'Experiential',
      description: 'Creates more valuable sponsorships, all while delivering a world class guest experience.',
    },
    {
      icon: Database,
      title: 'Data Collection',
      description: 'Not only will you know exactly who they are, but you can identify behaviour trends such as which products or activities certain segments of your guests enjoyed.',
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Discover where sales are coming from and what marketing efforts are working best with real-time insights.',
    },
    {
      icon: FileText,
      title: 'Reports',
      description: 'Get detailed information about your ticket buyers, ticket sales, event attendance, and more.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container px-4 sm:px-6 md:px-8 max-w-5xl mx-auto">
          <div className="text-center space-y-4 sm:space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-headline">
              About Tokea
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-accent max-w-3xl mx-auto px-4">
              We are Africa&apos;s leading events and festivals access control company.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container px-4 sm:px-6 md:px-8 max-w-4xl mx-auto">
          <div className="space-y-6 sm:space-y-8 text-center">
            <p className="text-base sm:text-lg md:text-xl leading-relaxed text-muted-foreground">
              We believe in giving the best solutions to event organizers so they can keep putting on Africa&apos;s best shows.
            </p>
            <p className="text-base sm:text-lg md:text-xl leading-relaxed text-muted-foreground">
              Tokea is your perfect ticketing and event management partner. We have built a better experience for both fans and event organizers, and shares your vision in events that will form the best memories in life. We will also manage your event entry in the best way possible.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-muted/30">
        <div className="container px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-headline mb-3 sm:mb-4">
              Our Features
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Everything you need to manage successful events
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-2 hover:border-accent transition-all duration-300 hover:shadow-lg group"
              >
                <CardHeader className="p-4 sm:p-5 md:p-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-accent/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-accent/20 transition-colors">
                    <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-accent" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl md:text-2xl font-headline mb-2">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 md:p-6 pt-0">
                  <CardDescription className="text-xs sm:text-sm md:text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container px-4 sm:px-6 md:px-8 max-w-4xl mx-auto">
          <Card className="border-2 border-accent bg-gradient-to-br from-accent/5 to-primary/5">
            <CardContent className="p-6 sm:p-8 md:p-10 lg:p-12 text-center">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold font-headline mb-3 sm:mb-4">
                Ready to elevate your event?
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
                Join Africa&apos;s leading event organizers who trust Tokea to deliver exceptional experiences.
              </p>
              <a
                href="/contact"
                className="inline-block bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-colors text-sm sm:text-base md:text-lg"
              >
                Get in Touch
              </a>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
