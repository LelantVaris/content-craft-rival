
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Clock, FileText, CheckCircle2, Globe, Loader2, RefreshCw, Settings } from "lucide-react"
import { useWebflowConnections } from "@/hooks/useWebflowConnections"
import { useWebflowPublishing } from "@/hooks/useWebflowPublishing"
import { WebflowConnectionDialog } from "@/components/WebflowConnection/WebflowConnectionDialog"
import { useParams } from "react-router-dom"
import { useArticles } from "@/hooks/useArticles"

const PublishingPanel = () => {
  const { id: articleId } = useParams()
  const { connections, refreshConnections } = useWebflowConnections()
  const { articles } = useArticles()
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>("")
  const [publishLive, setPublishLive] = useState(false)

  const {
    isLoading,
    isPublishing,
    collections,
    selectedCollection,
    fieldMapping,
    publishingProgress,
    discoverCollections,
    publishToWebflow,
    selectCollection,
    updateFieldMapping
  } = useWebflowPublishing()

  const currentArticle = articles.find(a => a.id === articleId)
  const selectedConnection = connections.find(c => c.id === selectedConnectionId)

  // Auto-select first connection and discover collections
  useEffect(() => {
    if (connections.length > 0 && !selectedConnectionId) {
      const firstConnection = connections[0]
      setSelectedConnectionId(firstConnection.id)
      
      // Auto-discover collections for the first connection
      discoverCollections(firstConnection).catch(console.error)
    }
  }, [connections, selectedConnectionId, discoverCollections])

  const handleRefreshCollections = async () => {
    if (selectedConnection) {
      await discoverCollections(selectedConnection)
    }
  }

  const handlePublish = async () => {
    if (!currentArticle || !selectedConnection) {
      return
    }

    try {
      await publishToWebflow(currentArticle, selectedConnection, { publishLive })
    } catch (error) {
      console.error('Publishing failed:', error)
    }
  }

  return (
    <Card className="border-0 bg-white/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Publishing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Basic Actions */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Save as Draft
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Clock className="w-4 h-4 mr-2" />
              Schedule Publication
            </Button>
          </div>

          {/* Webflow Publishing Section */}
          {connections.length > 0 ? (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Webflow Publishing</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshCollections}
                  disabled={isLoading || !selectedConnection}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              {/* Connection Selection */}
              <div className="space-y-2">
                <Label htmlFor="connection-select">Webflow Site</Label>
                <Select 
                  value={selectedConnectionId} 
                  onValueChange={setSelectedConnectionId}
                >
                  <SelectTrigger id="connection-select">
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
              </div>

              {/* Collection Selection */}
              {collections.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="collection-select">Collection</Label>
                  <Select 
                    value={selectedCollection?.id || ""} 
                    onValueChange={(value) => {
                      const collection = collections.find(c => c.id === value)
                      if (collection) selectCollection(collection)
                    }}
                  >
                    <SelectTrigger id="collection-select">
                      <SelectValue placeholder="Select collection" />
                    </SelectTrigger>
                    <SelectContent>
                      {collections.map((collection) => (
                        <SelectItem key={collection.id} value={collection.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{collection.displayName}</span>
                            <Badge variant="outline" className="ml-2">
                              {collection.fields.length} fields
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Field Mapping Preview */}
              {selectedCollection && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <Label>Field Mapping</Label>
                  </div>
                  <div className="text-xs space-y-1 p-2 bg-muted rounded">
                    <div>Title → {fieldMapping.title || 'Not mapped'}</div>
                    <div>Content → {fieldMapping.content || 'Not mapped'}</div>
                    <div>Description → {fieldMapping.description || 'Not mapped'}</div>
                    {fieldMapping.keywords && (
                      <div>Keywords → {fieldMapping.keywords}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Publishing Options */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="publish-live"
                  checked={publishLive}
                  onCheckedChange={setPublishLive}
                />
                <Label htmlFor="publish-live" className="text-sm">
                  Publish live immediately
                </Label>
              </div>

              {/* Publishing Progress */}
              {isPublishing && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Publishing...</span>
                  </div>
                  <Progress value={publishingProgress} className="w-full" />
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Discovering collections...
                </div>
              )}

              {/* Publish Button */}
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={!selectedCollection || isPublishing || !currentArticle}
                onClick={handlePublish}
              >
                {isPublishing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Globe className="w-4 h-4 mr-2" />
                )}
                {publishLive ? 'Publish Live to Webflow' : 'Stage in Webflow'}
              </Button>
            </div>
          ) : (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Connect a Webflow site to publish directly
              </p>
              <WebflowConnectionDialog onConnectionAdded={refreshConnections} />
            </div>
          )}

          {/* Regular Publish Button */}
          <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Publish Now
          </Button>
        </div>
        
        <div className="mt-4 pt-4 border-t text-xs text-slate-500">
          Last saved: Auto-saving enabled
        </div>
      </CardContent>
    </Card>
  )
}

export default PublishingPanel
