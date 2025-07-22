import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  sendPasswordResetOTP: (email: string) => Promise<{ error: any; data?: any }>;
  verifyOTP: (email: string, otpCode: string) => Promise<{ error: any; data?: any }>;
  resetPassword: (email: string, otpCode: string, newPassword: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        }
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const sendPasswordResetOTP = async (email: string) => {
    console.log('🔄 Attempting to send password reset OTP for:', email);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-password-reset-otp', {
        body: { email }
      });
      
      if (error) {
        console.error('❌ Error from send-password-reset-otp function:', error);
        return { error };
      }
      
      console.log('✅ Successfully sent password reset OTP:', data);
      return { error: null, data };
    } catch (error) {
      console.error('❌ Network/unexpected error in sendPasswordResetOTP:', error);
      return { 
        error: {
          message: error instanceof Error ? error.message : 'Failed to send reset code. Please check your connection and try again.',
          details: error
        }
      };
    }
  };

  const verifyOTP = async (email: string, otpCode: string) => {
    console.log('🔄 Attempting to verify OTP for:', email);
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-password-reset-otp', {
        body: { email, otpCode }
      });
      
      if (error) {
        console.error('❌ Error from verify-password-reset-otp function:', error);
        return { error };
      }
      
      console.log('✅ Successfully verified OTP:', data);
      return { error: null, data };
    } catch (error) {
      console.error('❌ Network/unexpected error in verifyOTP:', error);
      return { 
        error: {
          message: error instanceof Error ? error.message : 'Failed to verify code. Please try again.',
          details: error
        }
      };
    }
  };

  const resetPassword = async (email: string, otpCode: string, newPassword: string) => {
    console.log('🔄 Attempting to reset password for:', email);
    
    try {
      const { data, error } = await supabase.functions.invoke('reset-password-with-otp', {
        body: { email, otpCode, newPassword }
      });
      
      if (error) {
        console.error('❌ Error from reset-password-with-otp function:', error);
        return { error };
      }
      
      console.log('✅ Successfully reset password:', data);
      return { error: null, data };
    } catch (error) {
      console.error('❌ Network/unexpected error in resetPassword:', error);
      return { 
        error: {
          message: error instanceof Error ? error.message : 'Failed to reset password. Please try again.',
          details: error
        }
      };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    sendPasswordResetOTP,
    verifyOTP,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
