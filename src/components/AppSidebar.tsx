
import {
  Calendar,
  Home,
  FileText,
  Settings,
  PlusCircle,
  BarChart3,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { Link } from "react-router-dom"

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Create Article",
    url: "/article/new",
    icon: PlusCircle,
  },
  {
    title: "Content Calendar",
    url: "/calendar",
    icon: Calendar,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Articles",
    url: "/articles",
    icon: FileText,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">M</span>
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">metakit.ai</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                    <Link to={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="p-4">
          <p className="text-xs text-sidebar-foreground/60">
            © 2025 metakit.ai
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
