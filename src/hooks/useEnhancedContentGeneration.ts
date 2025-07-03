
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StreamEvent {
  type: 'status' | 'section' | 'research' | 'content' | 'complete' | 'error';
  data: any;
}

export interface SectionState {
  id: string;
  title: string;
  status: 'pending' | 'researching' | 'writing' | 'complete' | 'error';
  content: string;
  progress: number;
  message?: string;
}

export function useEnhancedContentGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [sections, setSections] = useState<SectionState[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [finalContent, setFinalContent] = useState('');

  const generateContent = useCallback(async ({
    title,
    outline,
    keywords,
    audience,
    tone
  }: {
    title: string;
    outline: any[];
    keywords: string[];
    audience: string;
    tone: string;
  }) => {
    setIsGenerating(true);
    setError(null);
    setFinalContent('');
    setOverallProgress(0);
    
    // Initialize sections from outline
    const initialSections: SectionState[] = outline.map((section, index) => ({
      id: section.id || `section-${index}`,
      title: section.title,
      status: 'pending',
      content: '',
      progress: 0
    }));
    setSections(initialSections);

    try {
      // Use Supabase client to invoke the function like titles and outlines do
      const { data, error } = await supabase.functions.invoke('generate-enhanced-content', {
        body: {
          title,
          outline,
          keywords,
          audience,
          tone
        }
      });

      if (error) {
        console.error('Enhanced content generation error:', error);
        throw error;
      }

      // Handle the response - this will be different from streaming
      // For now, let's handle it as a complete response like other functions
      if (data?.content) {
        setFinalContent(data.content);
        setOverallProgress(100);
        setCurrentMessage('Enhanced article generation complete!');
        setSections(prev => prev.map(section => ({ ...section, status: 'complete' })));
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Content generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleStreamEvent = useCallback((event: StreamEvent) => {
    switch (event.type) {
      case 'status':
        setCurrentMessage(event.data.message);
        setOverallProgress(event.data.progress || 0);
        break;

      case 'section':
        setSections(prev => prev.map(section => 
          section.id === `section-${event.data.index}` 
            ? { ...section, status: event.data.status === 'processing' ? 'writing' : section.status }
            : section
        ));
        break;

      case 'research':
        setSections(prev => prev.map((section, index) => 
          index === event.data.sectionIndex 
            ? { ...section, status: 'researching', message: event.data.message }
            : section
        ));
        break;

      case 'content':
        setSections(prev => prev.map((section, index) => 
          index === event.data.sectionIndex 
            ? { ...section, status: 'complete', content: event.data.content, progress: 100 }
            : section
        ));
        setFinalContent(event.data.content);
        break;

      case 'complete':
        setFinalContent(event.data.content);
        setOverallProgress(100);
        setCurrentMessage(event.data.message);
        setSections(prev => prev.map(section => ({ ...section, status: 'complete' })));
        break;

      case 'error':
        setError(event.data.error);
        break;
    }
  }, []);

  const reset = useCallback(() => {
    setIsGenerating(false);
    setSections([]);
    setOverallProgress(0);
    setCurrentMessage('');
    setError(null);
    setFinalContent('');
  }, []);

  return {
    generateContent,
    isGenerating,
    sections,
    overallProgress,
    currentMessage,
    error,
    finalContent,
    reset
  };
}
