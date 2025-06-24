
"use client"

import { type LucideIcon, Plus, Globe } from "lucide-react"
import { 
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { WebflowConnectionDialog } from "@/components/WebflowConnection/WebflowConnectionDialog"
import { useWebflowConnections } from "@/hooks/useWebflowConnections"

export function NavProjects({
  projects,
}: {
  projects: {
    name: string
    url: string
    icon: LucideIcon
  }[]
}) {
  const { connections, refreshConnections } = useWebflowConnections()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>CMS Collections</SidebarGroupLabel>
      <SidebarMenu>
        {connections.length > 0 ? (
          <>
            {connections.map((connection) => (
              <SidebarMenuItem key={connection.id}>
                <SidebarMenuButton>
                  <Globe className="w-4 h-4" />
                  <span>{connection.connection_name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <WebflowConnectionDialog onConnectionAdded={refreshConnections} />
            </SidebarMenuItem>
          </>
        ) : (
          <SidebarMenuItem>
            <WebflowConnectionDialog onConnectionAdded={refreshConnections} />
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
