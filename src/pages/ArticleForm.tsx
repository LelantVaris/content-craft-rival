
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedArticleWizard } from "@/components/ArticleWizard";
import { PenTool, Sparkles, Target } from "lucide-react";

const ArticleForm = () => {
  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          Create Your Next Article
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Transform your ideas into engaging, SEO-optimized content with our AI-powered writing assistant
        </p>
        
        <div className="flex justify-center gap-8 mt-6">
          <div className="flex items-center gap-2 text-purple-600">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium">AI-Powered</span>
          </div>
          <div className="flex items-center gap-2 text-blue-600">
            <Target className="w-5 h-5" />
            <span className="text-sm font-medium">SEO Optimized</span>
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <PenTool className="w-5 h-5" />
            <span className="text-sm font-medium">Ready to Edit</span>
          </div>
        </div>
      </div>
      
      <EnhancedArticleWizard />
    </div>
  );
};

export default ArticleForm;
