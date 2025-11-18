import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://api.soldoutafrica.com/api/v1';
const username = '254717286026';
const password = 's0ascAnn3r@56YearsLater!';
const encodedCredentials = btoa(`${username}:${password}`);

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'userId is required' },
                { status: 400 }
            );
        }

        const response = await fetch(`${API_BASE_URL}/event/map/get?userId=${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${encodedCredentials}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to fetch user events:', response.status, errorText);
            return NextResponse.json(
                { error: 'Failed to fetch events', details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in user-events API route:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
