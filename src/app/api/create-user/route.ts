import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://api.soldoutafrica.com/api/v1';

// Basic Auth credentials
const username = '254717286026';
const password = 's0ascAnn3r@56YearsLater!';
const encodedCredentials = Buffer.from(`${username}:${password}`).toString('base64');

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { fullName, emailAddress, mobileNumber } = body;

        if (!fullName || !emailAddress || !mobileNumber) {
            return NextResponse.json(
                { message: 'Full name, email address, and phone number are required', status: false },
                { status: 400 }
            );
        }

        // Create user with hardcoded values except fullName, emailAddress, and mobileNumber
        const userPayload = {
            fullName,
            idNumber: "00000000",
            mobileNumber,
            password: "s0ascAnn3r@56YearsLater!",
            emailAddress,
            isExternal: true,
            company: {
                id: 54
            },
            roles: "EVENT_ORGANIZER"
        };

        const response = await fetch(`${API_BASE_URL}/user/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Basic ${encodedCredentials}`,
            },
            body: JSON.stringify(userPayload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to create user' }));
            return NextResponse.json(
                { message: errorData.message || 'Failed to create user', status: false },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            {
                message: error instanceof Error ? error.message : 'Internal server error',
                status: false
            },
            { status: 500 }
        );
    }
}
