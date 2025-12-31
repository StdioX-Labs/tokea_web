'use server';

import { cookies } from 'next/headers';

// API configuration
const API_BASE_URL = 'https://api.soldoutafrica.com/api/v1';
const username = '254717286026';
const password = 's0ascAnn3r@56YearsLater!';
const encodedCredentials = Buffer.from(`${username}:${password}`).toString('base64');

interface User {
  phoneNumber: string;
  role: string;
  is_active: boolean;
  kycStatus: string;
  profile_type: string | null;
  company_id: number;
  user_id: number;
  company_name: string;
  currency: string;
  email: string;
}

interface OtpResponse {
  otp: string;
  message: string;
  user: User;
  status: boolean;
}

// Store OTP data temporarily (in production, use Redis or similar)
const otpStore = new Map<string, { otp: string; user: User; timestamp: number }>();

export async function requestOtpAction(email: string) {
  try {
    const url = `${API_BASE_URL}/user/otp/login`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${encodedCredentials}`,
      },
      body: JSON.stringify({
        id: email,
        method: 'email',
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OTP Request failed:', response.status, errorText);
      return { success: false, message: `Error: ${response.status}` };
    }

    const data: OtpResponse = await response.json();

    // ======== TEST MODE: Display OTP in console ========
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 OTP GENERATED FOR TESTING');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', email);
    console.log('🔢 OTP Code:', data.otp);
    console.log('⏰ Timestamp:', new Date().toLocaleString());
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    // ===================================================

    // Store OTP and user data server-side for validation (expires in 5 minutes)
    otpStore.set(email, {
      otp: data.otp,
      user: data.user,
      timestamp: Date.now()
    });

    // Clean up expired OTPs (older than 5 minutes)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    for (const [key, value] of otpStore.entries()) {
      if (value.timestamp < fiveMinutesAgo) {
        otpStore.delete(key);
      }
    }

    // Don't return the OTP or user data to the client
    return {
      success: data.status === true,
      message: data.message || 'OTP sent successfully'
    };
  } catch (error) {
    console.error('Error requesting OTP:', error);
    return { success: false, message: 'Failed to send OTP' };
  }
}

export async function verifyOtpAction(otp: string, email: string) {
  try {
    // ======== TEST MODE: Display OTP verification attempt ========
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 OTP VERIFICATION ATTEMPT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', email);
    console.log('🔢 Entered OTP:', otp);
    console.log('⏰ Time:', new Date().toLocaleString());
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    // ==============================================================

    // Get stored OTP data
    const storedData = otpStore.get(email);

    if (!storedData) {
      console.log('❌ OTP not found in store for:', email);
      return {
        success: false,
        message: 'OTP expired or not found. Please request a new one.'
      };
    }

    console.log('✅ Stored OTP found:', storedData.otp);
    console.log('🔄 Comparing:', otp, '===', storedData.otp, '?', otp === storedData.otp);


    // Check if OTP is expired (5 minutes)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    if (storedData.timestamp < fiveMinutesAgo) {
      otpStore.delete(email);
      return {
        success: false,
        message: 'OTP expired. Please request a new one.'
      };
    }

    // Validate the OTP
    if (storedData.otp === otp) {
      console.log('✅ OTP VERIFIED SUCCESSFULLY!');

      // Clear the OTP after successful validation
      otpStore.delete(email);

      // Set authentication cookie
      const cookieStore = await cookies();
      cookieStore.set('adminUser', JSON.stringify({
        email: storedData.user.email,
        userId: storedData.user.user_id,
        role: storedData.user.role,
        isLoggedIn: true,
        timestamp: Date.now()
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });

      // Return user data for client-side storage (without the OTP)
      return {
        success: true,
        message: 'OTP verified successfully',
        user: storedData.user
      };
    } else {
      console.log('❌ OTP VERIFICATION FAILED - Invalid OTP');
      return {
        success: false,
        message: 'Invalid OTP. Please try again.'
      };
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { success: false, message: 'Failed to verify OTP' };
  }
}
