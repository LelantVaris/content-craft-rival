
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, FileText, CheckCircle2, Globe } from "lucide-react"
import { useWebflowConnections } from "@/hooks/useWebflowConnections"
import { WebflowConnectionDialog } from "@/components/WebflowConnection/WebflowConnectionDialog"

const PublishingPanel = () => {
  const { connections, refreshConnections } = useWebflowConnections()
  const [selectedConnection, setSelectedConnection] = useState<string>("")

  return (
    <Card className="border-0 bg-white/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Publishing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <FileText className="w-4 h-4 mr-2" />
            Save as Draft
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Clock className="w-4 h-4 mr-2" />
            Schedule Publication
          </Button>
          
          {/* Webflow Publishing Section */}
          {connections.length > 0 && (
            <div className="space-y-2">
              <Select value={selectedConnection} onValueChange={setSelectedConnection}>
                <SelectTrigger>
                  <Globe className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Select Webflow site" />
                </SelectTrigger>
                <SelectContent>
                  {connections.map((connection) => (
                    <SelectItem key={connection.id} value={connection.id}>
                      {connection.connection_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={!selectedConnection}
              >
                <Globe className="w-4 h-4 mr-2" />
                Publish to Webflow
              </Button>
            </div>
          )}
          
          {connections.length === 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Connect a Webflow site to publish directly
              </p>
              <WebflowConnectionDialog onConnectionAdded={refreshConnections} />
            </div>
          )}

          <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Publish Now
          </Button>
        </div>
        
        <div className="mt-4 pt-4 border-t text-xs text-slate-500">
          Last saved: 2 minutes ago
        </div>
      </CardContent>
    </Card>
  )
}

export default PublishingPanel
