import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, otpCode, newPassword } = await req.json()
    
    if (!email || !otpCode) {
      throw new Error('Email and OTP code are required')
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Find valid OTP token
    const { data: tokens, error: selectError } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('email', email)
      .eq('otp_code', otpCode)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)

    if (selectError) {
      console.error('Error finding OTP token:', selectError)
      throw new Error('Failed to verify code')
    }

    if (!tokens || tokens.length === 0) {
      // Increment attempts for rate limiting
      await supabase
        .from('password_reset_tokens')
        .update({ attempts: supabase.rpc('coalesce', { value: 'attempts', default: 0 }) + 1 })
        .eq('email', email)
        .eq('otp_code', otpCode)

      throw new Error('Invalid or expired verification code')
    }

    const token = tokens[0]

    // Check attempt limits (max 5 attempts)
    if (token.attempts >= 5) {
      throw new Error('Too many verification attempts. Please request a new code.')
    }

    // If newPassword is provided, complete the password reset
    if (newPassword) {
      // Reset the user's password
      const { error: resetError } = await supabase.auth.admin.updateUserById(
        // We need to find the user by email first
        // Since we can't query auth.users directly, we'll use the admin API
        email,
        { password: newPassword }
      )

      if (resetError) {
        console.error('Error resetting password:', resetError)
        throw new Error('Failed to reset password')
      }

      // Mark token as used
      await supabase
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('id', token.id)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Password reset successfully' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } else {
      // Just verify the OTP without resetting password
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Code verified successfully',
          token: token.id 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

  } catch (error) {
    console.error('Error in verify-password-reset-otp:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to verify code' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})