
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
