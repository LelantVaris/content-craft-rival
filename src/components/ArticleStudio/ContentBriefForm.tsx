
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Shuffle, Plus, X } from 'lucide-react';
import { ArticleStudioData } from '@/hooks/useArticleStudio';
import { getRandomExampleTopic } from '@/utils/exampleTopics';

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

  const handleTryExample = () => {
    const { topic } = getRandomExampleTopic();
    onUpdate({ topic });
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

  return (
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

      {/* SEO Pro Mode Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-[rgb(16,24,40)]">
          ⚡ SEO pro mode
        </label>
        <Switch
          checked={seoProMode}
          onCheckedChange={onSeoProModeChange}
        />
      </div>

      {/* Keywords Section (Collapsible) */}
      {seoProMode && (
        <div className="bg-white rounded-xl border border-[rgb(208,213,221)] p-4 space-y-4">
          <label className="text-sm font-semibold text-[rgb(16,24,40)]">
            Keywords
          </label>
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
      )}

      {/* Tone & Length Section */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[rgb(16,24,40)]">
            Tone
          </label>
          <Select defaultValue="professional">
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
            Length
          </label>
          <Select defaultValue="medium">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short (~800 words)</SelectItem>
              <SelectItem value="medium">Medium (~1,500 words)</SelectItem>
              <SelectItem value="long">Long (~2,500 words)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Advanced Customizations */}
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
                <Button variant="outline" size="sm">First person</Button>
                <Button variant="outline" size="sm">Second person</Button>
                <Button variant="outline" size="sm">Third person</Button>
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
                rows={2}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
