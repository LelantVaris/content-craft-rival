import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArticles } from '@/hooks/useArticles';
import { useEnhancedContentGeneration } from '@/hooks/useEnhancedContentGeneration';
import { toast } from 'sonner';

export enum GenerationStep {
  IDLE = 'idle',
  GENERATING_TITLES = 'generating_titles',
  GENERATING_OUTLINE = 'generating_outline',
  GENERATING_ARTICLE = 'generating_article'
}

export interface ArticleStudioData {
  topic: string;
  keywords: string[];
  primaryKeyword: string;
  searchIntent: 'informational' | 'transactional' | 'navigational' | 'commercial' | 'auto';
  audience: string;
  tone: string;
  length: string;
  customWordCount?: number;
  pointOfView: string;
  brand: string;
  product: string;
  selectedTitle: string;
  customTitle?: string;
  outline: OutlineSection[];
  generatedContent: string;
  seoNotes: string;
  currentStep: number;
}

export interface OutlineSection {
  id: string;
  title: string;
  content: string;
  characterCount: number;
  expanded: boolean;
}

export function useArticleStudio() {
  const [articleData, setArticleData] = useState<ArticleStudioData>({
    topic: '',
    keywords: [],
    primaryKeyword: '',
    searchIntent: 'auto',
    audience: '',
    tone: 'professional',
    length: 'medium',
    customWordCount: undefined,
    pointOfView: 'second',
    brand: '',
    product: '',
    selectedTitle: '',
    customTitle: '',
    outline: [],
    generatedContent: '',
    seoNotes: '',
    currentStep: 1
  });

  const [generationStep, setGenerationStep] = useState<GenerationStep>(GenerationStep.IDLE);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingStatus, setStreamingStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  
  const navigate = useNavigate();
  const { saveArticle, refreshArticles } = useArticles();

  // Integrate enhanced content generation
  const enhancedGeneration = useEnhancedContentGeneration();

  // Sync enhanced generation content with main article state
  useEffect(() => {
    if (enhancedGeneration.finalContent && !enhancedGeneration.isGenerating) {
      console.log('Syncing enhanced generation final content to main state:', enhancedGeneration.finalContent.length, 'chars');
      setStreamingContent(enhancedGeneration.finalContent);
      updateArticleData({ generatedContent: enhancedGeneration.finalContent });
    }
  }, [enhancedGeneration.finalContent, enhancedGeneration.isGenerating]);

  // Sync enhanced generation status with streaming status
  useEffect(() => {
    if (enhancedGeneration.currentMessage) {
      setStreamingStatus(enhancedGeneration.currentMessage);
    }
  }, [enhancedGeneration.currentMessage]);

  // Sync enhanced generation error with main error state
  useEffect(() => {
    if (enhancedGeneration.error) {
      setError(enhancedGeneration.error);
    }
  }, [enhancedGeneration.error]);

  const updateArticleData = useCallback((updates: Partial<ArticleStudioData>) => {
    setArticleData(prev => ({ ...prev, ...updates }));
  }, []);

  // Helper to get primary keyword (use explicit or first from list)
  const getPrimaryKeyword = useCallback(() => {
    return articleData.primaryKeyword || articleData.keywords[0] || '';
  }, [articleData.primaryKeyword, articleData.keywords]);

  // Helper to get secondary keywords (all except primary)
  const getSecondaryKeywords = useCallback(() => {
    const primary = getPrimaryKeyword();
    return articleData.keywords.filter(k => k !== primary);
  }, [articleData.keywords, getPrimaryKeyword]);

  // Helper to get target word count
  const getTargetWordCount = useCallback(() => {
    if (articleData.length === 'custom') {
      return articleData.customWordCount || 4000;
    }
    
    const wordCountMap = {
      short: 2000,
      medium: 4000,
      long: 6000
    };
    
    return wordCountMap[articleData.length as keyof typeof wordCountMap] || 4000;
  }, [articleData.length, articleData.customWordCount]);

  // Form validation
  const isFormValid = useCallback(() => {
    return (
      articleData.topic.trim().length > 0 &&
      (articleData.keywords.length > 0 || articleData.primaryKeyword.trim().length > 0) &&
      articleData.audience.trim().length > 0
    );
  }, [articleData]);

  // Auto-progression logic
  useEffect(() => {
    const hasTitle = !!(articleData.selectedTitle || articleData.customTitle);
    const hasOutline = articleData.outline.length > 0;
    
    let newStep = 1;
    if (hasTitle && hasOutline) newStep = 3;
    else if (hasTitle) newStep = 2;
    
    if (newStep !== articleData.currentStep) {
      setArticleData(prev => ({ ...prev, currentStep: newStep }));
    }
  }, [articleData.selectedTitle, articleData.customTitle, articleData.outline.length]);

  const nextStep = useCallback(() => {
    setArticleData(prev => ({ 
      ...prev, 
      currentStep: Math.min(prev.currentStep + 1, 3) 
    }));
  }, []);

  const prevStep = useCallback(() => {
    setArticleData(prev => ({ 
      ...prev, 
      currentStep: Math.max(prev.currentStep - 1, 1) 
    }));
  }, []);

  const canProceed = useCallback(() => {
    switch (articleData.currentStep) {
      case 1:
        return !!(articleData.selectedTitle || articleData.customTitle);
      case 2:
        return articleData.outline.length > 0;
      case 3:
        return articleData.generatedContent.length > 0 || streamingContent.length > 0;
      default:
        return false;
    }
  }, [articleData, streamingContent]);

  const saveAndComplete = useCallback(async () => {
    const finalTitle = articleData.customTitle || articleData.selectedTitle;
    const finalContent = streamingContent || articleData.generatedContent || `# ${finalTitle}\n\nStart writing your article here...`;
    
    if (!finalTitle || finalTitle === 'Untitled Article') {
      toast.error('Please select or enter a title for your article');
      return;
    }
    
    try {
      setGenerationStep(GenerationStep.GENERATING_ARTICLE);
      const savedArticle = await saveArticle({
        title: finalTitle,
        content: finalContent,
        status: 'draft',
        content_type: 'blog-post',
        tone: articleData.tone,
        target_audience: articleData.audience || undefined,
        keywords: articleData.keywords.length > 0 ? articleData.keywords : undefined,
      });

      toast.success('Article saved successfully!');
      await refreshArticles();
      navigate(`/article/${savedArticle.id}/edit`);
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('Failed to save article. Please try again.');
    } finally {
      setGenerationStep(GenerationStep.IDLE);
    }
  }, [articleData, streamingContent, saveArticle, refreshArticles, navigate]);

  const generateFullArticle = useCallback(async () => {
    console.info('Article generation will be handled by the streaming component');
  }, []);

  const autoSave = useCallback(async () => {
    const finalTitle = articleData.customTitle || articleData.selectedTitle;
    const finalContent = streamingContent || articleData.generatedContent;
    
    if (!finalTitle || finalTitle === 'Untitled Article' || !finalContent) {
      return;
    }
    
    try {
      console.log('Auto-saving article...', { title: finalTitle, contentLength: finalContent.length });
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [articleData, streamingContent]);

  return {
    articleData,
    updateArticleData,
    nextStep,
    prevStep,
    canProceed,
    saveAndComplete,
    generateFullArticle,
    autoSave,
    generationStep,
    streamingContent,
    streamingStatus,
    error,
    setStreamingContent,
    setGenerationStep,
    setStreamingStatus,
    setError,
    getPrimaryKeyword,
    getSecondaryKeywords,
    getTargetWordCount,
    isFormValid,
    generatedTitles,
    setGeneratedTitles,
    // Pass through enhanced generation state and methods
    enhancedGeneration
  };
}
