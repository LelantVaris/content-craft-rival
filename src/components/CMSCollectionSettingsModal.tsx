
import React, { useState, useEffect } from 'react';
import {
  Globe,
  Building2,
  Users,
  Target,
  Palette,
  Settings,
  Save,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

type CMSConnection = Tables<'cms_connections'>;

interface CMSCollectionSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection: CMSConnection | null;
  onConnectionUpdated: () => void;
}

const settingsNavigation = [
  { name: 'General', icon: Settings, id: 'general' },
  { name: 'Company Profile', icon: Building2, id: 'company' },
  { name: 'Target Audience', icon: Users, id: 'audience' },
  { name: 'Content Goals', icon: Target, id: 'content' },
  { name: 'Language & Region', icon: Globe, id: 'language' },
  { name: 'Appearance', icon: Palette, id: 'appearance' },
];

const languages = [
  { value: 'english', label: 'English' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'french', label: 'French' },
  { value: 'german', label: 'German' },
  { value: 'italian', label: 'Italian' },
  { value: 'portuguese', label: 'Portuguese' },
  { value: 'dutch', label: 'Dutch' },
  { value: 'japanese', label: 'Japanese' },
];

const toneOptions = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'conversational', label: 'Conversational' },
];

export const CMSCollectionSettingsModal: React.FC<CMSCollectionSettingsModalProps> = ({
  open,
  onOpenChange,
  connection,
  onConnectionUpdated,
}) => {
  const [activeSection, setActiveSection] = useState('general');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name_override: '',
    website_url_override: '',
    target_audience_override: '',
    industry_override: '',
    content_goals_override: [] as string[],
    preferred_tone_override: '',
    language_preference: 'english',
  });

  const { companyProfile } = useCompanyProfile();
  const { profile } = useProfile();

  useEffect(() => {
    if (connection) {
      setFormData({
        company_name_override: connection.company_name_override || '',
        website_url_override: connection.website_url_override || '',
        target_audience_override: connection.target_audience_override || '',
        industry_override: connection.industry_override || '',
        content_goals_override: connection.content_goals_override || [],
        preferred_tone_override: connection.preferred_tone_override || '',
        language_preference: connection.language_preference || 'english',
      });
    }
  }, [connection]);

  const handleSave = async () => {
    if (!connection) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('cms_connections')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', connection.id);

      if (error) throw error;

      toast.success('Settings saved successfully');
      onConnectionUpdated();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Basic configuration for this CMS connection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tone">Preferred Tone</Label>
                  <Select
                    value={formData.preferred_tone_override || companyProfile?.preferred_tone || 'professional'}
                    onValueChange={(value) => handleInputChange('preferred_tone_override', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {toneOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Override the default tone for this specific site
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'company':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Profile Overrides</CardTitle>
                <CardDescription>
                  Override your global company settings for this specific site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={formData.company_name_override}
                    onChange={(e) => handleInputChange('company_name_override', e.target.value)}
                    placeholder={companyProfile?.company_name || 'Enter company name'}
                  />
                  <p className="text-sm text-muted-foreground">
                    Leave empty to use global setting: {companyProfile?.company_name}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website-url">Website URL</Label>
                  <Input
                    id="website-url"
                    value={formData.website_url_override}
                    onChange={(e) => handleInputChange('website_url_override', e.target.value)}
                    placeholder={companyProfile?.website_url || 'Enter website URL'}
                  />
                  <p className="text-sm text-muted-foreground">
                    Leave empty to use global setting: {companyProfile?.website_url}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={formData.industry_override}
                    onChange={(e) => handleInputChange('industry_override', e.target.value)}
                    placeholder={companyProfile?.industry || 'Enter industry'}
                  />
                  <p className="text-sm text-muted-foreground">
                    Leave empty to use global setting: {companyProfile?.industry}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'audience':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Target Audience</CardTitle>
                <CardDescription>
                  Define the specific audience for this site's content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="target-audience">Target Audience</Label>
                  <Textarea
                    id="target-audience"
                    value={formData.target_audience_override}
                    onChange={(e) => handleInputChange('target_audience_override', e.target.value)}
                    placeholder={companyProfile?.target_audience || 'Describe your target audience'}
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground">
                    Leave empty to use global setting: {companyProfile?.target_audience}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'content':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Goals</CardTitle>
                <CardDescription>
                  Set specific content goals for this site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="content-goals">Content Goals (one per line)</Label>
                  <Textarea
                    id="content-goals"
                    value={formData.content_goals_override.join('\n')}
                    onChange={(e) => handleInputChange('content_goals_override', e.target.value.split('\n').filter(Boolean))}
                    placeholder={companyProfile?.content_goals?.join('\n') || 'Enter content goals'}
                    rows={6}
                  />
                  <p className="text-sm text-muted-foreground">
                    Leave empty to use global settings: {companyProfile?.content_goals?.join(', ')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Language & Region</CardTitle>
                <CardDescription>
                  Set the language preference for content generation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={formData.language_preference}
                    onValueChange={(value) => handleInputChange('language_preference', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Content will be generated in this language for this specific site
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize the appearance and theme settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Theme and appearance settings will be available in a future update.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  if (!connection) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 md:max-h-[600px] md:max-w-[900px] lg:max-w-[1000px]">
        <DialogTitle className="sr-only">CMS Collection Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Customize settings for your CMS collection
        </DialogDescription>
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {settingsNavigation.map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          onClick={() => setActiveSection(item.id)}
                          isActive={activeSection === item.id}
                        >
                          <item.icon />
                          <span>{item.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex h-[580px] flex-1 flex-col overflow-hidden">
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
              <div className="flex items-center gap-2 px-4 flex-1">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink>Settings</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{connection.connection_name}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div className="flex items-center gap-2 px-4">
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  size="sm"
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  onClick={() => onOpenChange(false)}
                  variant="ghost"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </header>
            <Separator />
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
              {renderContent()}
            </div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
};
