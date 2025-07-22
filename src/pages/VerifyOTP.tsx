
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const { verifyOTP, sendPasswordResetOTP } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email;
  const debugOtp = location.state?.debugOtp;

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
      return;
    }

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast({
        title: 'Invalid code',
        description: 'Please enter the complete 6-digit verification code.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const { error } = await verifyOTP(email, otp);
    
    if (error) {
      toast({
        title: 'Invalid code',
        description: error.message || 'The verification code is invalid or expired.',
        variant: 'destructive',
      });
      setOtp('');
    } else {
      toast({
        title: 'Code verified!',
        description: 'Now you can set your new password.',
      });
      
      // Navigate to password reset page
      navigate('/reset-password', { state: { email, otpCode: otp } });
    }
    
    setLoading(false);
  };

  const handleResendOTP = async () => {
    console.log('🔔 Resend button clicked for email:', email);
    setResendLoading(true);
    
    const { error, data } = await sendPasswordResetOTP(email);
    
    if (error) {
      console.error('❌ Resend OTP failed:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to resend code. Please try again.',
        variant: 'destructive',
      });
    } else {
      console.log('✅ Resend OTP successful:', data);
      toast({
        title: 'Code resent!',
        description: 'A new verification code has been sent to your email.',
      });
      
      // Reset countdown
      setCountdown(60);
      setCanResend(false);
      setOtp('');
      
      // Update debug OTP if available
      if (data?.debug_otp) {
        console.log('🔢 New OTP for testing:', data.debug_otp);
      }
    }
    
    setResendLoading(false);
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Metakit.ai
            </span>
          </div>
          <CardTitle className="text-2xl">Verify Code</CardTitle>
          <CardDescription>
            Enter the 6-digit verification code sent to:
            <br />
            <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                value={otp}
                onChange={setOtp}
                maxLength={6}
                disabled={loading}
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

            {debugOtp && (
              <div className="text-center text-sm text-muted-foreground bg-muted p-2 rounded">
                <strong>Debug OTP:</strong> {debugOtp}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || otp.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>
          </form>
          
          <div className="mt-6 text-center space-y-2">
            <div className="text-sm text-muted-foreground">
              Didn't receive the code?
            </div>
            {canResend ? (
              <Button 
                variant="link" 
                onClick={handleResendOTP}
                disabled={resendLoading}
                className="p-0 h-auto text-primary"
              >
                {resendLoading ? 'Sending...' : 'Resend Code'}
              </Button>
            ) : (
              <div className="text-sm text-muted-foreground">
                Resend available in {countdown}s
              </div>
            )}
            
            <div className="pt-2">
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary hover:underline"
              >
                Use different email
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyOTP;
