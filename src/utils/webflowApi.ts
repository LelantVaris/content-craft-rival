const WEBFLOW_API_BASE = 'https://api.webflow.com/v2';

export interface WebflowSite {
  id: string;
  displayName: string;
  shortName: string;
  lastPublished?: string;
  previewUrl?: string;
  timezone: string;
  database: string;
}

export interface WebflowCollection {
  id: string;
  displayName: string;
  singularName: string;
  slug: string;
}

export interface WebflowItem {
  id: string;
  cmsLocaleId: string;
  lastPublished?: string;
  lastUpdated: string;
  createdOn: string;
  isArchived: boolean;
  isDraft: boolean;
  fieldData: Record<string, any>;
}

export class WebflowAPIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'WebflowAPIError';
  }
}

export async function fetchWebflowSites(token: string): Promise<WebflowSite[]> {
  const response = await fetch(`${WEBFLOW_API_BASE}/sites`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new WebflowAPIError(`Failed to fetch sites: ${response.statusText}`, response.status);
  }

  const data = await response.json();
  return data.sites || [];
}

export async function fetchWebflowCollections(token: string, siteId: string): Promise<WebflowCollection[]> {
  const response = await fetch(`${WEBFLOW_API_BASE}/sites/${siteId}/collections`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new WebflowAPIError(`Failed to fetch collections: ${response.statusText}`, response.status);
  }

  const data = await response.json();
  return data.collections || [];
}

export async function createWebflowItem(
  token: string,
  collectionId: string,
  itemData: Record<string, any>,
  isDraft: boolean = true
): Promise<WebflowItem> {
  const response = await fetch(`${WEBFLOW_API_BASE}/collections/${collectionId}/items`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      isArchived: false,
      isDraft: isDraft,
      fieldData: itemData,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new WebflowAPIError(
      `Failed to create item: ${response.statusText}. ${errorData.message || ''}`,
      response.status
    );
  }

  return await response.json();
}

export async function publishWebflowSite(token: string, siteId: string): Promise<void> {
  const response = await fetch(`${WEBFLOW_API_BASE}/sites/${siteId}/publish`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      publishToWebflowSubdomain: true,
    }),
  });

  if (!response.ok) {
    throw new WebflowAPIError(`Failed to publish site: ${response.statusText}`, response.status);
  }
}

export async function discoverWebflowCollections(
  connection: any,
  siteId?: string
): Promise<any[]> {
  try {
    const actualSiteId = siteId || connection.site_id;
    if (!actualSiteId) {
      throw new WebflowAPIError('No site ID provided');
    }
    
    return await fetchWebflowCollections(connection.token, actualSiteId);
  } catch (error) {
    throw new WebflowAPIError(`Failed to discover collections: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function publishArticleToWebflow(
  article: any,
  connection: any,
  collectionId: string,
  fieldMapping: any,
  options: { publishLive?: boolean } = {}
): Promise<any> {
  try {
    const itemData: Record<string, any> = {};
    
    // Map article fields to Webflow fields
    if (fieldMapping.title && article.title) {
      itemData[fieldMapping.title] = article.title;
    }
    if (fieldMapping.content && article.content) {
      itemData[fieldMapping.content] = article.content;
    }
    if (fieldMapping.description && article.content) {
      // Use first 160 characters as description
      itemData[fieldMapping.description] = article.content.substring(0, 160);
    }
    if (fieldMapping.keywords && article.keywords) {
      itemData[fieldMapping.keywords] = Array.isArray(article.keywords) 
        ? article.keywords.join(', ') 
        : article.keywords;
    }

    const result = await createWebflowItem(
      connection.token,
      collectionId,
      itemData,
      !options.publishLive
    );

    // If publishLive is true, publish the site
    if (options.publishLive && connection.site_id) {
      await publishWebflowSite(connection.token, connection.site_id);
    }

    return result;
  } catch (error) {
    throw new WebflowAPIError(`Failed to publish article: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
