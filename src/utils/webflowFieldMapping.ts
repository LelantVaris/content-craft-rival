
import { WebflowCollection, FieldMapping } from '@/types/webflow'

export const generateAutoFieldMapping = (collection: WebflowCollection): FieldMapping => {
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

  return mapping
}
