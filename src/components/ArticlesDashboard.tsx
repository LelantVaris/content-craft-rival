
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  FileText, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Copy, 
  Trash2,
  Plus,
  Calendar,
  Eye
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useArticles } from '@/hooks/useArticles'
import { useNavigate } from 'react-router-dom'
import { Tables } from '@/integrations/supabase/types'
import { formatDistanceToNow } from 'date-fns'

type Article = Tables<'articles'>

const ArticlesDashboard = () => {
  const { articles, loading, deleteArticle, duplicateArticle } = useArticles()
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'scheduled'>('all')
  const navigate = useNavigate()

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (article.content?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    
    const matchesFilter = filter === 'all' || article.status === filter
    
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'draft': 
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleEdit = (article: Article) => {
    navigate(`/article/${article.id}/edit`)
  }

  const handleDuplicate = async (article: Article) => {
    await duplicateArticle(article.id)
  }

  const handleDelete = async (article: Article) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      await deleteArticle(article.id)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 rounded mb-4 w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Articles</h2>
          <p className="text-gray-600">Manage and organize your content</p>
        </div>
        
        <Button 
          onClick={() => navigate('/article/new')}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600"
        >
          <Plus className="w-4 h-4" />
          New Article
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          {(['all', 'draft', 'published', 'scheduled'] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Articles List */}
      {filteredArticles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600 text-center mb-6">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first article'
              }
            </p>
            {!searchTerm && filter === 'all' && (
              <Button 
                onClick={() => navigate('/article/new')}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Your First Article
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredArticles.map((article) => (
            <Card key={article.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {article.title}
                      </h3>
                      <Badge className={`${getStatusColor(article.status)} border-0`}>
                        {article.status || 'draft'}
                      </Badge>
                    </div>
                    
                    {article.content && (
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {article.content.substring(0, 150)}...
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(article.updated_at || article.created_at || ''), { addSuffix: true })}
                      </span>
                      
                      {article.word_count && (
                        <span>{article.word_count} words</span>
                      )}
                      
                      {article.reading_time && (
                        <span>{article.reading_time} min read</span>
                      )}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(article)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(article)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(article)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default ArticlesDashboard
