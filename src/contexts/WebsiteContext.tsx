
"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useWebflowConnections } from '@/hooks/useWebflowConnections'

interface Website {
  id: string
  name: string
  url: string
  type: 'webflow' | 'demo'
  connectionId?: string
}

interface WebsiteContextType {
  activeWebsite: Website | null
  setActiveWebsite: (website: Website) => void
  websites: Website[]
}

const WebsiteContext = createContext<WebsiteContextType | undefined>(undefined)

export function useWebsite() {
  const context = useContext(WebsiteContext)
  if (context === undefined) {
    throw new Error('useWebsite must be used within a WebsiteProvider')
  }
  return context
}

const placeholderWebsite: Website = {
  id: "acme-corp",
  name: "Acme Corp.",
  url: "demo.acme.com",
  type: "demo"
}

export function WebsiteProvider({ children }: { children: React.ReactNode }) {
  const { connections } = useWebflowConnections()
  const [activeWebsite, setActiveWebsite] = useState<Website | null>(null)

  const getWebsiteUrl = (connection: any) => {
    try {
      const credentials = typeof connection.credentials === 'object' 
        ? connection.credentials 
        : JSON.parse(connection.credentials || '{}')
      return credentials.site_name || connection.connection_name.toLowerCase().replace(/\s+/g, '-') + '.webflow.io'
    } catch {
      return connection.connection_name.toLowerCase().replace(/\s+/g, '-') + '.webflow.io'
    }
  }

  const websites: Website[] = [
    ...connections.map(connection => ({
      id: connection.id,
      name: connection.connection_name,
      url: getWebsiteUrl(connection),
      type: "webflow" as const,
      connectionId: connection.id
    })),
    placeholderWebsite
  ]

  // Set initial active website
  useEffect(() => {
    if (connections.length > 0 && !activeWebsite) {
      const firstWebflowSite = websites.find(w => w.type === 'webflow')
      if (firstWebflowSite) {
        setActiveWebsite(firstWebflowSite)
      }
    } else if (connections.length === 0 && !activeWebsite) {
      setActiveWebsite(placeholderWebsite)
    }
  }, [connections, activeWebsite])

  return (
    <WebsiteContext.Provider value={{ activeWebsite, setActiveWebsite, websites }}>
      {children}
    </WebsiteContext.Provider>
  )
}
