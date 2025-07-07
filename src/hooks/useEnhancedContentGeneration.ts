
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ArticleContent, StreamingProgress } from '@/types/article';

export interface StreamEvent {
  type: 'progress' | 'content' | 'complete' | 'error';
  data: any;
}

export interface ContentQuality {
  wordCountMet: boolean;
  pvotFramework: boolean;
  keywordIntegration: boolean;
  seoOptimized: boolean;
}

export function useEnhancedContentGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<StreamingProgress>({
    currentSection: 0,
    totalSections: 0,
    wordsGenerated: 0,
    targetWords: 0,
    status: ''
  });
  const [currentMessage, setCurrentMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [finalContent, setFinalContent] = useState('');
  const [partialArticle, setPartialArticle] = useState<Partial<ArticleContent> | null>(null);
  const [contentQuality, setContentQuality] = useState<ContentQuality | null>(null);

  const generateContent = useCallback(async (params: {
    title: string;
    outline: any[];
    keywords: string[];
    audience: string;
    tone: string;
    targetWordCount?: number;
    pointOfView?: string;
    brand?: string;
    product?: string;
    searchIntent?: string;
    primaryKeyword?: string;
  }) => {
    console.log('=== ENHANCED PVOD CONTENT GENERATION START ===');
    console.log('Raw input parameters:', JSON.stringify(params, null, 2));

    // Enhanced parameter validation with defaults
    const validatedParams = {
      title: params.title || 'Untitled Article',
      outline: Array.isArray(params.outline) ? params.outline : [],
      keywords: Array.isArray(params.keywords) ? params.keywords : [],
      audience: params.audience || 'general audience',
      tone: params.tone || 'professional',
      targetWordCount: params.targetWordCount || 4000,
      pointOfView: params.pointOfView || 'second',
      brand: params.brand || '',
      product: params.product || '',
      searchIntent: params.searchIntent || 'informational',
      primaryKeyword: params.primaryKeyword || (params.keywords && params.keywords[0]) || ''
    };

    console.log('Validated parameters:', JSON.stringify(validatedParams, null, 2));

    // Validate critical requirements
    if (!validatedParams.title || validatedParams.title === 'Untitled Article') {
      const errorMsg = 'Title is required for content generation';
      console.error('❌ Parameter validation failed:', errorMsg);
      setError(errorMsg);
      return;
    }

    if (!validatedParams.outline || validatedParams.outline.length === 0) {
      const errorMsg = 'Outline sections are required for content generation';
      console.error('❌ Parameter validation failed:', errorMsg);
      setError(errorMsg);
      return;
    }

    console.log('✅ Parameter validation passed');

    setIsGenerating(true);
    setError(null);
    setFinalContent('');
    setPartialArticle(null);
    setContentQuality(null);
    setProgress({
      currentSection: 0,
      totalSections: validatedParams.outline.length,
      wordsGenerated: 0,
      targetWords: validatedParams.targetWordCount,
      status: 'Initializing PVOD content generation...'
    });

    try {
      console.log('🔐 Getting Supabase session...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        throw new Error(`Session error: ${sessionError.message}`);
      }
      
      console.log('✅ Session status:', sessionData.session ? 'Valid session' : 'No session');
      
      const functionUrl = `https://wpezdklekanfcctswtbz.supabase.co/functions/v1/generate-enhanced-content`;
      console.log('🌐 Function URL:', functionUrl);

      const headers = {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwZXpka2xla2FuZmNjdHN3dGJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODg4NzgsImV4cCI6MjA2NjM2NDg3OH0.GRm70_874KITS3vkxgjVdWNed0Z923P_bFD6TOF6dgk'
      };

      if (sessionData.session?.access_token) {
        headers['authorization'] = `Bearer ${sessionData.session.access_token}`;
        console.log('✅ Added authorization header');
      } else {
        console.log('⚠️ No access token found');
      }

      console.log('📤 Making PVOD content request...');
      console.log('Request headers:', Object.keys(headers));
      console.log('Request body size:', JSON.stringify(validatedParams).length, 'characters');

      // Add timeout to fetch request - INCREASED TO 2 MINUTES
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ Request timeout after 2 minutes');
        controller.abort();
      }, 120000);

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(validatedParams),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('📥 Response received:');
      console.log('  Status:', response.status);
      console.log('  Status Text:', response.statusText);
      console.log('  Headers:', Object.fromEntries(response.headers.entries()));
      console.log('  OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      const decoder = new TextDecoder();
      console.log('🔄 Starting to read stream...');
      
      let buffer = '';
      let eventCount = 0;
      let chunkCount = 0;
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          chunkCount++;
          
          if (done) {
            console.log('✅ Stream reading completed');
            console.log('  Total chunks:', chunkCount);
            console.log('  Total events:', eventCount);
            console.log('  Final buffer:', buffer.length > 0 ? `"${buffer}"` : 'empty');
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          console.log(`📦 Chunk #${chunkCount} (${chunk.length} chars):`, 
            chunk.length > 200 ? `"${chunk.substring(0, 200)}..."` : `"${chunk}"`);
          
          buffer += chunk;
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const eventData = JSON.parse(line.slice(6));
                eventCount++;
                console.log(`🎯 Event #${eventCount} (${eventData.type}):`, 
                  eventData.type === 'content' ? 'Content update' : 
                  eventData.type === 'progress' ? `Progress: ${eventData.data?.status}` :
                  eventData.type);
                handleStreamEvent(eventData);
              } catch (parseError) {
                console.warn('⚠️ Failed to parse SSE data:', {
                  line: line.length > 100 ? `${line.substring(0, 100)}...` : line,
                  error: parseError
                });
              }
            } else if (line.trim()) {
              console.log('📄 Non-data line:', line.length > 100 ? `${line.substring(0, 100)}...` : line);
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      console.log('✅ Stream processing completed successfully');

    } catch (err) {
      console.error('=== ENHANCED PVOD CONTENT GENERATION ERROR ===');
      console.error('Error type:', typeof err);
      console.error('Error name:', err instanceof Error ? err.name : 'Unknown');
      console.error('Error message:', err instanceof Error ? err.message : String(err));
      console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');
      
      if (err instanceof Error && err.name === 'AbortError') {
        console.error('❌ Request was aborted (timeout)');
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setCurrentMessage(`Error: ${errorMessage}`);
    } finally {
      console.log('🏁 Setting isGenerating to false');
      setIsGenerating(false);
    }
  }, []);

  const handleStreamEvent = useCallback((event: StreamEvent) => {
    console.log('🎯 Stream event received:', event.type, 
      event.data ? `(${Object.keys(event.data).length} data keys)` : '(no data)');
    
    switch (event.type) {
      case 'progress':
        console.log('📊 Progress update:', event.data);
        setProgress(event.data);
        setCurrentMessage(event.data.status);
        break;

      case 'content':
        console.log('📝 Content update:', {
          hasPartialContent: !!event.data.partialContent,
          hasTitle: !!event.data.partialContent?.title,
          hasSections: !!event.data.partialContent?.sections,
          sectionsLength: event.data.partialContent?.sections?.length || 0
        });
        
        if (event.data.partialContent) {
          setPartialArticle(event.data.partialContent);
          
          // Convert structured content to markdown for display
          const article = event.data.partialContent;
          if (article.sections && article.sections.length > 0) {
            const markdown = `# ${article.title || ''}\n\n${
              article.sections.map((section: any) => 
                section?.title && section?.content 
                  ? `## ${section.title}\n\n${section.content}\n\n`
                  : ''
              ).join('')
            }`;
            console.log('📄 Generated markdown length:', markdown.length);
            setFinalContent(markdown);
          }
        }
        break;

      case 'complete':
        console.log('✅ Generation completed:', {
          hasArticle: !!event.data.article,
          hasContentQuality: !!event.data.contentQuality,
          message: event.data.message
        });
        
        const finalArticle = event.data.article;
        if (finalArticle && finalArticle.sections) {
          const markdown = `# ${finalArticle.title}\n\n${
            finalArticle.sections.map((section: any) => 
              `## ${section.title}\n\n${section.content}\n\n`
            ).join('')
          }`;
          console.log('📄 Final article markdown length:', markdown.length);
          setFinalContent(markdown);
          setCurrentMessage(event.data.message);
          setProgress(prev => ({ ...prev, progress: 100 }));
          
          if (event.data.contentQuality) {
            console.log('🏆 Content quality indicators:', event.data.contentQuality);
            setContentQuality(event.data.contentQuality);
          }
        }
        break;

      case 'error':
        console.error('❌ Stream error event:', event.data.error);
        setError(event.data.error);
        setCurrentMessage(`Error: ${event.data.error}`);
        break;

      default:
        console.warn('⚠️ Unknown stream event type:', event.type);
    }
  }, []);

  const reset = useCallback(() => {
    console.log('🔄 Resetting enhanced content generation state');
    setIsGenerating(false);
    setProgress({
      currentSection: 0,
      totalSections: 0,
      wordsGenerated: 0,
      targetWords: 0,
      status: ''
    });
    setCurrentMessage('');
    setError(null);
    setFinalContent('');
    setPartialArticle(null);
    setContentQuality(null);
  }, []);

  return {
    generateContent,
    isGenerating,
    progress,
    currentMessage,
    error,
    finalContent,
    partialArticle,
    contentQuality,
    reset,
    // Legacy compatibility
    sections: [],
    overallProgress: progress.wordsGenerated > 0 ? Math.min((progress.wordsGenerated / progress.targetWords) * 100, 100) : 0
  };
}
