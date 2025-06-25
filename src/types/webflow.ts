
import { Tables } from '@/integrations/supabase/types'

export type Article = Tables<'articles'>
export type WebflowConnection = Tables<'cms_connections'>

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

export interface WebflowCredentials {
  token?: string | number | boolean
  site_id?: string | number | boolean
  site_name?: string | number | boolean
}
