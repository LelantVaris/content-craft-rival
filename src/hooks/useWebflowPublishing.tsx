
import { useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Tables } from '@/integrations/supabase/types'

type Article = Tables<'articles'>
type WebflowConnection = Tables<'cms_connections'>

export interface WebflowCollection {
  id: string
  displayName: string
  singularName: string
  slug: string
  fields: WebflowField[]
}

export interface WebflowField {
  id: string
  displayName: string
  slug: string
  type: string
  required?: boolean
  isTitle?: boolean
  isContent?: boolean
  isDescription?: boolean
}

export interface FieldMapping {
  title?: string
  content?: string
  description?: string
  keywords?: string
}

export interface PublishingState {
  isLoading: boolean
  isPublishing: boolean
  collections: WebflowCollection[]
  selectedCollection: WebflowCollection | null
  fieldMapping: FieldMapping
  publishingProgress: number
}

export function useWebflowPublishing() {
  const [state, setState] = useState<PublishingState>({
    isLoading: false,
    isPublishing: false,
    collections: [],
    selectedCollection: null,
    fieldMapping: {},
    publishingProgress: 0
  })
  const { toast } = useToast()

  const discoverCollections = useCallback(async (connection: WebflowConnection, siteId?: string) => {
    setState(prev => ({ ...prev, isLoading: true, collections: [] }))
    
    try {
      const credentials = typeof connection.credentials === 'object' 
        ? connection.credentials 
        : JSON.parse(connection.credentials || '{}')
      
      const token = credentials.token
      const targetSiteId = siteId || credentials.site_id || (connection.site_id ? String(connection.site_id) : undefined)

      if (!token || !targetSiteId) {
        throw new Error('Missing token or site ID in connection')
      }

      const response = await supabase.functions.invoke('discover-webflow-collections', {
        body: { token, siteId: targetSiteId }
      })

      if (response.error) {
        throw new Error(response.error.message || 'Failed to discover collections')
      }

      const collections = response.data?.collections || []
      console.log('Discovered collections:', collections)

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        collections,
        selectedCollection: collections.length > 0 ? collections[0] : null
      }))

      // Auto-generate field mapping for first collection
      if (collections.length > 0) {
        generateFieldMapping(collections[0])
      }

      return collections
    } catch (error) {
      console.error('Error discovering collections:', error)
      setState(prev => ({ ...prev, isLoading: false }))
      toast({
        title: "Discovery Failed",
        description: error instanceof Error ? error.message : "Failed to discover Webflow collections",
        variant: "destructive"
      })
      throw error
    }
  }, [toast])

  const generateFieldMapping = useCallback((collection: WebflowCollection) => {
    const mapping: FieldMapping = {}

    // Find title field (Name field or first required text field)
    const titleField = collection.fields.find(f => f.isTitle || f.slug === 'name') ||
                     collection.fields.find(f => f.required && f.type === 'PlainText')
    if (titleField) mapping.title = titleField.slug

    // Find content field (first RichText field)
    const contentField = collection.fields.find(f => f.type === 'RichText')
    if (contentField) mapping.content = contentField.slug

    // Find description field
    const descField = collection.fields.find(f => f.isDescription) ||
                     collection.fields.find(f => f.type === 'PlainText' && f.slug !== mapping.title)
    if (descField) mapping.description = descField.slug

    // Find keywords field
    const keywordsField = collection.fields.find(f => 
      f.slug.includes('keyword') || f.slug.includes('tag')
    )
    if (keywordsField) mapping.keywords = keywordsField.slug

    setState(prev => ({ ...prev, fieldMapping: mapping }))
    console.log('Generated field mapping:', mapping)
  }, [])

  const publishToWebflow = useCallback(async (
    article: Article,
    connection: WebflowConnection,
    options: { publishLive?: boolean } = {}
  ) => {
    if (!state.selectedCollection) {
      throw new Error('No collection selected')
    }

    setState(prev => ({ ...prev, isPublishing: true, publishingProgress: 0 }))

    try {
      const credentials = typeof connection.credentials === 'object' 
        ? connection.credentials 
        : JSON.parse(connection.credentials || '{}')

      setState(prev => ({ ...prev, publishingProgress: 25 }))

      const response = await supabase.functions.invoke('publish-to-webflow', {
        body: {
          token: credentials.token,
          collectionId: state.selectedCollection.id,
          article,
          fieldMapping: state.fieldMapping,
          publishLive: options.publishLive || false,
          connectionId: connection.id,
          userId: (await supabase.auth.getUser()).data.user?.id
        }
      })

      setState(prev => ({ ...prev, publishingProgress: 75 }))

      if (response.error) {
        throw new Error(response.error.message || 'Publishing failed')
      }

      setState(prev => ({ ...prev, publishingProgress: 100 }))

      toast({
        title: "Published Successfully",
        description: `Article published to ${state.selectedCollection.displayName}`,
        variant: "default"
      })

      return response.data
    } catch (error) {
      console.error('Publishing error:', error)
      toast({
        title: "Publishing Failed",
        description: error instanceof Error ? error.message : "Failed to publish to Webflow",
        variant: "destructive"
      })
      throw error
    } finally {
      setState(prev => ({ ...prev, isPublishing: false, publishingProgress: 0 }))
    }
  }, [state.selectedCollection, state.fieldMapping, toast])

  const selectCollection = useCallback((collection: WebflowCollection) => {
    setState(prev => ({ ...prev, selectedCollection: collection }))
    generateFieldMapping(collection)
  }, [generateFieldMapping])

  const updateFieldMapping = useCallback((mapping: Partial<FieldMapping>) => {
    setState(prev => ({ 
      ...prev, 
      fieldMapping: { ...prev.fieldMapping, ...mapping }
    }))
  }, [])

  return {
    ...state,
    discoverCollections,
    publishToWebflow,
    selectCollection,
    updateFieldMapping,
    generateFieldMapping
  }
}
