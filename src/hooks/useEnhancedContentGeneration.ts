
import { useState, useCallback } from 'react';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

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
    console.log('=== AI SDK ENHANCED CONTENT GENERATION START ===');
    console.log('Title:', title);
    console.log('Outline sections:', outline.length);
    console.log('Keywords:', keywords);
    console.log('Audience:', audience);
    console.log('Tone:', tone);

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
    
    console.log('Initialized sections:', initialSections);
    setSections(initialSections);

    try {
      setCurrentMessage('🎯 Starting AI SDK enhanced content generation...');
      setOverallProgress(10);

      // Build enhanced prompt with all context
      const outlineText = outline.map((section: any, index: number) => 
        `${index + 1}. ${section.title}\n   - ${section.content}`
      ).join('\n');

      const keywordText = keywords.length > 0 ? `\nTarget keywords to include naturally: ${keywords.join(', ')}` : '';
      
      const enhancedPrompt = `Create a comprehensive, well-researched article with the following specifications:

Title: ${title}

Outline:
${outlineText}

Writing Requirements:
- Audience: ${audience}
- Tone: ${tone}
- Write in a ${tone} tone that resonates with ${audience}
- Include current insights, examples, and actionable advice
- Use proper markdown formatting (headers, lists, bold, italic)
- Make each section substantial and informative
- Ensure smooth transitions between sections${keywordText}

Please write a complete, engaging article that follows the outline structure and provides real value to the reader.`;

      console.log('Starting AI SDK streamText with prompt length:', enhancedPrompt.length);

      // Use AI SDK streamText for generation
      const { textStream, finishReason, usage } = await streamText({
        model: openai('gpt-4o'),
        prompt: enhancedPrompt,
        temperature: 0.7,
        maxTokens: 4000,
      });

      let accumulatedContent = '';
      let currentSectionIndex = 0;
      
      setCurrentMessage('✨ Generating enhanced content with AI SDK...');
      setOverallProgress(20);

      // Process the stream
      for await (const delta of textStream) {
        accumulatedContent += delta;
        setFinalContent(accumulatedContent);
        
        // Update progress based on content length
        const estimatedProgress = Math.min(90, 20 + (accumulatedContent.length / 3000) * 70);
        setOverallProgress(estimatedProgress);
        
        // Update current message with progress
        if (accumulatedContent.length > 0) {
          setCurrentMessage(`📝 Writing article... (${Math.round(estimatedProgress)}% complete)`);
        }

        // Simulate section progress for UI feedback
        const currentWordCount = accumulatedContent.split(' ').length;
        const expectedWordsPerSection = 500;
        const completedSections = Math.floor(currentWordCount / expectedWordsPerSection);
        
        if (completedSections > currentSectionIndex && currentSectionIndex < sections.length) {
          setSections(prev => prev.map((section, index) => {
            if (index <= completedSections && index < outline.length) {
              return { ...section, status: 'complete', progress: 100 };
            } else if (index === completedSections + 1) {
              return { ...section, status: 'writing', progress: 50 };
            }
            return section;
          }));
          currentSectionIndex = completedSections;
        }
      }

      // Mark all sections as complete
      setSections(prev => prev.map(section => ({ 
        ...section, 
        status: 'complete', 
        progress: 100,
        content: accumulatedContent 
      })));

      setOverallProgress(100);
      setCurrentMessage('🎉 Enhanced article generation complete!');
      
      console.log('AI SDK generation completed:', {
        contentLength: accumulatedContent.length,
        finishReason,
        usage
      });

    } catch (err) {
      console.error('=== AI SDK ENHANCED CONTENT GENERATION ERROR ===');
      console.error('Error type:', typeof err);
      console.error('Error details:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`AI SDK Error: ${errorMessage}`);
      setCurrentMessage(`❌ Generation failed: ${errorMessage}`);
    } finally {
      console.log('=== AI SDK ENHANCED CONTENT GENERATION END ===');
      setIsGenerating(false);
    }
  }, []);

  const reset = useCallback(() => {
    console.log('Resetting AI SDK enhanced content generation state');
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
