
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
    console.log('Input parameters validation:', {
      title: params.title?.length || 0,
      outlineSections: params.outline?.length || 0,
      keywordsCount: params.keywords?.length || 0,
      audience: params.audience || 'NOT PROVIDED',
      tone: params.tone || 'NOT PROVIDED',
      targetWordCount: params.targetWordCount || 'NOT PROVIDED',
      pointOfView: params.pointOfView || 'NOT PROVIDED',
      searchIntent: params.searchIntent || 'NOT PROVIDED',
      brand: params.brand || 'NOT PROVIDED',
      product: params.product || 'NOT PROVIDED',
      primaryKeyword: params.primaryKeyword || 'NOT PROVIDED'
    });

    // Validate required parameters
    if (!params.title || !params.outline || params.outline.length === 0) {
      const errorMsg = 'Missing required parameters: title or outline';
      console.error('Parameter validation failed:', errorMsg);
      setError(errorMsg);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setFinalContent('');
    setPartialArticle(null);
    setContentQuality(null);
    setProgress({
      currentSection: 0,
      totalSections: params.outline.length,
      wordsGenerated: 0,
      targetWords: params.targetWordCount || 4000,
      status: 'Initializing PVOD content generation...'
    });

    try {
      console.log('Getting Supabase session...');
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Session data:', sessionData.session ? 'Valid session' : 'No session');
      
      const functionUrl = `https://wpezdklekanfcctswtbz.supabase.co/functions/v1/generate-enhanced-content`;
      console.log('Function URL:', functionUrl);

      const headers = {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwZXpka2xla2FuZmNjdHN3dGJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODg4NzgsImV4cCI6MjA2NjM2NDg3OH0.GRm70_874KITS3vkxgjVdWNed0Z923P_bFD6TOF6dgk'
      };

      if (sessionData.session?.access_token) {
        headers['authorization'] = `Bearer ${sessionData.session.access_token}`;
        console.log('Added authorization header');
      }

      // Enhanced request body with comprehensive PVOD parameters
      const requestBody = {
        title: params.title,
        outline: params.outline,
        keywords: params.keywords || [],
        audience: params.audience || 'general audience',
        tone: params.tone || 'professional',
        targetWordCount: params.targetWordCount || 4000,
        pointOfView: params.pointOfView || 'second',
        brand: params.brand || '',
        product: params.product || '',
        searchIntent: params.searchIntent || 'informational',
        primaryKeyword: params.primaryKeyword || params.keywords?.[0] || ''
      };

      console.log('Making PVOD content request with comprehensive parameters:', requestBody);

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response stream available');
      }

      console.log('Starting to read stream...');
      let buffer = '';
      let eventCount = 0;
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('Stream reading completed. Total events processed:', eventCount);
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.slice(6));
              eventCount++;
              console.log(`Processing stream event #${eventCount}:`, eventData.type, eventData.data);
              handleStreamEvent(eventData);
            } catch (e) {
              console.warn('Failed to parse SSE data:', line, e);
            }
          }
        }
      }

      console.log('Stream processing completed successfully');

    } catch (err) {
      console.error('=== ENHANCED PVOD CONTENT GENERATION ERROR ===');
      console.error('Error type:', typeof err);
      console.error('Error instanceof Error:', err instanceof Error);
      console.error('Error message:', err instanceof Error ? err.message : String(err));
      console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setCurrentMessage(`Error: ${errorMessage}`);
    } finally {
      console.log('Setting isGenerating to false');
      setIsGenerating(false);
    }
  }, []);

  const handleStreamEvent = useCallback((event: StreamEvent) => {
    console.log('PVOD Stream event received:', event.type, 'data keys:', Object.keys(event.data || {}));
    
    switch (event.type) {
      case 'progress':
        console.log('Progress update:', event.data);
        setProgress(event.data);
        setCurrentMessage(event.data.status);
        break;

      case 'content':
        console.log('Content update received, has partialContent:', !!event.data.partialContent);
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
            console.log('Generated markdown length:', markdown.length);
            setFinalContent(markdown);
          }
        }
        break;

      case 'complete':
        console.log('Generation completed, processing final article...');
        const finalArticle = event.data.article;
        if (finalArticle && finalArticle.sections) {
          const markdown = `# ${finalArticle.title}\n\n${
            finalArticle.sections.map((section: any) => 
              `## ${section.title}\n\n${section.content}\n\n`
            ).join('')
          }`;
          console.log('Final article markdown length:', markdown.length);
          setFinalContent(markdown);
          setCurrentMessage(event.data.message);
          setProgress(prev => ({ ...prev, progress: 100 }));
          
          // Set content quality indicators
          if (event.data.contentQuality) {
            console.log('Content quality indicators:', event.data.contentQuality);
            setContentQuality(event.data.contentQuality);
          }
        }
        break;

      case 'error':
        console.error('Stream error event:', event.data.error);
        setError(event.data.error);
        setCurrentMessage(`Error: ${event.data.error}`);
        break;
    }
  }, []);

  const reset = useCallback(() => {
    console.log('Resetting enhanced content generation state');
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
