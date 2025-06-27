import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArticles } from '@/hooks/useArticles';
import { toast } from 'sonner';

export interface ArticleStudioData {
  topic: string;
  keywords: string[];
  audience: string;
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
    audience: '',
    selectedTitle: '',
    customTitle: '',
    outline: [],
    generatedContent: '',
    seoNotes: '',
    currentStep: 1
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingStatus, setStreamingStatus] = useState<any>(null);
  
  const navigate = useNavigate();
  const { saveArticle, refreshArticles } = useArticles();

  const updateArticleData = useCallback((updates: Partial<ArticleStudioData>) => {
    setArticleData(prev => ({ ...prev, ...updates }));
  }, []);

  // Keep existing step navigation for backward compatibility
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
        return articleData.generatedContent.length > 0;
      default:
        return false;
    }
  }, [articleData]);

  // Enhanced auto-save functionality
  const autoSave = useCallback(async () => {
    const finalTitle = articleData.customTitle || articleData.selectedTitle;
    const finalContent = streamingContent || articleData.generatedContent;
    
    if (!finalTitle || finalTitle === 'Untitled Article' || !finalContent) {
      return; // Don't auto-save empty articles
    }
    
    try {
      // Implement auto-save logic here
      console.log('Auto-saving article...', { title: finalTitle, contentLength: finalContent.length });
    } catch (error) {
      console.error('Auto-save failed:', error);
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
      setIsGenerating(true);
      const savedArticle = await saveArticle({
        title: finalTitle,
        content: finalContent,
        status: 'draft',
        content_type: 'blog-post',
        tone: 'professional',
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
      setIsGenerating(false);
    }
  }, [articleData, streamingContent, saveArticle, refreshArticles, navigate]);

  // New unified generation function with streaming status
  const generateFullArticle = useCallback(async () => {
    if (!articleData.topic) {
      console.error('Please enter a topic first');
      return;
    }

    try {
      setIsGenerating(true);
      setStreamingContent('');
      setStreamingStatus(null);

      // This would implement the enhanced article generation pipeline
      console.info('Enhanced article generation will be handled by the UnifiedControlPanel');
      
    } catch (error) {
      console.error('Error generating article:', error);
      console.error('Failed to generate article. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [articleData.topic]);

  return {
    articleData,
    updateArticleData,
    nextStep,
    prevStep,
    canProceed,
    saveAndComplete,
    generateFullArticle,
    autoSave,
    isGenerating,
    streamingContent,
    streamingStatus,
    setStreamingContent,
    setIsGenerating,
    setStreamingStatus
  };
}
