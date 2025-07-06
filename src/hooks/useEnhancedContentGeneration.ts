
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StreamEvent {
  type: 'status' | 'content' | 'complete' | 'error';
  data: any;
}

export interface SectionState {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'researching' | 'writing' | 'complete' | 'error';
  message?: string;
}

export function useEnhancedContentGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [finalContent, setFinalContent] = useState('');

  const generateContent = useCallback(async ({
    title,
    outline,
    keywords,
    audience,
    tone,
    targetWordCount,
    pointOfView,
    brand,
    product,
    searchIntent,
    primaryKeyword,
    length,
    customWordCount
  }: {
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
    length?: string;
    customWordCount?: number;
  }) => {
    console.log('=== ENHANCED CONTENT GENERATION START ===');
    console.log('Title:', title);
    console.log('Outline sections:', outline.length);
    console.log('Keywords:', keywords);
    console.log('Audience:', audience);
    console.log('Tone:', tone);
    console.log('Target Word Count:', targetWordCount);
    console.log('Point of View:', pointOfView);
    console.log('Brand:', brand);
    console.log('Product:', product);
    console.log('Search Intent:', searchIntent);
    console.log('Primary Keyword:', primaryKeyword);
    console.log('Length:', length);
    console.log('Custom Word Count:', customWordCount);

    setIsGenerating(true);
    setError(null);
    setFinalContent('');
    setOverallProgress(0);
    setSections([]);

    try {
      // Get the current session to include auth headers
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Session data available:', !!sessionData.session);

      // Build the Supabase function URL
      const functionUrl = `https://wpezdklekanfcctswtbz.supabase.co/functions/v1/generate-enhanced-content`;
      console.log('Function URL:', functionUrl);

      const headers = {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwZXpka2xla2FuZmNjdHN3dGJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODg4NzgsImV4cCI6MjA2NjM2NDg3OH0.GRm70_874KITS3vkxgjVdWNed0Z923P_bFD6TOF6dgk'
      };

      // Add authorization header if session exists
      if (sessionData.session?.access_token) {
        headers['authorization'] = `Bearer ${sessionData.session.access_token}`;
        console.log('Authorization header added');
      }

      const requestBody = {
        title,
        outline,
        keywords,
        audience,
        tone,
        targetWordCount,
        pointOfView,
        brand,
        product,
        searchIntent,
        primaryKeyword,
        length,
        customWordCount
      };

      console.log('Making fetch request with body:', requestBody);

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response not ok:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        console.error('No response reader available');
        throw new Error('No response stream available');
      }

      console.log('Starting to read stream...');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        console.log('Stream read:', { done, valueLength: value?.length });
        
        if (done) {
          console.log('Stream reading complete');
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        console.log('Received chunk:', chunk.substring(0, 100) + '...');

        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          console.log('Processing line:', line);
          
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.slice(6));
              console.log('Parsed event:', eventData);
              handleStreamEvent(eventData);
            } catch (e) {
              console.warn('Failed to parse SSE data:', line, e);
            }
          }
        }
      }

    } catch (err) {
      console.error('=== ENHANCED CONTENT GENERATION ERROR ===');
      console.error('Error type:', typeof err);
      console.error('Error details:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      console.log('=== ENHANCED CONTENT GENERATION END ===');
      setIsGenerating(false);
    }
  }, []);

  const handleStreamEvent = useCallback((event: StreamEvent) => {
    console.log('Handling stream event:', event.type, event.data);
    
    switch (event.type) {
      case 'status':
        console.log('Status update:', event.data.message, 'Progress:', event.data.progress);
        setCurrentMessage(event.data.message);
        setOverallProgress(event.data.progress || 0);
        break;

      case 'content':
        console.log('Content update - length:', event.data.content?.length || 0);
        setFinalContent(event.data.content);
        break;

      case 'complete':
        console.log('Generation complete:', event.data.message);
        setFinalContent(event.data.content);
        setOverallProgress(100);
        setCurrentMessage(event.data.message);
        break;

      case 'error':
        console.error('Stream error:', event.data.error);
        setError(event.data.error);
        break;

      default:
        console.warn('Unknown event type:', event.type);
    }
  }, []);

  const reset = useCallback(() => {
    console.log('Resetting enhanced content generation state');
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
