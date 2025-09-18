'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { requestOtpAction, verifyOtpAction } from '@/app/actions/auth-actions';

// OTP Login Schema
const otpRequestSchema = z.object({
  mobileNumber: z.string().min(12, { message: 'Please enter a valid mobile number (e.g., 254717286026).' }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loginStep, setLoginStep] = useState<'phone' | 'otp'>('phone');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpValue, setOtpValue] = useState('');

  // Form for mobile number input
  const phoneForm = useForm<z.infer<typeof otpRequestSchema>>({
    resolver: zodResolver(otpRequestSchema),
    defaultValues: {
      mobileNumber: '',
    },
  });

  async function requestOTP(values: z.infer<typeof otpRequestSchema>) {
    setIsLoading(true);
    try {
      // Store mobile number in state for later use
      setMobileNumber(values.mobileNumber);

      // Make the actual API call via server action
      console.log('Requesting OTP for mobile number:', values.mobileNumber);
      const result = await requestOtpAction(values.mobileNumber);

      if (result.success) {
        toast({
          title: 'OTP Sent',
          description: 'Please check your phone for the OTP.',
        });

        // Clear any previous OTP value
        setOtpValue('');
        setLoginStep('otp');
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to Send OTP',
          description: result.message || 'Something went wrong. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send OTP. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();

    if (otpValue.length !== 4) {
      toast({
        variant: 'destructive',
        title: 'Invalid OTP',
        description: 'OTP must be 4 digits.',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Make the actual API call via server action
      console.log('Verifying OTP:', otpValue, 'for mobile:', mobileNumber);
      const result = await verifyOtpAction(otpValue, mobileNumber);

      if (result.success) {
        // Store user info in localStorage with login timestamp for 5-hour session
        localStorage.setItem('adminUser', JSON.stringify({
          mobileNumber: mobileNumber,
          isLoggedIn: true,
          loginTime: Date.now(), // Add timestamp for session tracking
        }));

        toast({
          title: 'Login Successful',
          description: 'Welcome to the admin dashboard!',
        });

        router.push('/admin/dashboard');
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid OTP',
          description: result.message || 'The OTP you entered is incorrect. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to verify OTP. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Handle OTP input to only allow digits and limit to 4 characters
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits
    const onlyDigits = value.replace(/\D/g, '');
    // Limit to 4 digits
    setOtpValue(onlyDigits.slice(0, 4));
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center gap-4 bg-muted/50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Admin Login</CardTitle>
          <CardDescription>
            {loginStep === 'phone'
              ? 'Enter your mobile number to receive an OTP.'
              : `Enter the 4-digit OTP sent to ${mobileNumber}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loginStep === 'phone' ? (
            <Form {...phoneForm}>
              <form onSubmit={phoneForm.handleSubmit(requestOTP)} className="space-y-6">
                <FormField
                  control={phoneForm.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="254717286026"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="otp" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  One-Time Password
                </label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  placeholder="Enter 4-digit OTP"
                  value={otpValue}
                  onChange={handleOtpChange}
                  disabled={isLoading}
                  autoFocus
                  className="text-center text-xl tracking-widest"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || otpValue.length !== 4}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setLoginStep('phone')}
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
      <div className="text-center">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-primary"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
