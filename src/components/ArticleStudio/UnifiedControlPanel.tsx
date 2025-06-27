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
}

export const UnifiedControlPanel: React.FC<UnifiedControlPanelProps> = ({
  articleData,
  updateArticleData,
  saveAndComplete,
  isGenerating,
  setStreamingContent,
  setIsGenerating
}) => {
  const [titleCount, setTitleCount] = useState(5);
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
  const [streamingStatus, setStreamingStatus] = useState<string>('');
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
      console.error('Please complete the title and outline first');
      setStreamingStatus('❌ Error: Please complete the title and outline first');
      return;
    }

    setIsGenerating(true);
    setStreamingContent('');
    setStreamingStatus('🚀 Starting enhanced article generation...');

    try {
      console.log('Calling generate-enhanced-article function...');
      
      // Use Supabase function invoke instead of direct fetch
      const { data, error } = await supabase.functions.invoke('generate-enhanced-article', {
        body: {
          title,
          outline: articleData.outline,
          keywords: articleData.keywords,
          audience: articleData.audience,
          tone: seoPreferences.defaultTone
        }
      });

      if (error) {
        console.error('Function invoke error:', error);
        throw new Error(error.message || 'Failed to call generate-enhanced-article function');
      }

      if (data && data.generatedText) {
        console.log('Function returned data:', data);
        updateArticleData({ generatedContent: data.generatedText });
        setStreamingContent(data.generatedText);
        setStreamingStatus('🎉 Article generation complete!');
      } else {
        console.error('No generated text returned from function');
        setStreamingStatus('❌ Error: No content generated');
      }

    } catch (error) {
      console.error('Error generating enhanced article:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`Failed to generate enhanced article: ${errorMessage}`);
      setStreamingContent('');
      setStreamingStatus(`❌ Error: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
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
          {isGenerating ? 'Generating Enhanced Article...' : 'Generate Enhanced Article'}
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
            <strong>🚀 Enhanced Generation:</strong> AI will research current data for each section 
            and create comprehensive, well-researched content.
          </div>
        </div>
      )}

      {/* Status display */}
      {streamingStatus && (
        <div className={`p-3 border rounded-lg ${
          streamingStatus.includes('Error') || streamingStatus.includes('❌') 
            ? 'bg-red-50 border-red-200 text-red-800' 
            : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="text-sm">
            <strong>Status:</strong> {streamingStatus}
          </div>
        </div>
      )}
    </div>
  );
};
