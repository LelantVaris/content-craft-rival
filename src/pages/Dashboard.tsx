
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
      color: "text-primary"
    },
    {
      title: "Avg. Page Views",
      value: "8,432",
      change: "+24%",
      trend: "up",
      icon: Eye,
      color: "text-success"
    },
    {
      title: "Click Rate",
      value: "3.2%",
      change: "-0.8%",
      trend: "down",
      icon: MousePointer,
      color: "text-warning"
    },
    {
      title: "SEO Score",
      value: "87",
      change: "+5%",
      trend: "up",
      icon: Target,
      color: "text-info"
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
    <div className="p-6 space-y-6 bg-surface min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your content performance overview.</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline" className="border-border hover:bg-accent">
            <Link to="/calendar">
              <Calendar className="w-4 h-4 mr-2" />
              View Calendar
            </Link>
          </Button>
          <Button asChild className="gradient-primary text-white hover:opacity-90 transition-opacity">
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
          <Card key={index} className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center text-xs mt-1">
                {stat.trend === "up" ? (
                  <TrendingUp className="w-3 h-3 text-success mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-destructive mr-1" />
                )}
                <span className={stat.trend === "up" ? "text-success" : "text-destructive"}>
                  {stat.change}
                </span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Articles */}
        <Card className="lg:col-span-2 card-elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Recent Articles</CardTitle>
                <CardDescription>Your latest content performance</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-primary hover:bg-accent">
                <Link to="/articles">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentArticles.map((article, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium line-clamp-1 text-foreground">{article.title}</h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <Badge 
                        variant={article.status === "Published" ? "default" : article.status === "Draft" ? "secondary" : "outline"}
                        className={
                          article.status === "Published" 
                            ? "bg-success/10 text-success border-success/20" 
                            : article.status === "Scheduled"
                            ? "bg-info/10 text-info border-info/20"
                            : ""
                        }
                      >
                        {article.status}
                      </Badge>
                      <span>{article.views} views</span>
                      <span>SEO: {article.seoScore}/100</span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {article.publishedAt}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Clock className="w-5 h-5" />
              Upcoming Tasks
            </CardTitle>
            <CardDescription>Your content workflow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTasks.map((task, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{task.task}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{task.deadline}</span>
                      <Badge 
                        variant={
                          task.priority === "High" ? "destructive" : 
                          task.priority === "Medium" ? "default" : "secondary"
                        }
                        className={
                          task.priority === "High" 
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : task.priority === "Medium"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : ""
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
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-foreground">SEO Performance Trend</CardTitle>
          <CardDescription>Your content optimization progress over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Overall SEO Health</span>
              <span className="text-sm text-muted-foreground">87/100</span>
            </div>
            <Progress value={87} className="h-3" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-6 bg-success/5 border border-success/20 rounded-lg">
                <div className="text-2xl font-bold text-success">42</div>
                <div className="text-sm text-success/80">High-performing articles</div>
              </div>
              <div className="text-center p-6 bg-warning/5 border border-warning/20 rounded-lg">
                <div className="text-2xl font-bold text-warning">28</div>
                <div className="text-sm text-warning/80">Need optimization</div>
              </div>
              <div className="text-center p-6 bg-info/5 border border-info/20 rounded-lg">
                <div className="text-2xl font-bold text-info">156</div>
                <div className="text-sm text-info/80">Keywords tracked</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
