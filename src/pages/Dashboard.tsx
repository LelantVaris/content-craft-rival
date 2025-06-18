
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  MousePointer, 
  FileText, 
  Calendar,
  ArrowRight,
  Target,
  Clock,
  CheckCircle2
} from "lucide-react"
import { Link } from "react-router-dom"

const Dashboard = () => {
  const stats = [
    {
      title: "Total Articles",
      value: "124",
      change: "+12%",
      trend: "up",
      icon: FileText,
      color: "text-blue-600"
    },
    {
      title: "Avg. Page Views",
      value: "8,432",
      change: "+24%",
      trend: "up",
      icon: Eye,
      color: "text-green-600"
    },
    {
      title: "Click Rate",
      value: "3.2%",
      change: "-0.8%",
      trend: "down",
      icon: MousePointer,
      color: "text-orange-600"
    },
    {
      title: "SEO Score",
      value: "87",
      change: "+5%",
      trend: "up",
      icon: Target,
      color: "text-purple-600"
    }
  ]

  const recentArticles = [
    {
      title: "10 Best Practices for Content Marketing in 2024",
      status: "Published",
      views: "2,341",
      seoScore: 92,
      publishedAt: "2 hours ago"
    },
    {
      title: "How to Optimize Your Blog for Voice Search",
      status: "Draft",
      views: "0",
      seoScore: 78,
      publishedAt: "Draft"
    },
    {
      title: "The Future of AI in Content Creation",
      status: "Scheduled",
      views: "0",
      seoScore: 85,
      publishedAt: "Tomorrow 9:00 AM"
    }
  ]

  const upcomingTasks = [
    { task: "Review competitor analysis", deadline: "Today", priority: "High" },
    { task: "Optimize article for 'content marketing'", deadline: "Tomorrow", priority: "Medium" },
    { task: "Schedule social media posts", deadline: "Dec 20", priority: "Low" }
  ]

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-600 mt-1">Welcome back! Here's your content performance overview.</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link to="/calendar">
              <Calendar className="w-4 h-4 mr-2" />
              View Calendar
            </Link>
          </Button>
          <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            <Link to="/article/new">
              <FileText className="w-4 h-4 mr-2" />
              New Article
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-200 border-0 bg-white/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs">
                {stat.trend === "up" ? (
                  <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-600 mr-1" />
                )}
                <span className={stat.trend === "up" ? "text-green-600" : "text-red-600"}>
                  {stat.change}
                </span>
                <span className="text-slate-500 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Articles */}
        <Card className="lg:col-span-2 border-0 bg-white/80 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Articles</CardTitle>
                <CardDescription>Your latest content performance</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/articles">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentArticles.map((article, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium line-clamp-1">{article.title}</h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <Badge 
                        variant={article.status === "Published" ? "default" : article.status === "Draft" ? "secondary" : "outline"}
                        className={article.status === "Published" ? "bg-green-100 text-green-700" : ""}
                      >
                        {article.status}
                      </Badge>
                      <span>{article.views} views</span>
                      <span>SEO: {article.seoScore}/100</span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    {article.publishedAt}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="border-0 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Upcoming Tasks
            </CardTitle>
            <CardDescription>Your content workflow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTasks.map((task, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{task.task}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">{task.deadline}</span>
                      <Badge 
                        size="sm" 
                        variant={
                          task.priority === "High" ? "destructive" : 
                          task.priority === "Medium" ? "default" : "secondary"
                        }
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEO Performance Chart */}
      <Card className="border-0 bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle>SEO Performance Trend</CardTitle>
          <CardDescription>Your content optimization progress over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall SEO Health</span>
              <span className="text-sm text-slate-500">87/100</span>
            </div>
            <Progress value={87} className="h-2" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                <div className="text-2xl font-bold text-green-700">42</div>
                <div className="text-sm text-green-600">High-performing articles</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg">
                <div className="text-2xl font-bold text-yellow-700">28</div>
                <div className="text-sm text-yellow-600">Need optimization</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                <div className="text-2xl font-bold text-purple-700">156</div>
                <div className="text-sm text-purple-600">Keywords tracked</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
