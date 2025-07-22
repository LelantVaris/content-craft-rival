
-- Create password reset tokens table for OTP verification
CREATE TABLE public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Row Level Security
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting tokens (public access needed for forgot password)
CREATE POLICY "Anyone can create password reset tokens" 
  ON public.password_reset_tokens 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy for selecting tokens (only for verification)
CREATE POLICY "Tokens can be read for verification" 
  ON public.password_reset_tokens 
  FOR SELECT 
  USING (true);

-- Create policy for updating tokens (mark as used)
CREATE POLICY "Tokens can be updated for verification" 
  ON public.password_reset_tokens 
  FOR UPDATE 
  USING (true);

-- Create function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_password_tokens()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.password_reset_tokens 
  WHERE expires_at < NOW() - INTERVAL '1 hour';
END;
$$;

-- Create index for better performance
CREATE INDEX idx_password_reset_tokens_email_expires ON public.password_reset_tokens(email, expires_at);
CREATE INDEX idx_password_reset_tokens_otp_expires ON public.password_reset_tokens(otp_code, expires_at);
