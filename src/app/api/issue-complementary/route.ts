import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://api.soldoutafrica.com/api/v1';
const username = '254717286026';
const password = 's0ascAnn3r@56YearsLater!';
const encodedCredentials = Buffer.from(`${username}:${password}`).toString('base64');

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const response = await fetch(`${API_BASE_URL}/event/issue/complementary`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${encodedCredentials}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to issue complementary tickets', ...data },
                { status: response.status }
            );
        }

        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error('Error issuing complementary tickets:', error);
        return NextResponse.json(
            { error: 'Failed to issue complementary tickets', message: error.message },
            { status: 500 }
        );
    }
}
