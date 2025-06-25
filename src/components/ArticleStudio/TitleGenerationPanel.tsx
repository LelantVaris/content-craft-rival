
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { 
  Sparkles, 
  RefreshCw, 
  Target,
  Settings,
  Lightbulb,
  Plus,
  X,
  Minus,
  Wand2
} from 'lucide-react';
import { ArticleStudioData } from '@/hooks/useArticleStudio';
import { useSEOConfiguration } from '@/hooks/useSEOConfiguration';
import { getRandomExampleTopic, getAllExampleTopics } from '@/utils/exampleTopics';
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
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [allExamples] = useState(getAllExampleTopics());
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
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

  const handleTopicChange = (topic: string) => {
    onUpdate({ topic });
  };

  const handleTryExample = () => {
    const example = allExamples[currentExampleIndex];
    onUpdate({ topic: example.topic });
    setCurrentExampleIndex((prev) => (prev + 1) % allExamples.length);
    toast.success(`Example from ${example.category} category`);
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
      {/* Main Topic Input */}
      <Card className="border-2 border-purple-100">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Write an article about...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="e.g., Best content marketing strategies for B2B SaaS companies in 2024"
              value={articleData.topic}
              onChange={(e) => handleTopicChange(e.target.value)}
              className="min-h-[100px] text-base resize-none"
            />
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTryExample}
                className="flex items-center gap-2"
              >
                <Lightbulb className="w-4 h-4" />
                Try Example Topics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO Pro Mode Toggle */}
      <Card className="border-2 border-blue-100">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              <CardTitle>SEO Pro Mode</CardTitle>
            </div>
            <Switch
              checked={seoProMode}
              onCheckedChange={setSeoProMode}
            />
          </div>
        </CardHeader>
        
        <Collapsible open={seoProMode}>
          <CollapsibleContent>
            <CardContent className="space-y-6 pt-0">
              {/* Target Audience */}
              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience</Label>
                <div className="flex gap-2">
                  <Textarea
                    id="audience"
                    placeholder="e.g., Marketing professionals and business owners looking to improve their content strategy"
                    value={articleData.audience}
                    onChange={(e) => handleAudienceChange(e.target.value)}
                    rows={2}
                    className="resize-none flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateAudience}
                    disabled={isGeneratingAudience || !articleData.topic.trim()}
                    className="flex items-center gap-2 shrink-0"
                  >
                    {isGeneratingAudience ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4" />
                    )}
                    AI Generate
                  </Button>
                </div>
              </div>

              {/* Keywords */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Target Keywords</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateKeywords}
                    disabled={isGeneratingKeywords || !articleData.topic.trim()}
                    className="flex items-center gap-2"
                  >
                    {isGeneratingKeywords ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4" />
                    )}
                    AI Generate
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add keyword..."
                    value={currentKeyword}
                    onChange={(e) => setCurrentKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleKeywordAdd()}
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
                  <div className="flex flex-wrap gap-2 mt-2">
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

              {/* Tone Selection */}
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select
                  value={seoPreferences.defaultTone}
                  onValueChange={(value) => handleSEOPreferenceUpdate({ defaultTone: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="conversational">Conversational</SelectItem>
                    <SelectItem value="authoritative">Authoritative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Article Length */}
              <div className="space-y-2">
                <Label>Target Article Length</Label>
                <Select
                  value={seoPreferences.preferredArticleLength.toString()}
                  onValueChange={(value) => handleSEOPreferenceUpdate({ preferredArticleLength: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1000">1,000 words</SelectItem>
                    <SelectItem value="1500">1,500 words</SelectItem>
                    <SelectItem value="2500">2,500 words</SelectItem>
                    <SelectItem value="4000">4,000+ words</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Title Generation */}
      {articleData.topic && (
        <Card className="border-2 border-green-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-600" />
              Generate Titles
            </CardTitle>
            <CardDescription>
              Create engaging titles optimized for your content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title Count Selector */}
            <div className="flex items-center justify-between">
              <Label>Number of titles to generate:</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTitleCount(Math.max(3, titleCount - 1))}
                  disabled={titleCount <= 3}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-medium">{titleCount}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTitleCount(Math.min(10, titleCount + 1))}
                  disabled={titleCount >= 10}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateTitles}
              disabled={isGenerating || !articleData.topic.trim()}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating Titles...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate {titleCount} Titles
                </>
              )}
            </Button>

            {/* Generated Titles */}
            {generatedTitles.length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <Label className="text-base font-semibold">Select a title:</Label>
                <div className="grid gap-3">
                  {generatedTitles.map((title, index) => (
                    <Card
                      key={index}
                      className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                        articleData.selectedTitle === title
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                      onClick={() => handleTitleSelect(title)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 flex-1 leading-relaxed">{title}</p>
                          {articleData.selectedTitle === title && (
                            <Badge className="bg-green-600 ml-3">Selected</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Selection Summary */}
      {articleData.selectedTitle && (
        <Card className="border-2 border-green-100 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-green-600">Selected Title</Badge>
            </div>
            <p className="text-green-900 font-medium leading-relaxed">
              {articleData.selectedTitle}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
