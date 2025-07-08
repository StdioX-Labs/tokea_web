import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <h1 className="text-4xl font-bold tracking-tight font-headline mb-8 text-center">
        About Summer
      </h1>
      <p className="text-center text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
        Your one-stop shop for the hottest summer events. We believe in the power of live experiences to create lasting memories.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="relative aspect-square rounded-lg overflow-hidden shadow-lg">
            <Image 
                src="https://placehold.co/600x600.png" 
                alt="Happy people at a festival" 
                fill
                className="object-cover"
                data-ai-hint="people festival"
            />
        </div>
        <div className="space-y-6">
            <h2 className="text-2xl font-bold font-headline">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat.
            </p>
            <p className="text-muted-foreground leading-relaxed">
                Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales.
            </p>
        </div>
      </div>

       <div className="mt-16">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-center text-3xl">Why Choose Us?</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-8 text-center">
                    <div className="p-4">
                        <h3 className="text-xl font-semibold mb-2">Curated Events</h3>
                        <p className="text-muted-foreground">We hand-pick the best events so you don't have to. From major festivals to hidden gems, we've got you covered.</p>
                    </div>
                     <div className="p-4">
                        <h3 className="text-xl font-semibold mb-2">Seamless Experience</h3>
                        <p className="text-muted-foreground">Our platform is designed to be fast, secure, and easy to use, from browsing to checkout and beyond.</p>
                    </div>
                     <div className="p-4">
                        <h3 className="text-xl font-semibold mb-2">Dedicated Support</h3>
                        <p className="text-muted-foreground">Our team is always here to help. Have a question or need assistance? We're just a click away.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
