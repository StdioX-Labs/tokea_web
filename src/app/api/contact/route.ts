import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if API key is available
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Email service is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Initialize Resend only when needed
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send email using Resend
    try {
      await resend.emails.send({
        from: 'Tokea Contact Form <onboarding@resend.dev>',
        to: 'info@tokea.com',
        replyTo: email,
        subject: `Contact Form: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>
            <div style="margin: 20px 0;">
              <p style="margin: 10px 0;">
                <strong>From:</strong> ${name}
              </p>
              <p style="margin: 10px 0;">
                <strong>Email:</strong> ${email}
              </p>
              <p style="margin: 10px 0;">
                <strong>Subject:</strong> ${subject}
              </p>
            </div>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin-top: 20px;">
              <h3 style="color: #333; margin-top: 0;">Message:</h3>
              <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
            </div>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
              <p>This email was sent from the Tokea contact form.</p>
              <p>Submitted on: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `,
      });

      console.log('Contact form email sent successfully:', {
        name,
        email,
        subject,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        { message: 'Message sent successfully' },
        { status: 200 }
      );
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send email. Please try again later.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
