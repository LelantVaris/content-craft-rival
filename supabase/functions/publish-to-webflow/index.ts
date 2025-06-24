
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const { 
      token, 
      collectionId, 
      article, 
      fieldMapping, 
      publishLive = false,
      connectionId,
      userId
    } = await req.json()

    if (!token || !collectionId || !article) {
      return new Response(
        JSON.stringify({ error: 'Token, collectionId, and article are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Publishing to Webflow:', { 
      collectionId, 
      articleTitle: article.title, 
      publishLive 
    })

    // Initialize Supabase client for logging
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Log publishing attempt
    const { data: logEntry } = await supabase
      .from('publish_logs')
      .insert({
        article_id: article.id,
        cms_connection_id: connectionId,
        status: 'pending'
      })
      .select()
      .single()

    try {
      // Transform article content for Webflow
      const webflowItem = transformArticleForWebflow(article, fieldMapping)
      
      // Choose endpoint based on publish type
      const endpoint = publishLive 
        ? `https://api.webflow.com/v2/collections/${collectionId}/items/live`
        : `https://api.webflow.com/v2/collections/${collectionId}/items`

      console.log('Sending to Webflow:', endpoint)
      console.log('Item data:', JSON.stringify(webflowItem, null, 2))

      // Create item in Webflow
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(webflowItem)
      })

      const responseText = await response.text()
      console.log('Webflow response:', response.status, responseText)

      if (!response.ok) {
        throw new Error(`Webflow API error ${response.status}: ${responseText}`)
      }

      const result = JSON.parse(responseText)
      const externalUrl = `https://${result.item?.slug || 'item'}.webflow.io` // Placeholder URL

      // Update log with success
      await supabase
        .from('publish_logs')
        .update({
          status: 'success',
          external_id: result.item?.id,
          external_url: externalUrl
        })
        .eq('id', logEntry.id)

      // Update article status
      await supabase
        .from('articles')
        .update({
          status: publishLive ? 'published' : 'scheduled',
          published_at: publishLive ? new Date().toISOString() : null
        })
        .eq('id', article.id)

      console.log('Successfully published to Webflow')

      return new Response(
        JSON.stringify({ 
          success: true,
          externalId: result.item?.id,
          externalUrl,
          publishType: publishLive ? 'live' : 'staged',
          message: 'Article published successfully'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )

    } catch (publishError) {
      console.error('Publishing failed:', publishError)

      // Update log with failure
      if (logEntry) {
        await supabase
          .from('publish_logs')
          .update({
            status: 'failed',
            error_message: publishError.message
          })
          .eq('id', logEntry.id)
      }

      throw publishError
    }

  } catch (error) {
    console.error('Error publishing to Webflow:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to publish to Webflow', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function transformArticleForWebflow(article: any, fieldMapping: any) {
  const item: any = {
    fieldData: {}
  }

  // Map title (required Name field)
  if (fieldMapping?.title) {
    item.fieldData[fieldMapping.title] = article.title
  } else {
    item.fieldData['name'] = article.title // Default to 'name' field
  }

  // Map content
  if (fieldMapping?.content && article.content) {
    item.fieldData[fieldMapping.content] = {
      type: 'richtext',
      content: convertHtmlToWebflowRichText(article.content)
    }
  }

  // Map meta description
  if (fieldMapping?.description && article.meta_description) {
    item.fieldData[fieldMapping.description] = article.meta_description
  }

  // Map keywords
  if (fieldMapping?.keywords && article.keywords?.length > 0) {
    item.fieldData[fieldMapping.keywords] = article.keywords.join(', ')
  }

  // Set slug from title
  if (article.title) {
    item.fieldData['slug'] = article.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  return item
}

function convertHtmlToWebflowRichText(html: string) {
  // Basic HTML to Webflow Rich Text conversion
  // This is a simplified version - in production, you'd want more robust parsing
  return html
    .replace(/<h1>/g, '<h1>')
    .replace(/<h2>/g, '<h2>')
    .replace(/<h3>/g, '<h3>')
    .replace(/<p>/g, '<p>')
    .replace(/<strong>/g, '<strong>')
    .replace(/<em>/g, '<em>')
    .replace(/<a /g, '<a ')
}
