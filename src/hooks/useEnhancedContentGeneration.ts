
import { useState, useCallback } from 'react';

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
      const response = await fetch('/api/v1/functions/v1/generate-enhanced-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          outline,
          keywords,
          audience,
          tone
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start content generation');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response stream available');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.slice(6));
              handleStreamEvent(eventData);
            } catch (e) {
              console.warn('Failed to parse SSE data:', e);
            }
          }
        }
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
