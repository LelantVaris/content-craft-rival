
# Website Connection Map - MVP Implementation Guide

## Overview
Build an internal website mapping feature that visualizes page connections like Obsidian's graph view. This MVP focuses on authenticated users crawling websites and visualizing their internal link structure using React Flow.

## MVP Scope
- ✅ Database schema for website maps, pages, and connections
- ✅ Firecrawl integration for website crawling
- ✅ Real-time crawl progress tracking
- ✅ Interactive graph visualization of page connections
- 🚧 Current crawler test interface
- ❌ Lead magnet (future phase)
- ❌ Onboarding integration (future phase)

## Phase 1: Database Schema & Setup ✅

### SQL Migrations (Already Applied)

```sql
-- Website maps and crawl data
CREATE TABLE public.website_maps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  website_url TEXT NOT NULL,
  sitemap_url TEXT,
  crawl_status TEXT DEFAULT 'pending' CHECK (crawl_status IN ('pending', 'crawling', 'completed', 'failed')),
  total_pages INTEGER DEFAULT 0,
  crawled_pages INTEGER DEFAULT 0,
  last_crawl_date TIMESTAMP WITH TIME ZONE,
  crawl_job_id TEXT,
  crawl_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Individual page data 
CREATE TABLE public.website_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  website_map_id UUID REFERENCES public.website_maps(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  meta_description TEXT,
  content_summary TEXT,
  word_count INTEGER DEFAULT 0,
  internal_links TEXT[] DEFAULT '{}',
  external_links TEXT[] DEFAULT '{}',
  crawl_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(website_map_id, url)
);

-- Internal link connections for graph visualization
CREATE TABLE public.page_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  website_map_id UUID REFERENCES public.website_maps(id) ON DELETE CASCADE,
  source_page_id UUID REFERENCES public.website_pages(id) ON DELETE CASCADE,
  target_page_id UUID REFERENCES public.website_pages(id) ON DELETE CASCADE,
  link_text TEXT,
  link_type TEXT DEFAULT 'internal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(source_page_id, target_page_id)
);
```

## Phase 2: Firecrawl Integration & Backend ✅

### Edge Functions

#### `crawl-website` Function
- ✅ URL discovery via sitemap.xml or Firecrawl Map
- ✅ Website map creation in database
- ✅ Firecrawl crawl job initiation
- 🔧 **NEEDS FIX**: Internal links data collection
- 🔧 **NEEDS FIX**: User ID assignment

#### `check-crawl-status` Function  
- ✅ Status polling from Firecrawl API
- ✅ Database updates with crawl progress
- 🔧 **NEEDS FIX**: Internal links processing
- 🔧 **NEEDS FIX**: Page connections creation

## Phase 3: Current Implementation Status

### Crawler Test Interface ✅
- ✅ URL input and crawl initiation
- ✅ Real-time console logging
- ✅ Progress tracking component
- 🔧 **CURRENT ISSUE**: Progress not updating in real-time
- 🔧 **CURRENT ISSUE**: User maps not loading

### Data Flow Issues to Fix
1. **User ID Assignment**: Crawls not associated with authenticated users
2. **Real-time Progress**: Progress component showing 0/0 pages
3. **Internal Links**: Not being extracted and stored properly
4. **Page Connections**: Not being created in database

## Phase 4: MVP Graph Visualization (Next Step)

### React Flow Integration
- Interactive node-link diagram
- Pages as nodes, internal links as edges
- Node sizing based on importance (word count, connections)
- Click interactions for page details
- Zoom, pan, and layout controls

### Components to Create
- `WebsiteMapGraph.tsx` - Main graph component
- `MapNode.tsx` - Custom node component
- `PageDetailsPanel.tsx` - Side panel for node details
- `MapControls.tsx` - Layout and view controls

### Graph Features
- **Node Types**: Homepage (green), Hub pages (blue), Regular pages (gray)
- **Edge Types**: Internal links with weight based on link frequency
- **Layouts**: Force-directed, hierarchical, circular
- **Interactions**: Node selection, hover tooltips, pan/zoom
- **Filtering**: By page type, word count, connection strength

## Implementation Priority

### Immediate Fixes (Current Sprint)
1. **Fix User ID Assignment** in `crawl-website` edge function
2. **Fix Real-time Progress Updates** in CrawlerTest component
3. **Fix Internal Links Collection** in Firecrawl API calls
4. **Fix Page Connections Processing** in `check-crawl-status`

### Next Sprint - Graph Visualization
1. **Create WebsiteMapGraph Component** using React Flow
2. **Add Graph View Toggle** to CrawlerTest page
3. **Implement Interactive Features** (click, zoom, filter)
4. **Add Page Details Panel** for selected nodes

### Future Enhancements
- Export graph as image/PDF
- Advanced layout algorithms
- Performance optimization for large sites
- Search and filtering capabilities
- Integration with SEO analysis

## Technical Requirements

### Dependencies (Already Installed)
- `@xyflow/react` - Graph visualization
- `@mendable/firecrawl-js` - Website crawling
- Supabase - Database and authentication

### Environment Variables
```
FIRECRAWL_API_KEY=fc-your-api-key-here
```

### File Structure
```
src/
├── components/
│   ├── CrawlConsole.tsx ✅
│   ├── CrawlProgress.tsx ✅
│   └── WebsiteMapGraph/ (TO CREATE)
│       ├── WebsiteMapGraph.tsx
│       ├── MapNode.tsx
│       ├── PageDetailsPanel.tsx
│       └── MapControls.tsx
├── hooks/
│   ├── useWebsiteCrawler.ts ✅
│   ├── useCrawlStatus.ts ✅
│   ├── useWebsiteMap.ts ✅
│   └── useGraphData.ts (TO CREATE)
├── pages/
│   └── CrawlerTest.tsx ✅ (NEEDS UPDATES)
└── supabase/functions/
    ├── crawl-website/ ✅ (NEEDS FIXES)
    └── check-crawl-status/ ✅ (NEEDS FIXES)
```

## Success Criteria for MVP

### Functional Requirements
- [x] User can input website URL and start crawl
- [x] Real-time progress updates during crawl
- [ ] Crawl properly extracts internal links and page data
- [ ] Interactive graph visualization of page connections
- [ ] Click on nodes to view page details
- [ ] Graph shows different node types (homepage, hubs, regular pages)
- [ ] User can save and reload website maps

### Technical Requirements
- [ ] All crawl data persists in database with proper user association
- [ ] Graph renders smoothly for sites with 50+ pages
- [ ] Real-time updates work consistently
- [ ] Error handling for failed crawls
- [ ] Responsive design works on desktop and tablet

## Current Bugs to Fix

1. **Progress Not Updating**: CrawlProgress shows 0/0 pages despite console logs showing progress
2. **Maps Not Loading**: "Load My Maps" returns 0 maps even after successful crawls
3. **Missing Internal Links**: Page connections not being created due to missing link data
4. **User Association**: Crawls not properly associated with authenticated users

## Next Steps

1. Fix the current data flow issues
2. Implement the graph visualization component
3. Add the graph view to the CrawlerTest page
4. Test with various website types and sizes
5. Polish the user experience and error handling

This MVP will provide a solid foundation for the website mapping feature that can be expanded with lead magnet functionality and advanced features in future iterations.
