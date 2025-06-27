
"use client"

import { type LucideIcon, Plus, Globe, Settings } from "lucide-react"
import { useState } from "react"
import { 
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { WebflowConnectionDialog } from "@/components/WebflowConnection/WebflowConnectionDialog"
import { CMSCollectionSettingsModal } from "@/components/CMSCollectionSettingsModal"
import { useWebflowConnections } from "@/hooks/useWebflowConnections"
import { Tables } from "@/integrations/supabase/types"

type WebflowConnection = Tables<'cms_connections'>

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
  const [selectedConnection, setSelectedConnection] = useState<WebflowConnection | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const handleConnectionClick = (connection: WebflowConnection) => {
    setSelectedConnection(connection)
    setSettingsOpen(true)
  }

  const handleSettingsClose = () => {
    setSettingsOpen(false)
    setSelectedConnection(null)
  }

  const hasCustomSettings = (connection: WebflowConnection) => {
    return !!(
      connection.company_name_override ||
      connection.website_url_override ||
      connection.target_audience_override ||
      connection.industry_override ||
      connection.content_goals_override?.length ||
      connection.preferred_tone_override ||
      (connection.language_preference && connection.language_preference !== 'english')
    )
  }

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>CMS Collections</SidebarGroupLabel>
        <SidebarMenu>
          {connections.length > 0 ? (
            <>
              {connections.map((connection) => (
                <SidebarMenuItem key={connection.id}>
                  <SidebarMenuButton
                    onClick={() => handleConnectionClick(connection)}
                    className="group cursor-pointer"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="flex-1">{connection.connection_name}</span>
                    {hasCustomSettings(connection) && (
                      <Settings className="w-3 h-3 text-muted-foreground group-hover:text-foreground" />
                    )}
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

      <CMSCollectionSettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        connection={selectedConnection}
        onConnectionUpdated={() => {
          refreshConnections()
          handleSettingsClose()
        }}
      />
    </>
  )
}
