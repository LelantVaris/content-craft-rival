
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
    console.log('Parameters:', {
      title: params.title,
      outlineSections: params.outline.length,
      targetWordCount: params.targetWordCount,
      pointOfView: params.pointOfView,
      searchIntent: params.searchIntent,
      brand: params.brand,
      product: params.product,
      primaryKeyword: params.primaryKeyword
    });

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
      const { data: sessionData } = await supabase.auth.getSession();
      const functionUrl = `https://wpezdklekanfcctswtbz.supabase.co/functions/v1/generate-enhanced-content`;

      const headers = {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwZXpka2xla2FuZmNjdHN3dGJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODg4NzgsImV4cCI6MjA2NjM2NDg3OH0.GRm70_874KITS3vkxgjVdWNed0Z923P_bFD6TOF6dgk'
      };

      if (sessionData.session?.access_token) {
        headers['authorization'] = `Bearer ${sessionData.session.access_token}`;
      }

      // Enhanced request body with comprehensive PVOD parameters
      const requestBody = {
        title: params.title,
        outline: params.outline,
        keywords: params.keywords,
        audience: params.audience,
        tone: params.tone,
        targetWordCount: params.targetWordCount || 4000,
        pointOfView: params.pointOfView || 'second',
        brand: params.brand || '',
        product: params.product || '',
        searchIntent: params.searchIntent || 'informational',
        primaryKeyword: params.primaryKeyword || params.keywords[0] || ''
      };

      console.log('Making PVOD content request with comprehensive parameters:', requestBody);

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response stream available');
      }

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.slice(6));
              handleStreamEvent(eventData);
            } catch (e) {
              console.warn('Failed to parse SSE data:', line, e);
            }
          }
        }
      }

    } catch (err) {
      console.error('Enhanced PVOD content generation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setCurrentMessage(`Error: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleStreamEvent = useCallback((event: StreamEvent) => {
    console.log('PVOD Stream event:', event.type, event.data);
    
    switch (event.type) {
      case 'progress':
        setProgress(event.data);
        setCurrentMessage(event.data.status);
        break;

      case 'content':
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
            setFinalContent(markdown);
          }
        }
        break;

      case 'complete':
        const finalArticle = event.data.article;
        if (finalArticle && finalArticle.sections) {
          const markdown = `# ${finalArticle.title}\n\n${
            finalArticle.sections.map((section: any) => 
              `## ${section.title}\n\n${section.content}\n\n`
            ).join('')
          }`;
          setFinalContent(markdown);
          setCurrentMessage(event.data.message);
          setProgress(prev => ({ ...prev, progress: 100 }));
          
          // Set content quality indicators
          if (event.data.contentQuality) {
            setContentQuality(event.data.contentQuality);
          }
        }
        break;

      case 'error':
        setError(event.data.error);
        setCurrentMessage(`Error: ${event.data.error}`);
        break;
    }
  }, []);

  const reset = useCallback(() => {
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
