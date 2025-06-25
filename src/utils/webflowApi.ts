
import { supabase } from '@/integrations/supabase/client'
import { WebflowConnection, WebflowCollection, Article, FieldMapping } from '@/types/webflow'

export const parseWebflowCredentials = (connection: WebflowConnection) => {
  const credentials = typeof connection.credentials === 'object' 
    ? connection.credentials as any
    : JSON.parse(connection.credentials || '{}')
  
  const convertToString = (value: any): string => {
    if (value === undefined || value === null) return ''
    return String(value)
  }
  
  return {
    token: convertToString(credentials.token),
    siteId: convertToString(credentials.site_id) || convertToString(connection.site_id),
    siteName: convertToString(credentials.site_name)
  }
}

export const discoverWebflowCollections = async (
  connection: WebflowConnection, 
  siteId?: string
): Promise<WebflowCollection[]> => {
  const { token, siteId: defaultSiteId } = parseWebflowCredentials(connection)
  const targetSiteId = siteId || defaultSiteId

  if (!token || !targetSiteId) {
    throw new Error('Missing token or site ID in connection')
  }

  const response = await supabase.functions.invoke('discover-webflow-collections', {
    body: { token, siteId: targetSiteId }
  })

  if (response.error) {
    throw new Error(response.error.message || 'Failed to discover collections')
  }

  return response.data?.collections || []
}

export const publishArticleToWebflow = async (
  article: Article,
  connection: WebflowConnection,
  collectionId: string,
  fieldMapping: FieldMapping,
  options: { publishLive?: boolean } = {}
) => {
  const { token } = parseWebflowCredentials(connection)

  const response = await supabase.functions.invoke('publish-to-webflow', {
    body: {
      token,
      collectionId,
      article,
      fieldMapping,
      publishLive: options.publishLive || false,
      connectionId: connection.id,
      userId: (await supabase.auth.getUser()).data.user?.id
    }
  })

  if (response.error) {
    throw new Error(response.error.message || 'Publishing failed')
  }

  return response.data
}
