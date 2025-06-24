
"use client"

import * as React from "react"
import { ChevronsUpDown, Plus, Target, Globe } from "lucide-react"
import { useWebsite } from "@/contexts/WebsiteContext"
import { WebflowConnectionDialog } from "@/components/WebflowConnection/WebflowConnectionDialog"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const { activeWebsite, setActiveWebsite, websites } = useWebsite()
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const handleConnectionAdded = () => {
    setDialogOpen(false)
    // The context will automatically update when useWebflowConnections refreshes
  }

  if (!activeWebsite) {
    return null
  }

  const getWebsiteIcon = (website: any) => {
    return website.type === 'webflow' ? Globe : Target
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-sidebar-primary-foreground">
                  {React.createElement(getWebsiteIcon(activeWebsite), { className: "size-4 text-white" })}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {activeWebsite.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">{activeWebsite.url}</span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Websites
              </DropdownMenuLabel>
              {websites.map((website, index) => {
                const Icon = getWebsiteIcon(website)
                return (
                  <DropdownMenuItem
                    key={website.id}
                    onClick={() => setActiveWebsite(website)}
                    className="gap-2 p-2"
                  >
                    <div className="flex size-6 items-center justify-center rounded-sm border">
                      <Icon className="size-4 shrink-0" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{website.name}</span>
                      <span className="text-xs text-muted-foreground">{website.url}</span>
                    </div>
                    {website.type === "webflow" && <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>}
                  </DropdownMenuItem>
                )
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 p-2" onClick={() => setDialogOpen(true)}>
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">Add Website</div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <WebflowConnectionDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        onConnectionAdded={handleConnectionAdded} 
      />
    </>
  )
}
