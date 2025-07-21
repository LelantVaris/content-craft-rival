
import React, { useEffect, useState, useCallback } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ExternalLink } from 'lucide-react';

interface WebsiteGraphProps {
  websiteMapId: string;
}

interface PageData {
  id: string;
  url: string;
  title: string;
  word_count: number;
  internal_links: string[];
  meta_description: string;
}

interface NodeData extends Record<string, unknown> {
  label: string;
  page: PageData;
  nodeType: string;
}

export const WebsiteMapGraph: React.FC<WebsiteGraphProps> = ({ websiteMapId }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalNodes: 0, totalEdges: 0, isolatedNodes: 0 });

  useEffect(() => {
    fetchGraphData();
  }, [websiteMapId]);

  const fetchGraphData = async () => {
    try {
      // Fetch pages
      const { data: pages, error: pagesError } = await supabase
        .from('website_pages')
        .select('*')
        .eq('website_map_id', websiteMapId);

      if (pagesError) throw pagesError;

      // Fetch connections
      const { data: connections, error: connectionsError } = await supabase
        .from('page_connections')
        .select('source_page_id, target_page_id')
        .eq('website_map_id', websiteMapId);

      if (connectionsError) throw connectionsError;

      if (!pages || pages.length === 0) {
        setLoading(false);
        return;
      }

      // Create nodes with positioning
      const graphNodes: Node<NodeData>[] = pages.map((page, index) => {
        const isHomepage = isHomePage(page.url);
        const linkCount = (page.internal_links || []).length;
        const nodeType = isHomepage ? 'homepage' : linkCount > 5 ? 'hub' : 'regular';
        
        // Simple circular layout for now
        const angle = (index / pages.length) * 2 * Math.PI;
        const radius = Math.min(300, pages.length * 20);
        
        return {
          id: page.id,
          type: 'default',
          position: {
            x: 400 + radius * Math.cos(angle),
            y: 300 + radius * Math.sin(angle),
          },
          data: {
            label: getNodeLabel(page.title || '', page.url),
            page: page as PageData,
            nodeType: nodeType,
          },
          style: {
            background: getNodeColor(nodeType),
            color: 'white',
            border: '2px solid #ffffff',
            borderRadius: '8px',
            fontSize: '12px',
            padding: '8px',
            minWidth: '120px',
            textAlign: 'center',
          },
        };
      });

      // Create edges
      const graphEdges: Edge[] = (connections || [])
        .filter(conn => conn.source_page_id && conn.target_page_id)
        .map(conn => ({
          id: `${conn.source_page_id}-${conn.target_page_id}`,
          source: conn.source_page_id!,
          target: conn.target_page_id!,
          type: 'smoothstep',
          style: { stroke: '#9ca3af', strokeWidth: 2 },
          animated: false,
        }));

      // Calculate stats
      const connectedNodeIds = new Set([
        ...graphEdges.map(e => e.source),
        ...graphEdges.map(e => e.target)
      ]);
      const isolatedCount = graphNodes.length - connectedNodeIds.size;

      setStats({
        totalNodes: graphNodes.length,
        totalEdges: graphEdges.length,
        isolatedNodes: isolatedCount
      });

      setNodes(graphNodes);
      setEdges(graphEdges);
    } catch (error) {
      console.error('Error fetching graph data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isHomePage = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname === '/' || urlObj.pathname === '';
    } catch {
      return false;
    }
  };

  const getNodeLabel = (title: string, url: string): string => {
    if (title && title.trim()) {
      return title.length > 30 ? title.substring(0, 27) + '...' : title;
    }
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname === '/' ? 'Home' : urlObj.pathname;
      return path.length > 30 ? path.substring(0, 27) + '...' : path;
    } catch {
      return 'Unknown Page';
    }
  };

  const getNodeColor = (nodeType: string): string => {
    switch (nodeType) {
      case 'homepage': return '#10b981'; // Green
      case 'hub': return '#3b82f6'; // Blue
      default: return '#6b7280'; // Gray
    }
  };

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node<NodeData>) => {
    setSelectedNode(node.data.page);
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading website map...</p>
        </div>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No pages found to visualize</p>
          <p className="text-sm text-gray-500">The crawl may still be processing or no internal links were found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="h-96 border rounded-lg overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          attributionPosition="bottom-left"
        >
          <Background />
          <Controls />
          <MiniMap 
            nodeColor={(node) => {
              if (node.data && typeof node.data === 'object' && 'nodeType' in node.data) {
                return getNodeColor(node.data.nodeType as string);
              }
              return '#6b7280'; // Default gray
            }}
            nodeStrokeWidth={3}
            zoomable
            pannable
          />
          
          <Panel position="top-right">
            <Card className="p-3 max-w-xs bg-white/95">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Map Statistics</h3>
                <div className="text-xs space-y-1">
                  <div>Pages: {stats.totalNodes}</div>
                  <div>Connections: {stats.totalEdges}</div>
                  <div>Isolated: {stats.isolatedNodes}</div>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Homepage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Hub Pages (5+ links)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-500 rounded"></div>
                    <span>Regular Pages</span>
                  </div>
                </div>
              </div>
            </Card>
          </Panel>
        </ReactFlow>
      </div>

      {/* Page Details Panel */}
      {selectedNode && (
        <div className="absolute top-4 left-4 w-80 bg-white rounded-lg shadow-lg border z-10">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg truncate flex-1">
                  {selectedNode.title || 'Untitled Page'}
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedNode(null)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="font-medium mb-1">URL:</div>
                <div className="flex items-center gap-2">
                  <a 
                    href={selectedNode.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate flex-1"
                  >
                    {selectedNode.url}
                  </a>
                  <ExternalLink className="h-3 w-3 text-gray-400" />
                </div>
              </div>
              
              {selectedNode.meta_description && (
                <div>
                  <div className="font-medium mb-1">Description:</div>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    {selectedNode.meta_description}
                  </p>
                </div>
              )}
              
              <div className="flex gap-4">
                <div>
                  <span className="font-medium">Word Count:</span>
                  <Badge variant="secondary" className="ml-2">
                    {selectedNode.word_count}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Internal Links:</span>
                  <Badge variant="secondary" className="ml-2">
                    {(selectedNode.internal_links || []).length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
