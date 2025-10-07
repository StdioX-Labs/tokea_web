'use server';

import { cookies } from 'next/headers';

// API configuration
const API_BASE_URL = 'https://api.soldoutafrica.com/api/v1';
const username = '254717286026';
const password = 's0ascAnn3r@56YearsLater!';
const encodedCredentials = Buffer.from(`${username}:${password}`).toString('base64');

export async function requestOtpAction(mobileNumber: string) {
  try {
    const url = `${API_BASE_URL}/user/external/challange?mobileNumber=${mobileNumber}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${encodedCredentials}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OTP Request failed:', response.status, errorText);
      return { success: false, message: `Error: ${response.status}` };
    }

    const data = await response.json();
    return {
      success: data.status === true,
      message: data.message || 'OTP sent successfully'
    };
  } catch (error) {
    console.error('Error requesting OTP:', error);
    return { success: false, message: 'Failed to send OTP' };
  }
}

export async function verifyOtpAction(otp: string, mobileNumber: string) {
  try {
    const url = `${API_BASE_URL}/otp/validate`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${encodedCredentials}`,
      },
      body: JSON.stringify({
        otp,
        mobileNumber,
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OTP Verification failed:', response.status, errorText);
      return { success: false, message: `Error: ${response.status}` };
    }

    const data = await response.json();

    // Set authentication cookie if successful
    if (data.status === true) {
      cookies().set('adminUser', JSON.stringify({
        mobileNumber,
        isLoggedIn: true,
        timestamp: Date.now()
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });
    }

    return {
      success: data.status === true,
      message: data.message || 'OTP verified successfully'
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { success: false, message: 'Failed to verify OTP' };
  }
}
