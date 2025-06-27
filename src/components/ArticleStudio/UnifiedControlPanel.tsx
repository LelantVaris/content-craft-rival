import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArticleStudioData } from '@/hooks/useArticleStudio';
import { TopicInput } from './TopicInput';
import { SEOProMode } from './SEOProMode';
import { TitleSelector } from './TitleSelector';
import { TitleSummary } from './TitleSummary';
import { OutlineCreationPanel } from './OutlineCreationPanel';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, FileText, PenTool, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SEOPreferences } from '@/hooks/useSEOConfiguration';

interface UnifiedControlPanelProps {
  articleData: ArticleStudioData;
  updateArticleData: (updates: Partial<ArticleStudioData>) => void;
  saveAndComplete: () => Promise<void>;
  isGenerating: boolean;
  setStreamingContent: (content: string) => void;
  setIsGenerating: (generating: boolean) => void;
  setStreamingStatus: (status: any) => void;
}

export const UnifiedControlPanel: React.FC<UnifiedControlPanelProps> = ({
  articleData,
  updateArticleData,
  saveAndComplete,
  isGenerating,
  setStreamingContent,
  setIsGenerating,
  setStreamingStatus
}) => {
  const [titleCount, setTitleCount] = useState(5);
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
  const [enhancementProgress, setEnhancementProgress] = useState<{[key: number]: number}>({});
  const [seoPreferences, setSeoPreferences] = useState<SEOPreferences>({
    defaultTone: 'professional',
    preferredArticleLength: 1500,
    defaultKeywords: [],
    defaultAudience: ''
  });
  
  const hasTitle = !!(articleData.selectedTitle || articleData.customTitle);
  const hasOutline = articleData.outline.length > 0;

  const generateFullArticle = async () => {
    const title = articleData.customTitle || articleData.selectedTitle;
    if (!title || !hasOutline) {
      setStreamingStatus('❌ Error: Please complete the title and outline first');
      return;
    }

    setIsGenerating(true);
    setStreamingContent('');
    setStreamingStatus('🚀 Phase 1: Generating basic article...');

    try {
      // Phase 1: Generate basic article using existing function
      console.log('Phase 1: Generating basic article with SEO optimization...');
      
      const { data: basicArticleData, error: basicError } = await supabase.functions.invoke('generate-content', {
        body: {
          title,
          outline: articleData.outline,
          keywords: articleData.keywords,
          audience: articleData.audience,
          writingStyle: 'professional',
          tone: seoPreferences.defaultTone
        }
      });

      if (basicError) {
        throw new Error(basicError.message || 'Failed to generate basic article');
      }

      const basicArticle = basicArticleData?.content || '';
      if (!basicArticle) {
        throw new Error('No basic article content generated');
      }

      console.log('Phase 1 complete: Basic article generated');
      setStreamingContent(basicArticle);
      updateArticleData({ generatedContent: basicArticle });
      setStreamingStatus('✅ Phase 1 complete! Starting enhanced research...');

      // Phase 2: Enhance sections with research
      console.log('Phase 2: Starting section-by-section enhancement...');
      await enhanceSectionsWithResearch(basicArticle);

    } catch (error) {
      console.error('Error generating article:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setStreamingStatus(`❌ Error: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const enhanceSectionsWithResearch = async (basicArticle: string) => {
    try {
      setStreamingStatus('🔍 Phase 2: Researching and enhancing sections...');
      
      const response = await fetch(`https://wpezdklekanfcctswtbz.supabase.co/functions/v1/enhance-article-sections`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          basicArticle,
          outline: articleData.outline,
          keywords: articleData.keywords,
          audience: articleData.audience,
          tone: seoPreferences.defaultTone
        }),
      });

      if (!response.ok) {
        throw new Error(`Enhancement failed: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      let enhancedArticle = basicArticle;
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              switch (data.type) {
                case 'status':
                  setStreamingStatus(`🔍 ${data.message}`);
                  break;
                  
                case 'section-start':
                  setStreamingStatus(`🔍 Researching: ${data.sectionTitle}`);
                  setEnhancementProgress(prev => ({ ...prev, [data.sectionIndex]: data.progress }));
                  break;
                  
                case 'research-complete':
                  setStreamingStatus(`✨ Enhancing: ${data.sectionTitle} (${data.researchCount} sources found)`);
                  setEnhancementProgress(prev => ({ ...prev, [data.sectionIndex]: data.progress }));
                  break;
                  
                case 'section-enhanced':
                  // Replace the section in the article
                  const sectionTitle = data.sectionTitle;
                  const enhancedContent = data.enhancedContent;
                  
                  // Simple section replacement (could be improved with better parsing)
                  const sectionRegex = new RegExp(`(## ${sectionTitle}[\\s\\S]*?)(?=## |$)`, 'i');
                  enhancedArticle = enhancedArticle.replace(sectionRegex, enhancedContent);
                  
                  setStreamingContent(enhancedArticle);
                  setStreamingStatus(`✅ Enhanced: ${data.sectionTitle}`);
                  setEnhancementProgress(prev => ({ ...prev, [data.sectionIndex]: data.progress }));
                  break;
                  
                case 'complete':
                  updateArticleData({ generatedContent: enhancedArticle });
                  setStreamingStatus('🎉 Article enhancement complete! Research-backed sections ready.');
                  break;
                  
                case 'error':
                  throw new Error(data.message);
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', parseError);
            }
          }
        }
      }

    } catch (error) {
      console.error('Error enhancing sections:', error);
      setStreamingStatus(`❌ Enhancement error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleGenerateKeywords = async () => {
    if (!articleData.topic) {
      console.error('Please enter a topic first');
      return;
    }

    setIsGeneratingKeywords(true);
    try {
      console.log('Generating keywords for topic:', articleData.topic);
      
      const { data, error } = await supabase.functions.invoke('generate-keywords', {
        body: {
          topic: articleData.topic,
          audience: articleData.audience || ''
        }
      });

      if (error) {
        console.error('Error generating keywords:', error);
        throw new Error(error.message || 'Failed to generate keywords');
      }

      const keywords = data?.keywords || [];
      console.log('Generated keywords:', keywords);
      
      if (keywords.length > 0) {
        updateArticleData({ keywords });
        console.log(`Generated ${keywords.length} keywords successfully`);
      } else {
        console.warn('No keywords were generated. Please try again.');
      }
    } catch (error) {
      console.error('Error generating keywords:', error);
    } finally {
      setIsGeneratingKeywords(false);
    }
  };

  const handleSEOPreferenceUpdate = (updates: Partial<SEOPreferences>) => {
    console.log('Updating SEO preferences:', updates);
    setSeoPreferences(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="p-4 space-y-4">
      {/* Always visible topic and SEO section */}
      <Card className="border-2 border-purple-100">
        <CardContent className="p-4 space-y-4">
          <TopicInput
            topic={articleData.topic}
            onTopicChange={(topic) => updateArticleData({ topic })}
          />
          
          <SEOProMode
            seoProMode={true}
            onSeoProModeChange={() => {}}
            audience={articleData.audience}
            keywords={articleData.keywords}
            seoPreferences={seoPreferences}
            onAudienceChange={(audience) => updateArticleData({ audience })}
            onKeywordsChange={(keywords) => updateArticleData({ keywords })}
            onSEOPreferenceUpdate={handleSEOPreferenceUpdate}
            onGenerateAudience={async () => {}}
            onGenerateKeywords={handleGenerateKeywords}
            isGeneratingAudience={false}
            isGeneratingKeywords={isGeneratingKeywords}
            hasTopic={!!articleData.topic}
          />
        </CardContent>
      </Card>

      {/* Collapsible sections */}
      <Accordion type="multiple" defaultValue={["title", "outline"]} className="space-y-2">
        {/* Title Generation Section */}
        <AccordionItem value="title" className="border rounded-lg">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span className="font-medium">Title Generation</span>
              {hasTitle && (
                <div className="w-2 h-2 bg-green-500 rounded-full ml-2" />
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4">
              <TitleSelector
                hasTopic={!!articleData.topic}
                titleCount={titleCount}
                onTitleCountChange={setTitleCount}
                onGenerateTitles={() => {}}
                isGenerating={isGenerating}
                generatedTitles={[]}
                selectedTitle={articleData.selectedTitle}
                onTitleSelect={(title) => updateArticleData({ selectedTitle: title })}
                topic={articleData.topic}
                keywords={articleData.keywords}
                audience={articleData.audience}
              />
              
              {hasTitle && (
                <TitleSummary selectedTitle={articleData.customTitle || articleData.selectedTitle} />
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Outline Creation Section */}
        <AccordionItem value="outline" className="border rounded-lg">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="font-medium">Article Outline</span>
              {hasOutline && (
                <div className="w-2 h-2 bg-green-500 rounded-full ml-2" />
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <OutlineCreationPanel
              articleData={articleData}
              onUpdate={updateArticleData}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Action buttons */}
      <div className="space-y-2 pt-4 border-t">
        <Button
          onClick={generateFullArticle}
          disabled={!articleData.topic || !hasTitle || !hasOutline || isGenerating}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          size="lg"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isGenerating ? 'Generating Research-Enhanced Article...' : 'Generate Research-Enhanced Article'}
        </Button>
        
        <Button
          onClick={saveAndComplete}
          disabled={!hasTitle || isGenerating}
          variant="outline"
          className="w-full"
          size="lg"
        >
          <PenTool className="w-4 h-4 mr-2" />
          {isGenerating ? 'Saving...' : 'Save as Draft'}
        </Button>
      </div>

      {/* Enhanced generation info */}
      {hasTitle && hasOutline && !isGenerating && (
        <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
          <div className="text-sm text-purple-800">
            <strong>🚀 Two-Phase Generation:</strong>
            <br />
            Phase 1: Creates SEO-optimized article from outline
            <br />
            Phase 2: Researches and enhances each section with current data and sources
          </div>
        </div>
      )}

      {/* Enhancement progress */}
      {Object.keys(enhancementProgress).length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>Section Enhancement Progress:</strong>
            {articleData.outline.map((section, index) => (
              <div key={index} className="flex items-center justify-between mt-1">
                <span className="truncate">{section.title}</span>
                <span className="ml-2">{enhancementProgress[index] || 0}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
