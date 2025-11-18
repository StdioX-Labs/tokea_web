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
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loginStep, setLoginStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');

  // Form for email input
  const emailForm = useForm<z.infer<typeof otpRequestSchema>>({
    resolver: zodResolver(otpRequestSchema),
    defaultValues: {
      email: '',
    },
  });

  async function requestOTP(values: z.infer<typeof otpRequestSchema>) {
    setIsLoading(true);
    try {
      // Store email in state for later use
      setEmail(values.email);

      // Make the actual API call via server action
      console.log('Requesting OTP for email:', values.email);
      const result = await requestOtpAction(values.email);

      if (result.success) {
        toast({
          title: 'OTP Sent',
          description: 'Please check your email for the OTP.',
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
      console.log('Verifying OTP for email:', email);
      const result = await verifyOtpAction(otpValue, email);

      if (result.success && 'user' in result && result.user) {
        toast({
          title: 'Login Successful',
          description: `Welcome back!`,
        });

        // Store user info in localStorage for session management
        localStorage.setItem('adminUser', JSON.stringify({
          ...result.user,
          isLoggedIn: true,
          loginTime: Date.now(),
        }));

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
            {loginStep === 'email'
              ? 'Enter your email address to receive an OTP.'
              : `Enter the 4-digit OTP sent to ${email}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loginStep === 'email' ? (
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(requestOTP)} className="space-y-6">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="admin@example.com"
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
                  onClick={() => setLoginStep('email')}
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
