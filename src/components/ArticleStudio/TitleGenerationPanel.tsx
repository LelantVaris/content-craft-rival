
import React, { useState, useEffect } from 'react';
import { ArticleStudioData } from '@/hooks/useArticleStudio';
import { useSEOConfiguration } from '@/hooks/useSEOConfiguration';
import { TopicInput } from './TopicInput';
import { SEOProMode } from './SEOProMode';
import { TitleSelector } from './TitleSelector';
import { TitleSummary } from './TitleSummary';
import { toast } from 'sonner';

interface TitleGenerationPanelProps {
  articleData: ArticleStudioData;
  onUpdate: (updates: Partial<ArticleStudioData>) => void;
}

export const TitleGenerationPanel: React.FC<TitleGenerationPanelProps> = ({
  articleData,
  onUpdate
}) => {
  const [seoProMode, setSeoProMode] = useState(false);
  const [titleCount, setTitleCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [isGeneratingAudience, setIsGeneratingAudience] = useState(false);
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
  
  const {
    seoPreferences,
    updateSEOPreferences,
    saveSEOPreferences,
    generateAudience,
    generateKeywords,
    isLoaded
  } = useSEOConfiguration();

  // Load SEO preferences into form when available
  useEffect(() => {
    if (isLoaded && seoPreferences) {
      onUpdate({
        audience: seoPreferences.defaultAudience,
        keywords: seoPreferences.defaultKeywords
      });
    }
  }, [isLoaded, seoPreferences, onUpdate]);

  const handleSEOPreferenceUpdate = async (updates: any) => {
    updateSEOPreferences(updates);
    await saveSEOPreferences(updates);
  };

  const handleAudienceChange = (audience: string) => {
    onUpdate({ audience });
    if (seoProMode) {
      handleSEOPreferenceUpdate({ defaultAudience: audience });
    }
  };

  const handleKeywordsChange = (keywords: string[]) => {
    onUpdate({ keywords });
  };

  const handleGenerateAudience = async () => {
    if (!articleData.topic.trim()) {
      toast.error('Please enter a topic first');
      return;
    }

    try {
      setIsGeneratingAudience(true);
      const audience = await generateAudience(articleData.topic);
      onUpdate({ audience });
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsGeneratingAudience(false);
    }
  };

  const handleGenerateKeywords = async () => {
    if (!articleData.topic.trim()) {
      toast.error('Please enter a topic first');
      return;
    }

    try {
      setIsGeneratingKeywords(true);
      const keywords = await generateKeywords(articleData.topic, articleData.audience);
      onUpdate({ keywords });
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsGeneratingKeywords(false);
    }
  };

  const handleGenerateTitles = async () => {
    if (!articleData.topic.trim()) {
      toast.error('Please enter a topic first');
      return;
    }

    setIsGenerating(true);
    try {
      // Mock title generation for now - will be enhanced with actual API
      const mockTitles = [
        `The Ultimate Guide to ${articleData.topic}`,
        `How to Master ${articleData.topic} in 2024`,
        `${articleData.topic}: Expert Strategies That Actually Work`,
        `Transform Your Business with ${articleData.topic}`,
        `The Complete ${articleData.topic} Playbook for Success`
      ];
      
      setTimeout(() => {
        setGeneratedTitles(mockTitles.slice(0, titleCount));
        setIsGenerating(false);
        toast.success(`Generated ${titleCount} titles`);
      }, 1500);
    } catch (error) {
      console.error('Error generating titles:', error);
      setIsGenerating(false);
      toast.error('Failed to generate titles');
    }
  };

  const handleTitleSelect = (title: string) => {
    onUpdate({ selectedTitle: title, customTitle: '' });
    toast.success('Title selected');
  };

  return (
    <div className="space-y-6">
      <TopicInput
        topic={articleData.topic}
        onTopicChange={(topic) => onUpdate({ topic })}
      />

      <SEOProMode
        seoProMode={seoProMode}
        onSeoProModeChange={setSeoProMode}
        audience={articleData.audience}
        keywords={articleData.keywords}
        seoPreferences={seoPreferences}
        onAudienceChange={handleAudienceChange}
        onKeywordsChange={handleKeywordsChange}
        onSEOPreferenceUpdate={handleSEOPreferenceUpdate}
        onGenerateAudience={handleGenerateAudience}
        onGenerateKeywords={handleGenerateKeywords}
        isGeneratingAudience={isGeneratingAudience}
        isGeneratingKeywords={isGeneratingKeywords}
        hasTopic={!!articleData.topic.trim()}
      />

      <TitleSelector
        hasTopic={!!articleData.topic.trim()}
        titleCount={titleCount}
        onTitleCountChange={setTitleCount}
        onGenerateTitles={handleGenerateTitles}
        isGenerating={isGenerating}
        generatedTitles={generatedTitles}
        selectedTitle={articleData.selectedTitle}
        onTitleSelect={handleTitleSelect}
      />

      <TitleSummary selectedTitle={articleData.selectedTitle} />
    </div>
  );
};
