# Article Studio Phase 4: Multi-Website Architecture

## Overview
**Priority**: HIGH - Foundation for all other features  
**Status**: 🔴 Not Started  
**Estimated Time**: 8-10 hours  
**Dependencies**: None (can be done in parallel with other phases)

## Current Problem Analysis

### Account Management Issues
1. **Sidebar Shows "Acme Corp"**: Placeholder instead of user's actual websites
2. **No Website Context**: Articles not tied to specific websites  
3. **Single Website Assumption**: System assumes one website per user
4. **Missing Onboarding Flow**: No website-specific setup process
5. **Crawler Data Isolation**: No website-specific crawl management

### Required Architecture Changes

#### Multi-Website Data Model
```sql
-- User can have multiple websites
User (1) ←→ (Many) Websites ←→ (Many) Articles
User (1) ←→ (Many) WebsiteCrawlResults
User (1) ←→ (Many) WebsiteOnboardingResponses
```

#### Website Selection Context
- Active website selection in UI
- Website-specific article creation
- Website-specific crawler data
- Website-specific onboarding preferences

## Implementation Plan

### Step 1: Database Schema Enhancement

#### Enhanced Website Management
**File**: New SQL migration

```sql
-- Create website_profiles table for onboarding responses
CREATE TABLE IF NOT EXISTS public.website_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  website_id UUID REFERENCES public.websites(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users NOT NULL,
  
  -- Onboarding responses
  business_type TEXT,
  target_audience TEXT,
  content_goals TEXT[],
  brand_voice TEXT,
  content_frequency TEXT,
  main_competitors TEXT[],
  key_products_services TEXT[],
  
  -- Preferences
  default_tone TEXT DEFAULT 'professional',
  default_article_length INTEGER DEFAULT 1500,
  preferred_content_types TEXT[] DEFAULT '{"blog-post"}',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(website_id)
);

-- Create website_crawl_status table
CREATE TABLE IF NOT EXISTS public.website_crawl_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  website_id UUID REFERENCES public.websites(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'crawling', 'completed', 'failed')),
  pages_found INTEGER DEFAULT 0,
  pages_crawled INTEGER DEFAULT 0,
  last_crawl_started TIMESTAMP WITH TIME ZONE,
  last_crawl_completed TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(website_id)
);

-- Update articles table to include website association
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS website_id UUID REFERENCES public.websites(id);

-- Enable RLS for new tables
ALTER TABLE public.website_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_crawl_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies for website_profiles
CREATE POLICY "Users can view their website profiles" 
  ON public.website_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their website profiles" 
  ON public.website_profiles 
  FOR ALL 
  USING (auth.uid() = user_id);

-- RLS Policies for website_crawl_status  
CREATE POLICY "Users can view their website crawl status" 
  ON public.website_crawl_status 
  FOR SELECT 
  USING (website_id IN (
    SELECT id FROM public.websites WHERE user_id = auth.uid()
  ));

CREATE POLICY "System can manage website crawl status" 
  ON public.website_crawl_status 
  FOR ALL 
  USING (true);

-- Update articles RLS to include website context
DROP POLICY IF EXISTS "Users can view their own articles" ON public.articles;
CREATE POLICY "Users can view their own articles" 
  ON public.articles 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    website_id IN (SELECT id FROM public.websites WHERE user_id = auth.uid())
  );
```

### Step 2: Enhanced Website Context Hook

#### Multi-Website Management Hook
**File**: `src/hooks/useMultiWebsiteContext.tsx`

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Website {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'inactive';
  crawl_status?: 'pending' | 'crawling' | 'completed' | 'failed';
  pages_crawled?: number;
  last_crawled?: string;
  profile?: WebsiteProfile;
}

interface WebsiteProfile {
  business_type: string;
  target_audience: string;
  content_goals: string[];
  brand_voice: string;
  default_tone: string;
  default_article_length: number;
}

interface MultiWebsiteContextType {
  websites: Website[];
  activeWebsite: Website | null;
  setActiveWebsite: (website: Website) => void;
  addWebsite: (websiteData: Partial<Website>) => Promise<Website>;
  updateWebsiteProfile: (websiteId: string, profile: Partial<WebsiteProfile>) => Promise<void>;
  refreshWebsites: () => Promise<void>;
  isLoading: boolean;
}

const MultiWebsiteContext = createContext<MultiWebsiteContextType | undefined>(undefined);

export const MultiWebsiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [activeWebsite, setActiveWebsite] = useState<Website | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadUserWebsites();
    }
  }, [user]);

  const loadUserWebsites = async () => {
    setIsLoading(true);
    try {
      const { data: websitesData, error } = await supabase
        .from('websites')
        .select(`
          *,
          website_profiles(*),
          website_crawl_status(*)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedWebsites = websitesData?.map(site => ({
        ...site,
        crawl_status: site.website_crawl_status?.[0]?.status,
        pages_crawled: site.website_crawl_status?.[0]?.pages_crawled,
        last_crawled: site.website_crawl_status?.[0]?.last_crawl_completed,
        profile: site.website_profiles?.[0]
      })) || [];

      setWebsites(formattedWebsites);
      
      // Set active website (first one or previously selected)
      const savedActiveId = localStorage.getItem('activeWebsiteId');
      const activeFromStorage = formattedWebsites.find(w => w.id === savedActiveId);
      setActiveWebsite(activeFromStorage || formattedWebsites[0] || null);
      
    } catch (error) {
      console.error('Error loading websites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetActiveWebsite = (website: Website) => {
    setActiveWebsite(website);
    localStorage.setItem('activeWebsiteId', website.id);
  };

  const addWebsite = async (websiteData: Partial<Website>): Promise<Website> => {
    const { data, error } = await supabase
      .from('websites')
      .insert({
        ...websiteData,
        user_id: user?.id,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;

    // Trigger crawl for new website
    await triggerWebsiteCrawl(data.id, websiteData.url);
    
    await refreshWebsites();
    return data;
  };

  const triggerWebsiteCrawl = async (websiteId: string, url: string) => {
    try {
      // Create crawl status record
      await supabase.from('website_crawl_status').upsert({
        website_id: websiteId,
        status: 'pending',
        last_crawl_started: new Date().toISOString()
      });

      // Trigger crawl
      await supabase.functions.invoke('crawl-website', {
        body: { websiteId, url }
      });
    } catch (error) {
      console.error('Error triggering crawl:', error);
    }
  };

  const updateWebsiteProfile = async (websiteId: string, profile: Partial<WebsiteProfile>) => {
    const { error } = await supabase
      .from('website_profiles')
      .upsert({
        website_id: websiteId,
        user_id: user?.id,
        ...profile,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    await refreshWebsites();
  };

  const refreshWebsites = async () => {
    await loadUserWebsites();
  };

  return (
    <MultiWebsiteContext.Provider value={{
      websites,
      activeWebsite,
      setActiveWebsite: handleSetActiveWebsite,
      addWebsite,
      updateWebsiteProfile,
      refreshWebsites,
      isLoading
    }}>
      {children}
    </MultiWebsiteContext.Provider>
  );
};

export const useMultiWebsite = () => {
  const context = useContext(MultiWebsiteContext);
  if (context === undefined) {
    throw new Error('useMultiWebsite must be used within a MultiWebsiteProvider');
  }
  return context;
};
```

### Step 3: Enhanced Sidebar with Real Websites

#### Website Selector in Sidebar
**File**: `src/components/AppSidebar.tsx` (Enhancement)

```typescript
// Add to existing AppSidebar component
import { useMultiWebsite } from '@/hooks/useMultiWebsiteContext';

export function AppSidebar() {
  const { websites, activeWebsite, setActiveWebsite } = useMultiWebsite();
  
  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        {/* Website Selector */}
        <TeamSwitcher 
          teams={websites.map(website => ({
            name: website.name,
            logo: website.url, // Could use favicon
            plan: website.crawl_status === 'completed' ? 'Crawled' : 'Pending'
          }))}
          activeTeam={activeWebsite ? {
            name: activeWebsite.name,
            logo: activeWebsite.url,
            plan: activeWebsite.crawl_status === 'completed' ? 'Crawled' : 'Pending'
          } : undefined}
          onTeamChange={(team) => {
            const website = websites.find(w => w.name === team.name);
            if (website) setActiveWebsite(website);
          }}
        />
      </SidebarHeader>
      
      {/* ... rest of sidebar content */}
    </Sidebar>
  );
}
```

### Step 4: Website-Specific Article Creation

#### Enhanced Article Studio with Website Context  
**File**: `src/components/ArticleStudio/UnifiedControlPanel.tsx` (Enhancement)

```typescript
import { useMultiWebsite } from '@/hooks/useMultiWebsiteContext';

export const UnifiedControlPanel: React.FC<UnifiedControlPanelProps> = ({
  articleData,
  updateArticleData,
  // ... other props
}) => {
  const { activeWebsite } = useMultiWebsite();

  useEffect(() => {
    // Load website-specific preferences when active website changes
    if (activeWebsite?.profile) {
      updateArticleData({
        audience: activeWebsite.profile.target_audience,
        tone: activeWebsite.profile.default_tone,
        length: activeWebsite.profile.default_article_length
      });
    }
  }, [activeWebsite]);

  // ... rest of component
};
```

#### Enhanced Article Saving with Website Association
**File**: `src/hooks/useArticleStudio.ts` (Enhancement)

```typescript
import { useMultiWebsite } from '@/hooks/useMultiWebsiteContext';

export function useArticleStudio() {
  const { activeWebsite } = useMultiWebsite();
  
  const saveAndComplete = useCallback(async () => {
    // ... existing code
    
    const savedArticle = await saveArticle({
      title: finalTitle,
      content: finalContent,
      website_id: activeWebsite?.id, // Associate with active website
      status: 'draft',
      // ... rest of article data
    });
    
    // ... rest of function
  }, [articleData, streamingContent, activeWebsite]);
  
  // ... rest of hook
}
```

### Step 5: Website-Specific Onboarding Flow

#### Website Onboarding Modal
**File**: `src/components/WebsiteOnboarding/WebsiteOnboardingModal.tsx`

```typescript
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMultiWebsite } from '@/hooks/useMultiWebsiteContext';

interface WebsiteOnboardingModalProps {
  website: Website;
  isOpen: boolean;
  onClose: () => void;
}

export const WebsiteOnboardingModal: React.FC<WebsiteOnboardingModalProps> = ({
  website,
  isOpen,
  onClose
}) => {
  const { updateWebsiteProfile } = useMultiWebsite();
  const [formData, setFormData] = useState({
    business_type: '',
    target_audience: '',
    content_goals: [],
    brand_voice: '',
    content_frequency: '',
    main_competitors: [],
    key_products_services: []
  });

  const handleSubmit = async () => {
    try {
      await updateWebsiteProfile(website.id, formData);
      onClose();
    } catch (error) {
      console.error('Error saving website profile:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Setup {website.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Business Type */}
          <div>
            <label className="text-sm font-medium">What type of business is this?</label>
            <Select onValueChange={(value) => setFormData(prev => ({ ...prev, business_type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="saas">SaaS/Technology</SelectItem>
                <SelectItem value="ecommerce">E-commerce</SelectItem>
                <SelectItem value="agency">Agency/Services</SelectItem>
                <SelectItem value="blog">Blog/Media</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Target Audience */}
          <div>
            <label className="text-sm font-medium">Who is your target audience?</label>
            <Textarea
              placeholder="Describe your ideal customer or reader..."
              value={formData.target_audience}
              onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
            />
          </div>

          {/* Content Goals */}
          <div>
            <label className="text-sm font-medium">What are your content goals?</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                'Drive organic traffic',
                'Generate leads',
                'Build brand awareness',
                'Educate customers',
                'Support sales',
                'Establish thought leadership'
              ].map((goal) => (
                <label key={goal} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.content_goals.includes(goal)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({ 
                          ...prev, 
                          content_goals: [...prev.content_goals, goal] 
                        }));
                      } else {
                        setFormData(prev => ({ 
                          ...prev, 
                          content_goals: prev.content_goals.filter(g => g !== goal) 
                        }));
                      }
                    }}
                  />
                  <span className="text-sm">{goal}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Brand Voice */}
          <div>
            <label className="text-sm font-medium">How would you describe your brand voice?</label>
            <Select onValueChange={(value) => setFormData(prev => ({ ...prev, brand_voice: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select brand voice" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="authoritative">Authoritative</SelectItem>
                <SelectItem value="playful">Playful</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>Skip for now</Button>
            <Button onClick={handleSubmit}>Save Profile</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

## Testing & Validation

### Multi-Website Functionality Tests
- [ ] User can add multiple websites
- [ ] Website selection persists across sessions
- [ ] Articles are properly associated with websites
- [ ] Crawler runs automatically for new websites
- [ ] Website profiles save and load correctly

### Data Isolation Tests
- [ ] Users only see their own websites
- [ ] Website data doesn't leak between users
- [ ] Article access is properly restricted
- [ ] Crawler data is website-specific

### Onboarding Flow Tests
- [ ] Website onboarding modal appears for new websites
- [ ] Profile data saves correctly
- [ ] Skipping onboarding doesn't break functionality
- [ ] Profile data loads in article creation

## Success Metrics

### User Experience
- **Website Management**: Users can manage multiple websites without confusion
- **Context Switching**: <2 seconds to switch between websites
- **Onboarding Completion**: 80%+ of users complete website onboarding
- **Data Persistence**: 100% of website selections persist correctly

### Technical Performance
- **Website Loading**: <1 second to load user's websites
- **Crawler Triggering**: 100% of new websites trigger crawls
- **Data Integrity**: 0 cases of data leakage between websites/users
- **Profile Loading**: Website profiles load within 500ms

## Dependencies

### Required for Phase 4
- ✅ User authentication system working
- ✅ Website management basic functionality exists
- ✅ Crawler system functional
- ✅ Database migrations can be applied

### Enables Other Phases
- **Phase 3 (SEO Pro Mode)**: Requires website selection for crawler data
- **Phase 2 (AI Enhancement)**: Benefits from website-specific preferences
- **Phase 5 (Data Persistence)**: Builds on website-specific data model

---

**Implementation Priority**: This phase should be completed early as it provides the foundation for website-specific features in other phases.

**Completion Criteria**: Users can manage multiple websites, articles are website-specific, onboarding works for each website, sidebar shows real websites instead of placeholders.
