
# Content Planner Implementation Plan

## Overview
The Content Planner is a full-page calendar feature that allows users to:
- Auto-generate content for 30 days
- View scheduled content in a calendar format
- Edit and reschedule articles
- Publish articles immediately or on schedule
- Automatically sync with Webflow CMS collections

## Phase 1: Calendar Foundation & UI
**Goal**: Create the basic calendar interface with content scheduling capabilities

### Tasks:
1. **Replace existing Calendar page with full-page calendar**
   - Use shadcn Calendar component as base
   - Implement month/week view toggle
   - Add content scheduling overlay
   - Design content preview cards for calendar cells

2. **Calendar State Management**
   - Create calendar context for managing scheduled content
   - Implement date selection and content assignment
   - Add drag-and-drop functionality for rescheduling

### Key Questions:
- Should we limit the calendar to current month + next month, or allow unlimited future scheduling?
- What information should be visible on calendar cells (title, status, publish time)?
- Should we support multiple articles per day or one article per day?

### Implementation Details:
```typescript
// Calendar state structure
interface CalendarState {
  scheduledContent: Record<string, ScheduledArticle[]>
  selectedDate: Date | null
  viewMode: 'month' | 'week'
  currentMonth: Date
}

interface ScheduledArticle {
  id: string
  title: string
  content: string
  scheduledDate: Date
  status: 'draft' | 'scheduled' | 'published'
  webflowCollectionId?: string
}
```

### Human-in-the-Loop Savepoint 1:
✅ **Review calendar UI mockup and approve design**
✅ **Confirm calendar behavior and scheduling rules**

---

## Phase 2: Content Generation Pipeline
**Goal**: Implement bulk content generation for 30-day periods

### Tasks:
1. **Bulk Content Generation System**
   - Create content generation queue
   - Implement topic suggestion algorithm
   - Add content variety and SEO optimization
   - Progress tracking for bulk operations

2. **Content Templates & Variety**
   - Define content types (blog posts, tutorials, news, etc.)
   - Create topic clustering to avoid repetition
   - Implement content length and tone variation

### Key Questions:
- How should we generate diverse topics for 30 days without repetition?
- Should users pre-approve topics before generation or review after?
- What's the credit cost structure for bulk generation?
- How do we handle generation failures or timeouts?

### Implementation Details:
```typescript
interface BulkGenerationRequest {
  startDate: Date
  endDate: Date
  contentTypes: ContentType[]
  targetAudience: string
  keywords: string[]
  tone: string
  publishingSchedule: 'daily' | 'weekdays' | 'custom'
}

interface ContentGenerationQueue {
  id: string
  userId: string
  totalArticles: number
  completedArticles: number
  failedArticles: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  generatedContent: ScheduledArticle[]
}
```

### Human-in-the-Loop Savepoint 2:
✅ **Test bulk generation with 5-day sample**
✅ **Review content quality and variety**
✅ **Approve topic generation algorithm**

---

## Phase 3: Webflow CMS Integration
**Goal**: Sync with Webflow CMS collections and enable automatic publishing

### Tasks:
1. **CMS Collection Discovery & Sync**
   - Extend existing Webflow integration
   - Discover and cache CMS collections structure
   - Map article fields to CMS fields
   - Handle field type mismatches

2. **Field Mapping Configuration**
   - Create field mapping UI
   - Auto-detect common field mappings
   - Save mapping configurations per connection
   - Validate field requirements

### Key Questions:
- Should we cache CMS collection structures or fetch them real-time?
- How do we handle CMS schema changes in Webflow?
- What happens if required CMS fields are missing?
- Should we support multiple CMS collections per calendar?

### Implementation Details:
```typescript
interface CMSCollection {
  id: string
  name: string
  slug: string
  fields: CMSField[]
  requiredFields: string[]
  lastSynced: Date
}

interface CMSField {
  id: string
  name: string
  slug: string
  type: 'text' | 'richtext' | 'date' | 'number' | 'reference'
  required: boolean
  maxLength?: number
}

interface FieldMapping {
  articleField: keyof ScheduledArticle
  cmsFieldId: string
  transformation?: 'truncate' | 'markdown-to-html' | 'extract-excerpt'
}
```

### Human-in-the-Loop Savepoint 3:
✅ **Test CMS collection discovery with user's Webflow site**
✅ **Verify field mapping accuracy**
✅ **Confirm publishing permissions**

---

## Phase 4: Advanced Calendar Features
**Goal**: Add editing, rescheduling, and publishing controls

### Tasks:
1. **In-Calendar Content Editing**
   - Modal editor for scheduled articles
   - Quick edit mode for titles and scheduling
   - Bulk operations (reschedule, delete, publish)

2. **Publishing Controls**
   - Immediate publishing capability
   - Scheduled publishing with timezone support
   - Publishing status tracking and retry logic
   - Webflow publish vs. draft modes

### Key Questions:
- Should edited content be re-validated for SEO and quality?
- How do we handle timezone differences between user and Webflow?
- What's the retry strategy for failed publications?
- Should we support partial publishing (some articles succeed, others fail)?

### Implementation Details:
```typescript
interface PublishingJob {
  id: string
  articleId: string
  scheduledTime: Date
  timezone: string
  webflowCollectionId: string
  status: 'pending' | 'processing' | 'published' | 'failed'
  retryCount: number
  lastError?: string
}

interface CalendarActions {
  editArticle: (articleId: string) => void
  rescheduleArticle: (articleId: string, newDate: Date) => void
  publishImmediately: (articleId: string) => Promise<void>
  bulkReschedule: (articleIds: string[], newDates: Date[]) => void
}
```

### Human-in-the-Loop Savepoint 4:
✅ **Test article editing and rescheduling**
✅ **Verify publishing workflow**
✅ **Test error handling and retry logic**

---

## Phase 5: Database Schema & Backend Services
**Goal**: Implement robust backend support for calendar features

### Database Changes:
```sql
-- Extend articles table for calendar features
ALTER TABLE articles ADD COLUMN scheduled_date DATE;
ALTER TABLE articles ADD COLUMN calendar_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE articles ADD COLUMN generation_batch_id UUID;

-- Content generation batches
CREATE TABLE content_generation_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_articles INTEGER NOT NULL,
  completed_articles INTEGER DEFAULT 0,
  failed_articles INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Publishing jobs queue
CREATE TABLE publishing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id),
  cms_connection_id UUID NOT NULL REFERENCES cms_connections(id),
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

-- CMS collection cache
CREATE TABLE cms_collections_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES cms_connections(id),
  collection_id TEXT NOT NULL,
  collection_data JSONB NOT NULL,
  last_synced TIMESTAMP DEFAULT NOW(),
  UNIQUE(connection_id, collection_id)
);
```

### Edge Functions:
1. **bulk-generate-content**: Handle 30-day content generation
2. **sync-cms-collections**: Discover and cache Webflow collections
3. **schedule-publishing**: Manage publishing queue
4. **publish-scheduled-content**: Cron job for scheduled publishing

### Human-in-the-Loop Savepoint 5:
✅ **Review database schema design**
✅ **Test edge functions individually**
✅ **Verify data integrity and constraints**

---

## Phase 6: Testing & Polish
**Goal**: Comprehensive testing and user experience refinement

### Tasks:
1. **Integration Testing**
   - End-to-end calendar workflow
   - Webflow publishing accuracy
   - Error handling and recovery
   - Performance with large content volumes

2. **User Experience Polish**
   - Loading states and progress indicators
   - Error messages and user guidance
   - Mobile responsiveness
   - Keyboard shortcuts and accessibility

### Key Questions:
- What's the maximum number of articles we should support in calendar view?
- How do we handle users with multiple Webflow sites?
- Should we implement undo functionality for bulk operations?
- What analytics should we track for calendar usage?

### Human-in-the-Loop Savepoint 6:
✅ **Complete user acceptance testing**
✅ **Performance testing with realistic data volumes**
✅ **Final UI/UX review and approval**

---

## Technical Dependencies

### Required Packages:
```json
{
  "react-big-calendar": "^1.8.2", // If we need more advanced calendar features
  "@dnd-kit/core": "^6.0.8", // For drag-and-drop rescheduling
  "date-fns-tz": "^2.0.0", // For timezone handling
  "react-hook-form": "^7.45.0", // Already installed
  "zod": "^3.22.0" // Already installed
}
```

### Webflow API Endpoints:
- `GET /sites/{site_id}/collections` - List collections
- `GET /collections/{collection_id}/fields` - Get field schema
- `POST /collections/{collection_id}/items` - Create content
- `PUT /collections/{collection_id}/items/{item_id}` - Update content
- `POST /sites/{site_id}/publish` - Publish site

### Credit System Integration:
- Bulk generation: 5 credits per article
- Individual edits: 1 credit per edit
- Publishing operations: Free (uses existing connections)

---

## Risk Mitigation

### Technical Risks:
1. **Webflow API Rate Limits**: Implement queue and retry logic
2. **Large Content Volumes**: Use pagination and virtual scrolling
3. **Publishing Failures**: Comprehensive error handling and user notifications
4. **Data Consistency**: Transaction management for bulk operations

### User Experience Risks:
1. **Overwhelming Interface**: Progressive disclosure and clear navigation
2. **Content Quality**: Preview and editing capabilities before publishing
3. **Timezone Confusion**: Clear timezone display and conversion
4. **Accidental Actions**: Confirmation dialogs for destructive operations

---

## Success Metrics

### Technical Metrics:
- Calendar load time < 2 seconds
- Content generation success rate > 95%
- Publishing success rate > 98%
- API response time < 500ms

### User Metrics:
- Calendar feature adoption rate
- Average articles scheduled per user
- Time spent in calendar vs. individual article creation
- User satisfaction with generated content quality

---

## Next Steps

1. **Phase 1**: Start with calendar UI implementation
2. **Get feedback** on calendar design and behavior
3. **Phase 2**: Implement basic content generation
4. **Test integration** with existing article system
5. **Phase 3**: Add Webflow CMS sync
6. **Continue iteratively** through remaining phases

Each phase should be completed and tested before moving to the next phase to ensure solid foundation and catch issues early.
