
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"

interface WebflowConnection {
  id: string
  connection_name: string
  cms_type: string
  site_id?: string
  is_active: boolean
  created_at: string
  credentials: {
    type: 'site_token' | 'oauth'
    site_name?: string
  }
}

export function useWebflowConnections() {
  const [connections, setConnections] = useState<WebflowConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConnections = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: user } = await supabase.auth.getUser()
      if (!user.user) {
        setConnections([])
        return
      }

      const { data, error } = await supabase
        .from('cms_connections')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('cms_type', 'webflow')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setConnections(data || [])
    } catch (err) {
      console.error('Error fetching Webflow connections:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch connections')
      setConnections([])
    } finally {
      setLoading(false)
    }
  }

  const refreshConnections = () => {
    fetchConnections()
  }

  useEffect(() => {
    fetchConnections()
  }, [])

  return {
    connections,
    loading,
    error,
    refreshConnections
  }
}
