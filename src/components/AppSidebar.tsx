"use client";

import * as React from "react";
import { AudioWaveform, BookOpen, Bot, Command, Frame, GalleryVerticalEnd, Map, PieChart, Settings2, SquareTerminal, Home, FileEdit, Calendar, BarChart3, Search } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";

// This is sample data for the original template - we'll keep the structure but update content
const data = {
  user: {
    name: "User",
    email: "user@metakit.ai",
    avatar: "/avatars/shadcn.jpg"
  },
  navMain: [{
    title: "Recent Articles",
    url: "#",
    icon: SquareTerminal,
    isActive: true,
    items: [{
      title: "Article 1",
      url: "#"
    }, {
      title: "Article 2",
      url: "#"
    }, {
      title: "Article 3",
      url: "#"
    }, {
      title: "Article 4",
      url: "#"
    }]
  }],
  projects: [{
    name: "Design Engineering",
    url: "#",
    icon: Frame
  }, {
    name: "Sales & Marketing",
    url: "#",
    icon: PieChart
  }, {
    name: "Travel",
    url: "#",
    icon: Map
  }]
};

// Top navigation items
const topNavItems = [{
  title: "Search",
  url: "/search",
  icon: Search
}, {
  title: "Content Planner",
  url: "#",
  icon: Bot
}, {
  title: "Home",
  url: "/",
  icon: Home
}, {
  title: "Article Writer",
  url: "/article/new",
  icon: FileEdit
}];
export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  return <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {/* Top Navigation Items */}
        <SidebarMenu>
          {topNavItems.map(item => <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={location.pathname === item.url} tooltip={item.title}>
                <Link to={item.url} className="px-[12px]">
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>)}
        </SidebarMenu>
        
        {/* Recent Articles Section - will be hidden when collapsed */}
        <NavMain items={data.navMain} />
        
        {/* CMS Collections Section - positioned below Recent Articles */}
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>;
}