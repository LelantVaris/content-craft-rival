
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { 
  Target, 
  Users, 
  Search, 
  TrendingUp, 
  Eye, 
  Clock,
  ArrowRight,
  Plus,
  X,
  Lightbulb,
  CheckCircle2
} from "lucide-react"
import { useNavigate } from "react-router-dom"

const ArticleForm = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Basic Info
    title: "",
    metaDescription: "",
    primaryKeyword: "",
    secondaryKeywords: [] as string[],
    
    // Strategy & Audience
    contentGoal: "",
    targetAudience: "",
    competitorUrls: [] as string[],
    
    // Content Details
    contentType: "",
    tone: "",
    wordCountTarget: "",
    includeElements: [] as string[],
    
    // SEO & Publishing
    publishingSchedule: "",
    contentCluster: "",
    internalLinks: [] as string[],
    callToAction: ""
  })

  const [newKeyword, setNewKeyword] = useState("")
  const [newCompetitor, setNewCompetitor] = useState("")
  const [newInternalLink, setNewInternalLink] = useState("")

  const contentGoals = [
    "Increase organic traffic",
    "Generate leads",
    "Build brand awareness",
    "Drive conversions",
    "Establish thought leadership",
    "Support product launch"
  ]

  const targetAudiences = [
    "Small business owners",
    "Marketing professionals",
    "Content creators",
    "E-commerce entrepreneurs",
    "SaaS founders",
    "Digital marketers"
  ]

  const contentTypes = [
    "How-to guide",
    "Listicle",
    "Case study",
    "Product review",
    "Industry analysis",
    "Beginner's guide",
    "Comparison article",
    "News & trends"
  ]

  const toneOptions = [
    "Professional",
    "Conversational",
    "Educational",
    "Authoritative",
    "Friendly",
    "Technical"
  ]

  const contentElements = [
    "Images/Screenshots",
    "Infographics",
    "Video embeds",
    "Data tables",
    "Code examples",
    "Download resources",
    "Interactive elements",
    "Social proof"
  ]

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.secondaryKeywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        secondaryKeywords: [...prev.secondaryKeywords, newKeyword.trim()]
      }))
      setNewKeyword("")
    }
  }

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      secondaryKeywords: prev.secondaryKeywords.filter(k => k !== keyword)
    }))
  }

  const addCompetitor = () => {
    if (newCompetitor.trim() && !formData.competitorUrls.includes(newCompetitor.trim())) {
      setFormData(prev => ({
        ...prev,
        competitorUrls: [...prev.competitorUrls, newCompetitor.trim()]
      }))
      setNewCompetitor("")
    }
  }

  const removeCompetitor = (url: string) => {
    setFormData(prev => ({
      ...prev,
      competitorUrls: prev.competitorUrls.filter(u => u !== url)
    }))
  }

  const addInternalLink = () => {
    if (newInternalLink.trim() && !formData.internalLinks.includes(newInternalLink.trim())) {
      setFormData(prev => ({
        ...prev,
        internalLinks: [...prev.internalLinks, newInternalLink.trim()]
      }))
      setNewInternalLink("")
    }
  }

  const removeInternalLink = (link: string) => {
    setFormData(prev => ({
      ...prev,
      internalLinks: prev.internalLinks.filter(l => l !== link)
    }))
  }

  const handleElementToggle = (element: string) => {
    setFormData(prev => ({
      ...prev,
      includeElements: prev.includeElements.includes(element)
        ? prev.includeElements.filter(e => e !== element)
        : [...prev.includeElements, element]
    }))
  }

  const handleSubmit = () => {
    console.log("Article form data:", formData)
    navigate("/article/editor")
  }

  const steps = [
    { number: 1, title: "Basic Info", icon: Target },
    { number: 2, title: "Strategy", icon: Users },
    { number: 3, title: "Content", icon: Eye },
    { number: 4, title: "SEO & Publishing", icon: TrendingUp }
  ]

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Article Title</Label>
              <Input
                id="title"
                placeholder="Enter your article title..."
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                placeholder="Write a compelling meta description (150-160 characters)..."
                value={formData.metaDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                className="h-20"
              />
              <p className="text-xs text-slate-500">{formData.metaDescription.length}/160 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryKeyword">Primary Keyword</Label>
              <Input
                id="primaryKeyword"
                placeholder="Main keyword to rank for..."
                value={formData.primaryKeyword}
                onChange={(e) => setFormData(prev => ({ ...prev, primaryKeyword: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Secondary Keywords</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add secondary keyword..."
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                />
                <Button type="button" onClick={addKeyword} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.secondaryKeywords.map(keyword => (
                  <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                    {keyword}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeKeyword(keyword)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Content Goal</Label>
              <Select value={formData.contentGoal} onValueChange={(value) => setFormData(prev => ({ ...prev, contentGoal: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="What's the primary goal of this content?" />
                </SelectTrigger>
                <SelectContent>
                  {contentGoals.map(goal => (
                    <SelectItem key={goal} value={goal}>{goal}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select value={formData.targetAudience} onValueChange={(value) => setFormData(prev => ({ ...prev, targetAudience: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Who is your primary audience?" />
                </SelectTrigger>
                <SelectContent>
                  {targetAudiences.map(audience => (
                    <SelectItem key={audience} value={audience}>{audience}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Competitor URLs (for analysis)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://competitor-article.com"
                  value={newCompetitor}
                  onChange={(e) => setNewCompetitor(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCompetitor()}
                />
                <Button type="button" onClick={addCompetitor} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2 mt-2">
                {formData.competitorUrls.map(url => (
                  <div key={url} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm truncate">{url}</span>
                    <X 
                      className="w-4 h-4 cursor-pointer text-slate-500 hover:text-red-500" 
                      onClick={() => removeCompetitor(url)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Content Type</Label>
              <Select value={formData.contentType} onValueChange={(value) => setFormData(prev => ({ ...prev, contentType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select content format" />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tone of Voice</Label>
              <Select value={formData.tone} onValueChange={(value) => setFormData(prev => ({ ...prev, tone: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select writing tone" />
                </SelectTrigger>
                <SelectContent>
                  {toneOptions.map(tone => (
                    <SelectItem key={tone} value={tone}>{tone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Word Count</Label>
              <Input
                placeholder="e.g., 1500"
                value={formData.wordCountTarget}
                onChange={(e) => setFormData(prev => ({ ...prev, wordCountTarget: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Include Elements</Label>
              <div className="grid grid-cols-2 gap-3">
                {contentElements.map(element => (
                  <div key={element} className="flex items-center space-x-2">
                    <Checkbox
                      id={element}
                      checked={formData.includeElements.includes(element)}
                      onCheckedChange={() => handleElementToggle(element)}
                    />
                    <Label htmlFor={element} className="text-sm">{element}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Publishing Schedule</Label>
              <Select value={formData.publishingSchedule} onValueChange={(value) => setFormData(prev => ({ ...prev, publishingSchedule: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="When do you want to publish?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediately">Publish immediately</SelectItem>
                  <SelectItem value="schedule">Schedule for later</SelectItem>
                  <SelectItem value="draft">Save as draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Content Cluster/Topic</Label>
              <Input
                placeholder="e.g., SEO Basics, Content Marketing..."
                value={formData.contentCluster}
                onChange={(e) => setFormData(prev => ({ ...prev, contentCluster: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Internal Links to Include</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Internal page URL or title..."
                  value={newInternalLink}
                  onChange={(e) => setNewInternalLink(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addInternalLink()}
                />
                <Button type="button" onClick={addInternalLink} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2 mt-2">
                {formData.internalLinks.map(link => (
                  <div key={link} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm truncate">{link}</span>
                    <X 
                      className="w-4 h-4 cursor-pointer text-slate-500 hover:text-red-500" 
                      onClick={() => removeInternalLink(link)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="callToAction">Call to Action</Label>
              <Textarea
                id="callToAction"
                placeholder="What action should readers take after reading?"
                value={formData.callToAction}
                onChange={(e) => setFormData(prev => ({ ...prev, callToAction: e.target.value }))}
                className="h-20"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            New Article Brief
          </h1>
          <p className="text-slate-600 mt-1">Answer these questions to optimize your content strategy</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="border-0 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">Progress</CardTitle>
            <CardDescription>Complete all steps to generate your brief</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {steps.map(step => (
                <div 
                  key={step.number}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    currentStep === step.number 
                      ? 'bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200' 
                      : currentStep > step.number
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                  onClick={() => setCurrentStep(step.number)}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step.number 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                      : currentStep > step.number
                      ? 'bg-green-500 text-white'
                      : 'bg-white border-2 border-slate-300 text-slate-600'
                  }`}>
                    {currentStep > step.number ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{step.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-0 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <steps[currentStep - 1].icon className="w-5 h-5" />
              Step {currentStep}: {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Let's start with the basics - your article title and target keywords."}
              {currentStep === 2 && "Define your content strategy and competitive landscape."}
              {currentStep === 3 && "Specify the content format and elements you want to include."}
              {currentStep === 4 && "Set up SEO optimization and publishing details."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}

            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep < 4 ? (
                <Button 
                  onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  Create Article Brief
                  <Lightbulb className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ArticleForm
