
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
    const { token, siteId } = await req.json()

    if (!token || !siteId) {
      return new Response(
        JSON.stringify({ error: 'Token and siteId are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Fetching collections for site:', siteId)

    // Fetch collections from Webflow API v2
    const response = await fetch(`https://api.webflow.com/v2/sites/${siteId}/collections`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('Webflow API error:', response.status, await response.text())
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch collections', 
          details: `API returned ${response.status}` 
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const data = await response.json()
    console.log(`Found ${data.collections?.length || 0} collections`)

    // Transform collections to include field mapping information
    const collections = data.collections?.map((collection: any) => ({
      id: collection.id,
      displayName: collection.displayName,
      singularName: collection.singularName,
      slug: collection.slug,
      fields: collection.fields?.map((field: any) => ({
        id: field.id,
        displayName: field.displayName,
        slug: field.slug,
        type: field.type,
        required: field.validations?.required,
        isTitle: field.slug === 'name', // Webflow's title field
        isContent: field.type === 'RichText' && field.slug.includes('content'),
        isDescription: field.type === 'PlainText' && (
          field.slug.includes('description') || 
          field.slug.includes('summary') ||
          field.slug.includes('excerpt')
        )
      })) || []
    })) || []

    return new Response(
      JSON.stringify({ 
        collections,
        siteId,
        totalCount: collections.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error discovering collections:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to discover collections', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
