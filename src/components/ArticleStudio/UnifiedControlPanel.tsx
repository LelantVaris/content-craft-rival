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
    console.log('🚀 FUNCTION START: generateStreamingArticle called');
    
    const title = articleData.customTitle || articleData.selectedTitle;
    console.log('📝 TITLE CHECK:', {
      title,
      customTitle: articleData.customTitle,
      selectedTitle: articleData.selectedTitle,
      hasTitle: !!title
    });

    console.log('📋 OUTLINE CHECK:', {
      hasOutline,
      outlineLength: articleData.outline.length,
      outline: articleData.outline
    });

    if (!title || !hasOutline) {
      console.error('❌ VALIDATION FAILED:', { 
        hasTitle: !!title, 
        hasOutline,
        title,
        outlineLength: articleData.outline.length
      });
      setStreamingStatus('❌ Error: Please complete the title and outline first');
      return;
    }
    console.log('✅ VALIDATION PASSED');

    try {
      console.log('🔄 SETTING INITIAL STATE');
      setIsGenerating(true);
      setStreamingContent('');
      setStreamingStatus('🚀 Starting article generation...');
      
      console.log('🔐 GETTING AUTHENTICATION SESSION...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      console.log('🔐 SESSION RESULT:', {
        hasData: !!sessionData,
        hasSession: !!sessionData?.session,
        hasAccessToken: !!sessionData?.session?.access_token,
        sessionError: sessionError?.message
      });
      
      if (sessionError) {
        console.error('❌ SESSION ERROR:', sessionError);
        throw new Error(`Session error: ${sessionError.message}`);
      }
      
      if (!sessionData?.session) {
        console.error('❌ NO SESSION FOUND');
        throw new Error('No authentication session found');
      }

      const session = sessionData.session;
      console.log('✅ AUTHENTICATION SESSION OBTAINED');

      const requestBody = {
        title,
        outline: articleData.outline,
        keywords: articleData.keywords,
        audience: articleData.audience,
        tone: seoPreferences.defaultTone
      };
      console.log('📤 REQUEST BODY PREPARED:', requestBody);

      // Use direct fetch for streaming response
      const fetchUrl = `https://wpezdklekanfcctswtbz.supabase.co/functions/v1/generate-content`;
      const fetchHeaders = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      };
      
      console.log('🌐 PREPARING DIRECT FETCH REQUEST:', {
        url: fetchUrl,
        hasAuth: !!session.access_token
      });

      console.log('📡 MAKING FETCH REQUEST...');
      const response = await fetch(fetchUrl, {
        method: 'POST',
        headers: fetchHeaders,
        body: JSON.stringify(requestBody),
      });

      console.log('📥 FETCH RESPONSE RECEIVED:', { 
        ok: response.ok, 
        status: response.status, 
        statusText: response.statusText,
        hasBody: !!response.body
      });

      if (!response.ok) {
        console.error('❌ RESPONSE NOT OK');
        let errorText = '';
        try {
          errorText = await response.text();
          console.error('❌ ERROR RESPONSE TEXT:', errorText);
        } catch (textError) {
          console.error('❌ FAILED TO READ ERROR TEXT:', textError);
        }
        throw new Error(`Stream failed: ${response.statusText} - ${errorText}`);
      }

      console.log('📖 GETTING RESPONSE READER...');
      const reader = response.body?.getReader();
      if (!reader) {
        console.error('❌ NO RESPONSE STREAM AVAILABLE');
        throw new Error('No response stream available');
      }
      console.log('✅ READER OBTAINED');

      console.log('🔄 STARTING STREAM READING...');
      let fullContent = '';
      const decoder = new TextDecoder();
      let chunkCount = 0;

      setStreamingStatus('✍️ Generating content...');

      while (true) {
        console.log(`📖 READING CHUNK ${chunkCount + 1}...`);
        
        const { done, value } = await reader.read();
        console.log(`📖 CHUNK ${chunkCount + 1} read result:`, {
          done,
          hasValue: !!value,
          valueLength: value?.length
        });
        
        if (done) {
          console.log('✅ STREAM READING COMPLETED, total chunks:', chunkCount);
          break;
        }

        if (!value) {
          console.warn(`⚠️ CHUNK ${chunkCount + 1} has no value, continuing...`);
          continue;
        }

        chunkCount++;
        const chunk = decoder.decode(value);
        console.log(`📝 CHUNK ${chunkCount} DECODED:`, { 
          length: chunk.length, 
          preview: chunk.substring(0, 100)
        });

        const lines = chunk.split('\n');
        console.log(`📄 PROCESSING ${lines.length} lines from chunk ${chunkCount}`);

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          console.log(`📄 LINE ${i + 1}:`, { line: line.substring(0, 50), startsWithData: line.startsWith('data: ') });
          
          if (line.startsWith('data: ')) {
            try {
              const dataContent = line.slice(6);
              
              if (dataContent === '[DONE]') {
                console.log('✅ RECEIVED [DONE] SIGNAL');
                break;
              }
              
              console.log('🔄 PROCESSING SSE DATA:', { 
                dataContent: dataContent.substring(0, 100)
              });
              
              const data = JSON.parse(dataContent);
              console.log('📊 PARSED SSE DATA:', { 
                hasContent: !!data.content, 
                contentLength: data.content?.length || 0
              });
              
              if (data.content) {
                fullContent += data.content;
                console.log('📝 UPDATED CONTENT:', { 
                  totalLength: fullContent.length,
                  newContentLength: data.content.length
                });
                setStreamingContent(fullContent);
                setStreamingStatus('✍️ Writing article...');
              }
            } catch (parseError) {
              console.warn('⚠️ FAILED TO PARSE SSE DATA:', { 
                error: parseError, 
                line: line.substring(0, 100)
              });
            }
          }
        }
      }

      console.log('✅ ARTICLE GENERATION COMPLETED:', { 
        finalContentLength: fullContent.length
      });
      
      updateArticleData({ generatedContent: fullContent });
      setStreamingStatus('✅ Article generation complete!');

    } catch (error) {
      console.error('❌ COMPREHENSIVE ERROR DETAILS:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStreamingStatus(`❌ Error: ${errorMessage}`);
    } finally {
      console.log('🏁 GENERATION PROCESS FINISHED');
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

      {/* Collapsible sections - Only show outline section */}
      <Accordion type="multiple" defaultValue={["outline"]} className="space-y-2">
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
