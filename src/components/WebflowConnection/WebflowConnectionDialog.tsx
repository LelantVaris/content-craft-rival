import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Globe, Key } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
interface WebflowConnectionDialogProps {
  onConnectionAdded?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}
export function WebflowConnectionDialog({
  onConnectionAdded,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  children
}: WebflowConnectionDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [siteToken, setSiteToken] = useState("");
  const [connectionName, setConnectionName] = useState("");
  const {
    toast
  } = useToast();

  // Use controlled props if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;
  const handleSiteTokenConnection = async () => {
    if (!siteToken.trim() || !connectionName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both connection name and site token.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      const {
        data: user
      } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      // Validate token by testing it against Webflow API
      const response = await supabase.functions.invoke('validate-webflow-token', {
        body: {
          token: siteToken
        }
      });
      if (response.error) {
        throw new Error("Invalid Webflow token");
      }

      // Store the connection
      const {
        error
      } = await supabase.from('cms_connections').insert({
        user_id: user.user.id,
        cms_type: 'webflow',
        connection_name: connectionName,
        credentials: {
          token: siteToken,
          type: 'site_token'
        }
      });
      if (error) throw error;
      toast({
        title: "Connection Added",
        description: "Webflow site token connected successfully."
      });
      setSiteToken("");
      setConnectionName("");
      setOpen(false);
      onConnectionAdded?.();
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to Webflow",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleOAuthConnection = async () => {
    setLoading(true);
    try {
      // Redirect to OAuth flow
      const response = await supabase.functions.invoke('webflow-oauth-init');
      if (response.data?.authUrl) {
        window.location.href = response.data.authUrl;
      }
    } catch (error) {
      console.error('OAuth error:', error);
      toast({
        title: "OAuth Failed",
        description: "Failed to initiate OAuth flow",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const dialogContent = <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Connect Webflow Account</DialogTitle>
        <DialogDescription>
          Choose how you'd like to connect your Webflow account to publish articles.
        </DialogDescription>
      </DialogHeader>

      <Tabs defaultValue="site-token" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="site-token">Site Token</TabsTrigger>
          <TabsTrigger value="oauth">OAuth</TabsTrigger>
        </TabsList>

        <TabsContent value="site-token" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Site Token Authentication
              </CardTitle>
              <CardDescription>
                Best for single-site integrations. Get your token from Webflow Site Settings → Apps & Integrations → API Access.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="connection-name">Connection Name</Label>
                <Input id="connection-name" placeholder="My Webflow Site" value={connectionName} onChange={e => setConnectionName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="site-token">Site Token</Label>
                <Input id="site-token" type="password" placeholder="Enter your Webflow site token" value={siteToken} onChange={e => setSiteToken(e.target.value)} />
              </div>
              <Button onClick={handleSiteTokenConnection} disabled={loading} className="w-full">
                {loading ? "Connecting..." : "Connect Site"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="oauth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                OAuth Authentication
              </CardTitle>
              <CardDescription>
                Secure access to multiple sites. Recommended for most users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleOAuthConnection} disabled={loading} className="w-full">
                {loading ? "Redirecting..." : "Connect with OAuth"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DialogContent>;

  // If children are provided, use them as trigger, otherwise provide default trigger
  if (children) {
    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        {dialogContent}
      </Dialog>;
  }
  return <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        
      </DialogTrigger>
      {dialogContent}
    </Dialog>;
}