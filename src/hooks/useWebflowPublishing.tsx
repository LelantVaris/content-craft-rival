
import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { 
  Article, 
  WebflowConnection, 
  WebflowCollection, 
  FieldMapping, 
  PublishingState 
} from '@/types/webflow'
import { 
  discoverWebflowCollections, 
  publishArticleToWebflow 
} from '@/utils/webflowApi'
import { generateAutoFieldMapping } from '@/utils/webflowFieldMapping'

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
      const collections = await discoverWebflowCollections(connection, siteId)
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
    const mapping = generateAutoFieldMapping(collection)
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
      setState(prev => ({ ...prev, publishingProgress: 25 }))

      const result = await publishArticleToWebflow(
        article,
        connection,
        state.selectedCollection.id,
        state.fieldMapping,
        options
      )

      setState(prev => ({ ...prev, publishingProgress: 75 }))
      setState(prev => ({ ...prev, publishingProgress: 100 }))

      toast({
        title: "Published Successfully",
        description: `Article published to ${state.selectedCollection.displayName}`,
        variant: "default"
      })

      return result
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
