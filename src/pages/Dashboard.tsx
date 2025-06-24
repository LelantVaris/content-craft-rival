
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BlogWriterWizard } from "@/components/BlogWriterWizard";
import { useProfile } from "@/hooks/useProfile";
import { 
  PenTool, 
  FileText, 
  Globe, 
  ImageIcon, 
  Zap, 
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { profile } = useProfile();

  const standaloneTools = [
    {
      title: "LLM.txt Generator",
      description: "Generate SEO-optimized llm.txt files",
      icon: FileText,
      cost: "1 credit per page",
      href: "/tools/llm-txt"
    },
    {
      title: "Alt-Text Batch",
      description: "Bulk generate alt-text for images",
      icon: ImageIcon,
      cost: "1 credit per image",
      href: "/tools/alt-text"
    },
    {
      title: "Meta-Info Generator", 
      description: "Create titles, descriptions, and schema markup",
      icon: Globe,
      cost: "1 credit per page",
      href: "/tools/meta-info"
    }
  ];

  const recentStats = [
    { label: "Articles Created", value: "0", icon: PenTool },
    { label: "Words Generated", value: "0", icon: FileText },
    { label: "SEO Score Avg", value: "-", icon: TrendingUp },
    { label: "Active Workflows", value: "0", icon: Clock }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Welcome to Metakit.ai
          </h1>
          <p className="text-gray-600 mt-2">
            AI-powered content suite for SEO teams
          </p>
          {profile && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-500">Plan:</span>
              <span className="font-medium capitalize">{profile.plan_type}</span>
              {profile.is_lifetime && <Zap className="w-4 h-4 text-amber-500" />}
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {recentStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <Icon className="w-8 h-8 text-purple-600 opacity-60" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Blog Writer Workflow */}
      <BlogWriterWizard />

      {/* Standalone Tools */}
      <Card>
        <CardHeader>
          <CardTitle>Standalone Tools</CardTitle>
          <CardDescription>
            Individual SEO tools that consume credits from your monthly allowance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {standaloneTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card key={tool.title} className="border border-gray-200 hover:border-purple-300 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{tool.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{tool.description}</p>
                        <p className="text-xs text-amber-600 font-medium">{tool.cost}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3"
                      disabled
                    >
                      Coming Soon
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm mt-1">Start creating content to see your activity here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>
              Get started with content creation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
              <Link to="/article/new">
                <PenTool className="w-4 h-4 mr-2" />
                Start Blog Writer Workflow
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/calendar">
                <Clock className="w-4 h-4 mr-2" />
                View Content Calendar
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
