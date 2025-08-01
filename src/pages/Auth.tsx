
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from navigation state (from password reset flow)
  const prefilledEmail = location.state?.email || '';
  
  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [signInError, setSignInError] = useState('');
  const [signUpError, setSignUpError] = useState('');
  const [activeTab, setActiveTab] = useState('signin');
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();

  const handleForgotPassword = async () => {
    if (!email) {
      setSignInError('Please enter your email address first.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });

    if (error) {
      setSignInError(getErrorMessage(error));
    } else {
      toast({
        title: 'Password reset email sent',
        description: 'Check your email for a password reset link.',
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      navigate('/');
    }
    
    // If email was prefilled from password reset, show success message
    if (prefilledEmail) {
      toast({
        title: 'Password reset successful!',
        description: 'You can now sign in with your new password.',
      });
    }
  }, [user, navigate, prefilledEmail, toast]);

  // Clear errors when switching tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSignInError('');
    setSignUpError('');
  };

  // Clear errors when user starts typing
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setSignInError('');
    setSignUpError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setSignInError('');
    setSignUpError('');
  };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
    setSignUpError('');
  };

  // Helper function to get user-friendly error messages
  const getErrorMessage = (error: any) => {
    const message = error?.message || '';
    
    if (message.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please try again.';
    }
    if (message.includes('User already registered')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (message.includes('Password should be at least')) {
      return 'Password is too weak. Please choose a stronger password.';
    }
    if (message.includes('network') || message.includes('fetch')) {
      return 'Connection error. Please check your internet and try again.';
    }
    
    return message || 'An unexpected error occurred. Please try again.';
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSignInError('');

    console.log('Attempting sign in for:', email);

    const { error } = await signIn(email, password);
    
    if (error) {
      console.log('Sign in error:', error);
      setSignInError(getErrorMessage(error));
    } else {
      console.log('Sign in successful');
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSignUpError('');

    console.log('Attempting sign up for:', email);
    const signupStartTime = Date.now();

    const { error } = await signUp(email, password, fullName);
    
    console.log('Sign up response - error:', error);
    
    if (error) {
      const errorMessage = getErrorMessage(error);
      console.log('Sign up error message:', errorMessage);
      setSignUpError(errorMessage);
      
      // If user already exists, suggest signing in instead
      if (error.message?.includes('User already registered') || 
          error.message?.includes('already registered')) {
        setSignUpError('An account with this email already exists. Please sign in instead or use the "Forgot Password?" link.');
      }
    } else {
      console.log('Sign up successful - checking for silent signup');
      
      // Wait a moment to see if the user gets automatically signed in
      // If they don't, it's likely a silent signup for an existing account
      setTimeout(() => {
        if (!user) {
          console.log('No automatic sign-in detected after signup - likely existing account');
          toast({
            title: 'Account Setup Notice',
            description: 'If you already have an account with this email, please use the sign in form instead.',
            variant: 'default',
          });
          
          // Auto-switch to sign in tab with email prefilled
          setActiveTab('signin');
          setPassword(''); // Clear password but keep email
          setFullName(''); // Clear full name
          
          // Show additional guidance
          setTimeout(() => {
            toast({
              title: 'Try signing in',
              description: 'Your email has been saved. Please enter your password to sign in.',
            });
          }, 2000);
        } else {
          // User was actually signed in, so it was a successful new account
          console.log('User signed in after signup - successful new account creation');
          toast({
            title: 'Welcome!',
            description: 'Your account has been created successfully.',
          });
        }
      }, 2000);
      
      // Show initial success message
      toast({
        title: 'Processing account...',
        description: 'Please wait while we set up your account.',
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Welcome to Metakit.ai
          </CardTitle>
          <CardDescription>
            AI-powered content suite for SEO teams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={handleEmailChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                  disabled={loading}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
                <div className="text-center">
                  <Link 
                    to="/forgot-password"
                    className="text-sm text-muted-foreground hover:text-primary hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                {signInError && (
                  <p className="text-red-600 text-sm mt-2 text-center">
                    {signInError}
                  </p>
                )}
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={handleFullNameChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={handleEmailChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
                {signUpError && (
                  <p className="text-red-600 text-sm mt-2 text-center">
                    {signUpError}
                  </p>
                )}
                {loading && (
                  <p className="text-gray-600 text-sm mt-2 text-center">
                    Please wait while we process your request...
                  </p>
                )}
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
