import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://api.soldoutafrica.com/api/v1';
const username = '254717286026';
const password = 's0ascAnn3r@56YearsLater!';
const encodedCredentials = Buffer.from(`${username}:${password}`).toString('base64');

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const eventId = searchParams.get('eventId');
        const companyId = searchParams.get('companyId');

        if (!eventId || !companyId) {
            return NextResponse.json(
                { error: 'eventId and companyId are required' },
                { status: 400 }
            );
        }

        const response = await fetch(`${API_BASE_URL}/gl/global/get?eventId=${eventId}&companyId=${companyId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${encodedCredentials}`,
                'Accept': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch transactions' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in gl-transactions API route:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
