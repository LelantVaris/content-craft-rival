
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shuffle, Plus, X, Sparkles, Loader2, HelpCircle } from 'lucide-react';
import { ArticleStudioData } from '@/hooks/useArticleStudio';
import { getRandomExampleTopic } from '@/utils/exampleTopics';
import { supabase } from '@/integrations/supabase/client';

interface ContentBriefFormProps {
  articleData: ArticleStudioData;
  onUpdate: (updates: Partial<ArticleStudioData>) => void;
  seoProMode: boolean;
  onSeoProModeChange: (enabled: boolean) => void;
}

export const ContentBriefForm: React.FC<ContentBriefFormProps> = ({
  articleData,
  onUpdate,
  seoProMode,
  onSeoProModeChange
}) => {
  const [currentKeyword, setCurrentKeyword] = React.useState('');
  const [isGeneratingKeywords, setIsGeneratingKeywords] = React.useState(false);

  const handleTryExample = () => {
    const { topic } = getRandomExampleTopic();
    
    // Generate comprehensive example data for all fields
    const exampleKeywords = [
      'content marketing strategy',
      'digital marketing ROI',
      'social media engagement',
      'SEO optimization'
    ];
    
    const exampleAudience = 'Marketing professionals and business owners looking to grow their online presence through effective digital strategies';
    const exampleBrand = 'A modern digital marketing agency that specializes in data-driven growth strategies and helps businesses scale through innovative online channels';
    const exampleProduct = 'Comprehensive digital marketing services including SEO optimization, content marketing, social media management, and conversion rate optimization';
    
    // Update all fields with comprehensive example data
    onUpdate({ 
      topic,
      keywords: exampleKeywords,
      primaryKeyword: 'content marketing strategy',
      searchIntent: 'informational',
      audience: exampleAudience,
      tone: 'professional',
      length: 'medium',
      pointOfView: 'second',
      brand: exampleBrand,
      product: exampleProduct,
      customWordCount: undefined
    });
  };

  const handleKeywordAdd = () => {
    if (currentKeyword.trim() && !articleData.keywords.includes(currentKeyword.trim())) {
      const newKeywords = [...articleData.keywords, currentKeyword.trim()];
      onUpdate({ keywords: newKeywords });
      setCurrentKeyword('');
    }
  };

  const handleKeywordRemove = (keywordToRemove: string) => {
    const newKeywords = articleData.keywords.filter(k => k !== keywordToRemove);
    onUpdate({ keywords: newKeywords });
  };

  const handleGenerateKeywords = async () => {
    if (!articleData.topic || isGeneratingKeywords) return;

    console.log('Starting keyword generation with:', {
      topic: articleData.topic,
      audience: articleData.audience
    });

    setIsGeneratingKeywords(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-keywords', {
        body: {
          topic: articleData.topic,
          audience: articleData.audience,
          tone: articleData.tone,
          brand: articleData.brand,
          product: articleData.product
        }
      });

      console.log('Keyword generation response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.keywords && Array.isArray(data.keywords)) {
        console.log('Generated keywords:', data.keywords);
        onUpdate({ keywords: [...articleData.keywords, ...data.keywords] });
      } else {
        throw new Error('Invalid response format from keyword generation');
      }
    } catch (error) {
      console.error('Error generating keywords:', error);
    } finally {
      setIsGeneratingKeywords(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Content Brief Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-[rgb(16,24,40)]">
              Write an article about...
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTryExample}
              className="flex items-center gap-2 px-3 py-1"
            >
              <Shuffle className="w-4 h-4" />
              Try example
            </Button>
          </div>
          <Textarea
            placeholder="a how-to guide on writing convincingly"
            value={articleData.topic}
            onChange={(e) => onUpdate({ topic: e.target.value })}
            rows={5}
            className="resize-none text-base"
          />
        </div>

        {/* Keywords Section - Always Visible */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-[rgb(16,24,40)]">
              Keywords
            </label>
            <Button
              variant="outline"
              onClick={handleGenerateKeywords}
              disabled={!articleData.topic || isGeneratingKeywords}
              className="flex items-center gap-2"
            >
              {isGeneratingKeywords ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              AI Generate
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="best writing tools"
              value={currentKeyword}
              onChange={(e) => setCurrentKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleKeywordAdd()}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleKeywordAdd}
              disabled={!currentKeyword.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {articleData.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {articleData.keywords.map((keyword, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {keyword}
                  <button
                    onClick={() => handleKeywordRemove(keyword)}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Primary Keyword Section */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[rgb(16,24,40)]">
            Primary Keyword
          </label>
          <Input
            placeholder="content marketing strategy"
            value={articleData.primaryKeyword}
            onChange={(e) => onUpdate({ primaryKeyword: e.target.value })}
            className="text-base"
          />
          <p className="text-xs text-gray-500">
            Leave empty to use the first keyword in your list
          </p>
        </div>

        {/* Search Intent Section */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[rgb(16,24,40)]">
            Search Intent
          </label>
          <Select 
            value={articleData.searchIntent} 
            onValueChange={(value: any) => onUpdate({ searchIntent: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto-detect</SelectItem>
              <SelectItem value="informational">Informational</SelectItem>
              <SelectItem value="transactional">Transactional</SelectItem>
              <SelectItem value="navigational">Navigational</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tone & Length Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[rgb(16,24,40)]">
              Tone
            </label>
            <Select 
              value={articleData.tone} 
              onValueChange={(value) => onUpdate({ tone: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[rgb(16,24,40)]">
              Target Length
            </label>
            <Select 
              value={articleData.length} 
              onValueChange={(value) => onUpdate({ length: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short (~2,000 words)</SelectItem>
                <SelectItem value="medium">Medium (~4,000 words)</SelectItem>
                <SelectItem value="long">Long (~6,000 words)</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            
            {articleData.length === 'custom' && (
              <div className="mt-2">
                <Input
                  type="number"
                  placeholder="Enter word count"
                  value={articleData.customWordCount || ''}
                  onChange={(e) => onUpdate({ 
                    customWordCount: parseInt(e.target.value) || undefined 
                  })}
                  min="500"
                  max="15000"
                />
              </div>
            )}
          </div>
        </div>

        {/* SEO Pro Mode Toggle with Tooltip */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-[rgb(16,24,40)]">
              ⚡ SEO pro mode
            </label>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  SEO Pro Mode enables advanced customizations like target audience, 
                  brand description, and product details to create more personalized 
                  and SEO-optimized content.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Switch
            checked={seoProMode}
            onCheckedChange={onSeoProModeChange}
          />
        </div>

        {/* Advanced Customizations */}
        {seoProMode && (
          <Accordion type="single" collapsible>
            <AccordionItem value="advanced">
              <AccordionTrigger className="text-sm font-semibold text-[rgb(60,39,180)]">
                Advanced customizations
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                {/* Point of view */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[rgb(52,64,84)]">
                    Point of view
                  </label>
                  <div className="flex gap-2">
                    <Button 
                      variant={articleData.pointOfView === 'first' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => onUpdate({ pointOfView: 'first' })}
                    >
                      First person
                    </Button>
                    <Button 
                      variant={articleData.pointOfView === 'second' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => onUpdate({ pointOfView: 'second' })}
                    >
                      Second person
                    </Button>
                    <Button 
                      variant={articleData.pointOfView === 'third' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => onUpdate({ pointOfView: 'third' })}
                    >
                      Third person
                    </Button>
                  </div>
                </div>

                {/* Audience */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[rgb(16,24,40)]">
                    Describe your audience
                  </label>
                  <Textarea
                    placeholder="Parents who want to make ice cream at home with their children"
                    value={articleData.audience}
                    onChange={(e) => onUpdate({ audience: e.target.value })}
                    rows={2}
                  />
                </div>

                {/* Brand */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[rgb(16,24,40)]">
                    Describe your brand
                  </label>
                  <Textarea
                    placeholder="EasyKitchen is an appliance company that makes easy to use kitchenware"
                    value={articleData.brand}
                    onChange={(e) => onUpdate({ brand: e.target.value })}
                    rows={2}
                  />
                </div>

                {/* Product/Service */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[rgb(16,24,40)]">
                    Describe your product or service
                  </label>
                  <Textarea
                    placeholder="Lightweight and fast freezing 1.5 quartz frozen yogurt, ice-cream and sorbet maker"
                    value={articleData.product}
                    onChange={(e) => onUpdate({ product: e.target.value })}
                    rows={2}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>
    </TooltipProvider>
  );
};
