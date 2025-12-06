import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://api.soldoutafrica.com/api/v1';

// Basic Auth credentials
const username = '254717286026';
const password = 's0ascAnn3r@56YearsLater!';
const encodedCredentials = Buffer.from(`${username}:${password}`).toString('base64');

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const companyId = searchParams.get('companyId');

        if (!companyId) {
            return NextResponse.json(
                { message: 'Company ID is required', status: false },
                { status: 400 }
            );
        }

        const response = await fetch(`${API_BASE_URL}/event/report/get?companyId=${companyId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Basic ${encodedCredentials}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to fetch events' }));
            return NextResponse.json(
                { message: errorData.message || 'Failed to fetch events', status: false },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Error fetching company events:', error);
        return NextResponse.json(
            {
                message: error instanceof Error ? error.message : 'Internal server error',
                status: false
            },
            { status: 500 }
        );
    }
}
