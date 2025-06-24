
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Globe, Trash2, ExternalLink } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

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

export function WebflowConnectionManager() {
  const [connections, setConnections] = useState<WebflowConnection[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchConnections = async () => {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return

      const { data, error } = await supabase
        .from('cms_connections')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('cms_type', 'webflow')
        .order('created_at', { ascending: false })

      if (error) throw error
      setConnections(data || [])
    } catch (error) {
      console.error('Error fetching connections:', error)
      toast({
        title: "Error",
        description: "Failed to load Webflow connections",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('cms_connections')
        .delete()
        .eq('id', connectionId)

      if (error) throw error

      setConnections(connections.filter(c => c.id !== connectionId))
      toast({
        title: "Connection Removed",
        description: "Webflow connection has been deleted."
      })
    } catch (error) {
      console.error('Error deleting connection:', error)
      toast({
        title: "Error",
        description: "Failed to delete connection",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    fetchConnections()
  }, [])

  if (loading) {
    return <div className="text-center py-4">Loading connections...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Connected Webflow Sites</h3>
        <Badge variant="secondary">{connections.length} Connected</Badge>
      </div>

      {connections.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No Webflow connections found.</p>
              <p className="text-sm">Connect your first Webflow site to start publishing articles.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {connections.map((connection) => (
            <Card key={connection.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {connection.connection_name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={connection.is_active ? "default" : "secondary"}>
                      {connection.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">
                      {connection.credentials.type === 'oauth' ? 'OAuth' : 'Site Token'}
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  Connected on {new Date(connection.created_at).toLocaleDateString()}
                  {connection.credentials.site_name && (
                    <span> • {connection.credentials.site_name}</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Test Connection
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Webflow Connection</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove the connection to "{connection.connection_name}"? 
                          This action cannot be undone and you'll need to reconnect to publish to this site.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteConnection(connection.id)}>
                          Remove Connection
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
