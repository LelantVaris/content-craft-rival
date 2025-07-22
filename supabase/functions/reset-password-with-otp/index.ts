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
    
    if (!email || !otpCode || !newPassword) {
      throw new Error('Email, OTP code, and new password are required')
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Find and verify valid OTP token
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
      throw new Error('Invalid or expired verification code')
    }

    const token = tokens[0]

    // Check attempt limits
    if (token.attempts >= 5) {
      throw new Error('Too many verification attempts. Please request a new code.')
    }

    // Find user by email to get user ID
    const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers()
    
    if (getUserError) {
      console.error('Error finding user:', getUserError)
      throw new Error('Failed to find user account')
    }

    const user = users.find(u => u.email === email)
    if (!user) {
      throw new Error('User account not found')
    }

    // Reset the user's password
    const { error: resetError } = await supabase.auth.admin.updateUserById(
      user.id,
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

    // Clean up old tokens for this email
    await supabase
      .from('password_reset_tokens')
      .delete()
      .eq('email', email)
      .neq('id', token.id)

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

  } catch (error) {
    console.error('Error in reset-password-with-otp:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to reset password' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})