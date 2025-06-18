
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Eye, Sparkles, CheckCircle, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";

export default function ArticleEditor() {
  const navigate = useNavigate();
  const [seoScore] = useState(78);
  const [wordCount] = useState(1247);
  const [readabilityScore] = useState(85);

  const handleSave = () => {
    toast.success("Article saved successfully!");
  };

  const handlePublish = () => {
    toast.success("Article published successfully!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/dashboard")}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">The Ultimate Guide to AI Content Creation</h1>
                <p className="text-sm text-muted-foreground">Draft • Last saved 2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button onClick={handlePublish}>
                Publish
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI-Generated Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-foreground">Title</Label>
                  <Input 
                    id="title" 
                    value="The Ultimate Guide to AI Content Creation"
                    className="bg-background text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta-description" className="text-foreground">Meta Description</Label>
                  <Textarea 
                    id="meta-description"
                    value="Discover how AI is revolutionizing content creation. Learn best practices, tools, and strategies to enhance your content workflow with artificial intelligence."
                    className="bg-background text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content" className="text-foreground">Content</Label>
                  <Textarea 
                    id="content"
                    value={`# The Ultimate Guide to AI Content Creation

## Introduction

Artificial Intelligence has transformed the way we create content. From blog posts to social media updates, AI tools are helping content creators produce high-quality material faster than ever before.

## What is AI Content Creation?

AI content creation refers to the use of artificial intelligence technologies to generate, enhance, or optimize written content...

## Benefits of AI Content Creation

### 1. Increased Efficiency
AI can produce content at speeds impossible for human writers alone...

### 2. Consistency in Quality
With proper prompting and guidelines, AI maintains consistent tone and style...

### 3. SEO Optimization
Modern AI tools understand SEO best practices and can optimize content automatically...

## Best Practices for AI Content Creation

### Research and Planning
- Define your target audience clearly
- Gather relevant keywords and topics
- Create detailed content briefs

### Tool Selection
- Choose AI tools that fit your specific needs
- Consider integration capabilities
- Evaluate output quality and customization options

## Conclusion

AI content creation is not about replacing human creativity, but enhancing it. By leveraging AI tools effectively, content creators can focus on strategy and creativity while automating repetitive tasks.`}
                    className="bg-background text-foreground min-h-[600px] font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* SEO Score */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-foreground text-lg">SEO Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">SEO Score</span>
                    <span className="text-sm font-medium text-foreground">{seoScore}/100</span>
                  </div>
                  <Progress value={seoScore} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-foreground">Title optimized</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-foreground">Meta description included</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-warning" />
                    <span className="text-foreground">Add more internal links</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Info className="w-4 h-4 text-info" />
                    <span className="text-foreground">Consider adding images</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Stats */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-foreground text-lg">Content Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{wordCount.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Words</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{readabilityScore}</div>
                    <div className="text-sm text-muted-foreground">Readability</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Reading time</span>
                    <span className="text-foreground">~5 minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Paragraphs</span>
                    <span className="text-foreground">12</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Headings</span>
                    <span className="text-foreground">8</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Keywords */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-foreground text-lg">Target Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">AI content creation</Badge>
                  <Badge variant="secondary">artificial intelligence</Badge>
                  <Badge variant="secondary">content marketing</Badge>
                  <Badge variant="secondary">SEO optimization</Badge>
                  <Badge variant="secondary">content strategy</Badge>
                </div>
              </CardContent>
            </Card>

            {/* AI Actions */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-foreground text-lg">AI Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Improve SEO
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Add Images
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Summary
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create TLDR
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
