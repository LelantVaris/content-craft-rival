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
    const { email } = await req.json()
    
    if (!email) {
      throw new Error('Email is required')
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Set expiration to 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

    // Clean up any existing tokens for this email
    await supabase
      .from('password_reset_tokens')
      .delete()
      .eq('email', email)

    // Store OTP in database
    const { error: insertError } = await supabase
      .from('password_reset_tokens')
      .insert({
        email,
        otp_code: otpCode,
        expires_at: expiresAt
      })

    if (insertError) {
      console.error('Error storing OTP:', insertError)
      throw new Error('Failed to generate reset code')
    }

    // For now, we'll just return the OTP (in production, this would be sent via email)
    // TODO: Integrate with email service (Resend, SendGrid, etc.)
    console.log(`Password reset OTP for ${email}: ${otpCode}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password reset code sent to your email',
        // Remove this in production - only for testing
        debug_otp: otpCode 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in send-password-reset-otp:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send reset code' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})