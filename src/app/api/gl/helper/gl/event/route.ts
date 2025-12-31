import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://api.soldoutafrica.com/api/v1';
const username = '254717286026';
const password = 's0ascAnn3r@56YearsLater!';
const encodedCredentials = btoa(`${username}:${password}`);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId is required', status: false },
        { status: 400 }
      );
    }

    console.log(`Fetching sales data for event ID: ${eventId}`);

    const response = await fetch(`${API_BASE_URL}/gl/helper/gl/event?eventId=${eventId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${encodedCredentials}`,
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`Sales API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: 'Failed to fetch sales data', status: false },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Sales data fetched successfully:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in sales API route:', error);
    return NextResponse.json(
      { error: 'Internal server error', status: false },
      { status: 500 }
    );
  }
}

