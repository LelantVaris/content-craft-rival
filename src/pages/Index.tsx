
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, FileText, Zap, Target } from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-semibold text-foreground">metakit.ai</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">Home</Link>
            <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">Dashboard</Link>
            <Link to="/article/new" className="text-foreground hover:text-primary transition-colors">Create Article</Link>
          </nav>
          <Link to="/dashboard">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            AI-Powered Content Creation for{" "}
            <span className="gradient-primary bg-clip-text text-transparent">
              Modern Teams
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Generate high-quality blog articles, optimize for SEO, and streamline your content workflow with intelligent automation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/article/new">
              <Button size="lg" className="gap-2">
                Start Creating <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" size="lg">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Everything you need to create amazing content</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From AI-powered writing to SEO optimization, metakit.ai provides all the tools you need for professional content creation.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="card-elevated">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-foreground">AI Content Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Generate high-quality articles with AI that understands your brand voice and target audience.
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-success" />
              </div>
              <CardTitle className="text-foreground">SEO Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Built-in SEO guidelines and automatic optimization to help your content rank higher in search results.
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader>
              <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-info" />
              </div>
              <CardTitle className="text-foreground">Smart Research</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Automatic research of relevant questions and topics to ensure comprehensive content coverage.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-background border-t border-border">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to transform your content creation?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of content creators who are already using metakit.ai to produce better content faster.
          </p>
          <Link to="/article/new">
            <Button size="lg" className="gap-2">
              Start Your Free Trial <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface border-t border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">M</span>
              </div>
              <span className="text-foreground font-medium">metakit.ai</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2025 metakit.ai. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
