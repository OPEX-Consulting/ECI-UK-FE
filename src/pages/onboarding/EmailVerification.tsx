import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { schoolAuthService } from '@/services/school/authService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toHumanReadableError } from "@/lib/errorMessages";

const EmailVerification = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { state, verifyEmail, nextStep } = useOnboarding();
  const navigate = useNavigate();

  // Keep a ref to always have the latest email — avoids stale closure in useEffect
  const emailRef = useRef(state.email);
  useEffect(() => { emailRef.current = state.email; }, [state.email]);

  // Guard: if email is missing, go back to signup
  useEffect(() => {
    if (!state.email) {
      navigate('/onboarding/signup');
    }
  }, [state.email, navigate]);

  // Auto-submit when all 6 digits are entered
  // Pass the latest otp value directly to avoid stale closure
  useEffect(() => {
    if (otp.length === 6) {
      handleVerify(otp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [countdown]);

  const handleVerify = async (otpValue?: string) => {
    const code = otpValue ?? otp;
    const email = emailRef.current;

    if (code.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    if (!email) {
      setError('Session expired. Please sign up again.');
      navigate('/onboarding/signup');
      return;
    }

    setError('');
    setIsLoading(true);

    console.log('[OTP verify] sending →', { email, otp: code });

    try {
      await schoolAuthService.verifyOtp({ email, otp: code });
      verifyEmail();
      nextStep();
      navigate('/onboarding/organization');
    } catch (err: any) {
      setError(toHumanReadableError(err));
      setOtp('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;

    setError('');
    setResendSuccess(false);
    setIsResending(true);

    try {
      await schoolAuthService.resendOtp({ email: state.email, purpose: 'signup' });
      setResendSuccess(true);
      setCountdown(60); // 60-second cooldown before resend is allowed again
    } catch (err: any) {
      setError(toHumanReadableError(err));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Verify your email</h1>
        <p className="text-muted-foreground">
          We've sent a 6-digit code to{' '}
          <span className="font-medium text-foreground">{state.email}</span>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enter Verification Code</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to your email address. The code will be entered automatically once complete.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-6 flex flex-col items-center">
            {error && (
              <Alert variant="destructive" className="w-full">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {resendSuccess && !error && (
              <Alert className="w-full border-green-200 bg-green-50 text-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  A new code has been sent to {state.email}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4 flex flex-col items-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              type="button"
              className="w-full"
              disabled={isLoading || otp.length !== 6}
              onClick={() => handleVerify(otp)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </Button>
          </div>

          <div className="text-center pt-2">
            <Button
              variant="link"
              size="sm"
              onClick={handleResend}
              disabled={isResending || countdown > 0}
              className="text-muted-foreground"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Sending...
                </>
              ) : countdown > 0 ? (
                <>
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Resend in {countdown}s
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Resend Code
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerification;
