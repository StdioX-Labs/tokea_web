import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://api.soldoutafrica.com/api/v1';

// Basic Auth credentials
const username = '254717286026';
const password = 's0ascAnn3r@56YearsLater!';
const encodedCredentials = Buffer.from(`${username}:${password}`).toString('base64');

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { eventId, userId } = body;

        if (!eventId || !userId) {
            return NextResponse.json(
                { message: 'Event ID and User ID are required', status: false },
                { status: 400 }
            );
        }

        // Map user to event
        const response = await fetch(`${API_BASE_URL}/event/map/add?eventId=${eventId}&userId=${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Basic ${encodedCredentials}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to map user to event' }));
            return NextResponse.json(
                { message: errorData.message || 'Failed to map user to event', status: false },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Error mapping user to event:', error);
        return NextResponse.json(
            {
                message: error instanceof Error ? error.message : 'Internal server error',
                status: false
            },
            { status: 500 }
        );
    }
}
