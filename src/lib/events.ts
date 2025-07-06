import type { Event } from './types';

export const events: Event[] = [
  {
    id: 'summer-solstice-fest',
    name: 'Summer Solstice Fest',
    date: '2024-07-20T18:00:00Z',
    location: 'Green Meadows Park',
    posterImage: 'https://placehold.co/800x1200.png',
    posterImageHint: 'music festival',
    description:
      'Celebrate the longest day of the year with an unforgettable night of music, art, and community. Summer Solstice Fest brings together a diverse lineup of artists to create a magical atmosphere under the stars.',
    artists: [
      { name: 'The Midnight Bloom', role: 'Headliner' },
      { name: 'Echo Collective', role: 'Support' },
      { name: 'DJ Aurora', role: 'Opener' },
    ],
    venue: {
      name: 'Green Meadows Park Amphitheater',
      address: '123 Park Ave, Metropolia',
      capacity: 5000,
    },
    ticketTypes: [
      { id: 'ga', name: 'General Admission', price: 75, quantityAvailable: 2000, ticketsToIssue: 1, ticketLimitPerPerson: 10, saleStartDate: '2024-06-01T10:00:00Z', saleEndDate: '2024-07-20T17:00:00Z', status: 'active' },
      { id: 'vip', name: 'VIP Access', price: 150, quantityAvailable: 250, ticketsToIssue: 1, ticketLimitPerPerson: 4, saleStartDate: '2024-06-01T10:00:00Z', saleEndDate: '2024-07-15T17:00:00Z', status: 'active' },
    ],
    isFeatured: true,
    promotions: [
        {
            id: 'promo-1',
            codeBatchName: 'EARLYBIRD10',
            numberOfCodes: 100,
            discountType: 'PERCENTAGE',
            discountValue: 10,
            validFrom: '2024-06-01T00:00:00Z',
            validUntil: '2024-06-30T23:59:59Z',
            maxUses: 100,
            status: 'active'
        },
        {
            id: 'promo-2',
            codeBatchName: 'LASTCHANCE5',
            numberOfCodes: 200,
            discountType: 'FIXED_AMOUNT',
            discountValue: 5,
            validFrom: '2024-07-10T00:00:00Z',
            validUntil: '2024-07-19T23:59:59Z',
            maxUses: 200,
            status: 'expired'
        }
    ]
  },
  {
    id: 'ocean-breeze-concert',
    name: 'Ocean Breeze Concert',
    date: '2024-08-05T19:30:00Z',
    location: 'Seaside Pavilion',
    posterImage: 'https://placehold.co/800x1200.png',
    posterImageHint: 'beach concert',
    description:
      'Feel the rhythm of the waves and the music. The Ocean Breeze Concert series features indie and folk artists in an intimate seaside setting. Bring a blanket and enjoy the show as the sun sets over the ocean.',
    artists: [
      { name: 'Washed Out', role: 'Headliner' },
      { name: 'Beach Fossils', role: 'Special Guest' },
      { name: 'Day Wave', role: 'Support' },
    ],
    venue: {
      name: 'Seaside Pavilion',
      address: '456 Ocean Blvd, Coast City',
      capacity: 1500,
    },
    ticketTypes: [
      { id: 'ga', name: 'General Admission', price: 55, quantityAvailable: 1500, ticketsToIssue: 1, ticketLimitPerPerson: 10, saleStartDate: '2024-06-15T10:00:00Z', saleEndDate: '2024-08-05T18:30:00Z', status: 'active' },
    ],
    isFeatured: true,
  },
  {
    id: 'city-lights-jazz-night',
    name: 'City Lights Jazz Night',
    date: '2024-08-15T20:00:00Z',
    location: 'The Velvet Note',
    posterImage: 'https://placehold.co/800x1200.png',
    posterImageHint: 'jazz club',
    description:
      'Experience the heart of the city through the soulful sounds of jazz. An evening of classic and contemporary jazz from world-renowned musicians in a sophisticated and cozy club.',
    artists: [
      { name: 'The Kamasi Washington Experience', role: 'Headliner' },
      { name: 'Robert Glasper Trio', role: 'Support' },
    ],
    venue: {
      name: 'The Velvet Note',
      address: '789 Downtown St, Metropolia',
      capacity: 200,
    },
    ticketTypes: [
      { id: 'seated', name: 'Seated Ticket', price: 90, quantityAvailable: 150, ticketsToIssue: 1, ticketLimitPerPerson: 4, saleStartDate: '2024-07-01T10:00:00Z', saleEndDate: '2024-08-15T19:00:00Z', status: 'active' },
      { id: 'standing', name: 'Standing Room', price: 60, quantityAvailable: 50, ticketsToIssue: 1, ticketLimitPerPerson: 4, saleStartDate: '2024-07-01T10:00:00Z', saleEndDate: '2024-08-15T19:00:00Z', status: 'active' },
    ],
    isFeatured: false,
  },
  {
    id: 'electro-bloom-rave',
    name: 'Electro-Bloom Rave',
    date: '2024-09-01T22:00:00Z',
    location: 'The Warehouse District',
    posterImage: 'https://placehold.co/800x1200.png',
    posterImageHint: 'electronic rave',
    description:
      'A nocturnal gathering for lovers of electronic music. Immerse yourself in a world of light and sound with top DJs from around the globe. This is a night to dance until dawn.',
    artists: [
      { name: 'deadmau5', role: 'Headliner' },
      { name: 'REZZ', role: 'Direct Support' },
      { name: 'Sofi Tukker (DJ Set)', role: 'Support' },
    ],
    venue: {
      name: 'Warehouse 305',
      address: '305 Industrial Way, Tech City',
      capacity: 3000,
    },
    ticketTypes: [
      { id: 'ga', name: 'General Admission', price: 80, quantityAvailable: 2800, ticketsToIssue: 1, ticketLimitPerPerson: 5, saleStartDate: '2024-07-15T10:00:00Z', saleEndDate: '2024-09-01T21:00:00Z', status: 'active' },
      { id: 'express', name: 'Express Entry', price: 120, quantityAvailable: 200, ticketsToIssue: 1, ticketLimitPerPerson: 2, saleStartDate: '2024-07-15T10:00:00Z', saleEndDate: '2024-08-25T21:00:00Z', status: 'active' },
    ],
    isFeatured: true,
  },
  {
    id: 'lakeside-folk-festival',
    name: 'Lakeside Folk Festival',
    date: '2024-07-28T14:00:00Z',
    location: 'Serenity Lake',
    posterImage: 'https://placehold.co/800x1200.png',
    posterImageHint: 'folk festival',
    description:
      'A peaceful weekend of acoustic melodies by the lake. The Lakeside Folk Festival is a family-friendly event celebrating storytelling through song. Join us for workshops, craft stalls, and beautiful music.',
    artists: [
      { name: 'Fleet Foxes', role: 'Headliner' },
      { name: 'Bon Iver', role: 'Headliner' },
      { name: 'Iron & Wine', role: 'Support' },
      { name: 'First Aid Kit', role: 'Support' },
    ],
    venue: {
      name: 'Serenity Lake Grounds',
      address: '99 Serene Rd, Willow Creek',
      capacity: 8000,
    },
    ticketTypes: [
       { id: 'day', name: 'Day Pass', price: 65, quantityAvailable: 3000, ticketsToIssue: 1, ticketLimitPerPerson: 10, saleStartDate: '2024-06-10T10:00:00Z', saleEndDate: '2024-07-28T13:00:00Z', status: 'active' },
       { id: 'weekend', name: 'Weekend Pass', price: 110, quantityAvailable: 5000, ticketsToIssue: 1, ticketLimitPerPerson: 10, saleStartDate: '2024-06-10T10:00:00Z', saleEndDate: '2024-07-27T13:00:00Z', status: 'active' },
    ],
    isFeatured: false,
  },
];

export const getEventById = (id: string): Event | undefined => {
  return events.find((event) => event.id === id);
};
