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
  const [seoPreferences, setSeoPreferences] = useState<SEOPreferences>({
    defaultTone: 'professional',
    preferredArticleLength: 1500,
    defaultKeywords: [],
    defaultAudience: ''
  });
  
  const hasTitle = !!(articleData.selectedTitle || articleData.customTitle);
  const hasOutline = articleData.outline.length > 0;

  const generateStreamingArticle = async () => {
    const title = articleData.customTitle || articleData.selectedTitle;
    console.log('🚀 generateStreamingArticle called with:', {
      title,
      hasOutline,
      outlineLength: articleData.outline.length,
      keywords: articleData.keywords,
      audience: articleData.audience
    });

    if (!title || !hasOutline) {
      console.error('❌ Missing requirements:', { title: !!title, hasOutline });
      setStreamingStatus('❌ Error: Please complete the title and outline first');
      return;
    }

    setIsGenerating(true);
    setStreamingContent('');
    setStreamingStatus('🚀 Starting article generation...');
    console.log('📝 Starting streaming article generation...');

    try {
      // Get the current session for authentication
      console.log('🔐 Getting authentication session...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('❌ No authentication session found');
        throw new Error('Authentication required');
      }
      console.log('✅ Authentication session obtained:', { 
        hasAccessToken: !!session.access_token,
        tokenLength: session.access_token?.length 
      });

      const requestBody = {
        title,
        outline: articleData.outline,
        keywords: articleData.keywords,
        audience: articleData.audience,
        writingStyle: 'professional',
        tone: seoPreferences.defaultTone
      };
      console.log('📤 Sending request with body:', requestBody);

      const response = await fetch(`https://wpezdklekanfcctswtbz.supabase.co/functions/v1/generate-content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response received:', { 
        ok: response.ok, 
        status: response.status, 
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response not ok:', { status: response.status, statusText: response.statusText, errorText });
        throw new Error(`Stream failed: ${response.statusText} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        console.error('❌ No response stream available');
        throw new Error('No response stream available');
      }

      console.log('📖 Starting to read stream...');
      let fullContent = '';
      const decoder = new TextDecoder();
      let chunkCount = 0;

      setStreamingStatus('✍️ Generating content...');

      while (true) {
        console.log(`📖 Reading chunk ${chunkCount + 1}...`);
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('✅ Stream reading completed, total chunks:', chunkCount);
          break;
        }

        chunkCount++;
        const chunk = decoder.decode(value);
        console.log(`📝 Chunk ${chunkCount} received:`, { 
          length: chunk.length, 
          preview: chunk.substring(0, 100) + (chunk.length > 100 ? '...' : '')
        });

        const lines = chunk.split('\n');
        console.log(`📄 Processing ${lines.length} lines from chunk ${chunkCount}`);

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const dataContent = line.slice(6);
              console.log('🔄 Processing SSE data:', { 
                dataPreview: dataContent.substring(0, 50) + (dataContent.length > 50 ? '...' : '')
              });
              
              const data = JSON.parse(dataContent);
              console.log('📊 Parsed SSE data:', { 
                hasContent: !!data.content, 
                contentLength: data.content?.length || 0,
                dataKeys: Object.keys(data)
              });
              
              if (data.content) {
                fullContent += data.content;
                console.log('📝 Updated content:', { 
                  totalLength: fullContent.length,
                  newContentLength: data.content.length
                });
                setStreamingContent(fullContent);
                setStreamingStatus('✍️ Writing article...');
              }
            } catch (parseError) {
              console.warn('⚠️ Failed to parse SSE data:', { 
                error: parseError, 
                line: line.substring(0, 100) + (line.length > 100 ? '...' : '')
              });
            }
          }
        }
      }

      console.log('✅ Article generation completed:', { 
        finalContentLength: fullContent.length,
        totalChunks: chunkCount
      });
      updateArticleData({ generatedContent: fullContent });
      setStreamingStatus('✅ Article generation complete!');

    } catch (error) {
      console.error('❌ Error generating streaming article:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      setStreamingStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      console.log('🏁 Generation process finished, setting isGenerating to false');
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
          onClick={generateStreamingArticle}
          disabled={!articleData.topic || !hasTitle || !hasOutline || isGenerating}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          size="lg"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isGenerating ? 'Generating Article...' : 'Generate Article'}
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

      {/* Simple generation info */}
      {hasTitle && hasOutline && !isGenerating && (
        <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
          <div className="text-sm text-purple-800">
            <strong>🚀 Ready to Generate:</strong>
            <br />
            Content will stream in real-time as it's generated
          </div>
        </div>
      )}
    </div>
  );
};
