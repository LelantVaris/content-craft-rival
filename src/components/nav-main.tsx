
"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { Link } from "react-router-dom"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { useArticles } from "@/hooks/useArticles"
import { formatDistanceToNow } from "date-fns"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const { articles, loading } = useArticles()
  
  // Get recent articles (last 5)
  const recentArticles = articles.slice(0, 5)

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Recent Articles</SidebarGroupLabel>
      <SidebarMenu>
        {loading ? (
          <SidebarMenuItem>
            <SidebarMenuButton>
              <span>Loading...</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : recentArticles.length === 0 ? (
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/article/new">
                <span className="text-muted-foreground">No articles yet</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : (
          recentArticles.map((article) => (
            <SidebarMenuItem key={article.id}>
              <SidebarMenuButton asChild>
                <Link to={`/article/${article.id}/edit`} title={article.title}>
                  <span className="truncate">{article.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(article.updated_at || article.created_at || ''), { addSuffix: true })}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
