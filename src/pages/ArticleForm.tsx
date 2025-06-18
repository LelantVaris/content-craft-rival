
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, X } from "lucide-react";
import { toast } from "sonner";

export default function ArticleForm() {
  const navigate = useNavigate();
  const [keywords, setKeywords] = useState<string[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState("");

  const addKeyword = () => {
    if (currentKeyword.trim() && !keywords.includes(currentKeyword.trim())) {
      setKeywords([...keywords, currentKeyword.trim()]);
      setCurrentKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Article briefing saved! Redirecting to editor...");
    setTimeout(() => {
      navigate("/article/editor");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/dashboard")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Create New Article</h1>
            <p className="text-muted-foreground">
              Provide the details below to generate your AI-powered article
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-foreground">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-foreground">Article Title</Label>
                  <Input 
                    id="title" 
                    placeholder="Enter your article title..."
                    className="bg-background text-foreground"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic" className="text-foreground">Main Topic</Label>
                  <Textarea 
                    id="topic"
                    placeholder="Describe the main topic and key points you want to cover..."
                    className="bg-background text-foreground min-h-[100px]"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="audience" className="text-foreground">Target Audience</Label>
                    <Select>
                      <SelectTrigger className="bg-background text-foreground">
                        <SelectValue placeholder="Select target audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginners">Beginners</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="general">General Public</SelectItem>
                        <SelectItem value="professionals">Professionals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tone" className="text-foreground">Writing Tone</Label>
                    <Select>
                      <SelectTrigger className="bg-background text-foreground">
                        <SelectValue placeholder="Select writing tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="authoritative">Authoritative</SelectItem>
                        <SelectItem value="conversational">Conversational</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-foreground">SEO & Keywords</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="keywords" className="text-foreground">Keywords</Label>
                  <div className="flex gap-2">
                    <Input
                      value={currentKeyword}
                      onChange={(e) => setCurrentKeyword(e.target.value)}
                      placeholder="Add a keyword..."
                      className="bg-background text-foreground"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    />
                    <Button type="button" onClick={addKeyword} size="icon" variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {keywords.map((keyword) => (
                        <Badge key={keyword} variant="secondary" className="gap-1">
                          {keyword}
                          <button
                            type="button"
                            onClick={() => removeKeyword(keyword)}
                            className="hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta-description" className="text-foreground">Meta Description</Label>
                  <Textarea 
                    id="meta-description"
                    placeholder="Write a compelling meta description (150-160 characters)..."
                    className="bg-background text-foreground"
                    maxLength={160}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="word-count" className="text-foreground">Target Word Count</Label>
                    <Select>
                      <SelectTrigger className="bg-background text-foreground">
                        <SelectValue placeholder="Select word count" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="500-800">500-800 words</SelectItem>
                        <SelectItem value="800-1200">800-1200 words</SelectItem>
                        <SelectItem value="1200-1800">1200-1800 words</SelectItem>
                        <SelectItem value="1800+">1800+ words</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-foreground">Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger className="bg-background text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-foreground">Additional Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="instructions" className="text-foreground">Special Instructions</Label>
                  <Textarea 
                    id="instructions"
                    placeholder="Any specific requirements, style guidelines, or additional context..."
                    className="bg-background text-foreground min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </Button>
              <Button type="submit" className="gap-2">
                Generate Article
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
