
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json()

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Test the token by making a request to Webflow API
    const response = await fetch('https://api.webflow.com/v2/sites', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      console.log('Webflow API response:', response.status, await response.text())
      return new Response(
        JSON.stringify({ 
          error: 'Invalid token', 
          details: 'Token validation failed with Webflow API' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const sites = await response.json()
    console.log('Token validation successful, found sites:', sites?.sites?.length || 0)

    return new Response(
      JSON.stringify({ 
        valid: true, 
        message: 'Token is valid',
        sitesCount: sites?.sites?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error validating Webflow token:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Validation failed', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
