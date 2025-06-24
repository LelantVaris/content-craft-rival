
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BlogWriterWizard from "@/components/BlogWriterWizard";

const ArticleForm = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Article</h1>
        <p className="text-gray-600">Use our AI-powered workflow to create SEO-optimized content</p>
      </div>
      
      <BlogWriterWizard />
    </div>
  );
};

export default ArticleForm;
