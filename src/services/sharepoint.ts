import { Client } from '@microsoft/microsoft-graph-client';
import { getToken } from './auth';
import { SharePointDocument } from '../types';

export async function getAuthenticatedClient() {
  const token = await getToken();
  
  return Client.init({
    authProvider: (done) => {
      done(null, token);
    },
  });
}

export async function searchDocuments(query: string): Promise<SharePointDocument[]> {
  const client = await getAuthenticatedClient();
  
  try {
    const searchResults = await client.api('/search/query')
      .post({
        requests: [{
          entityTypes: ['driveItem'],
          query: {
            queryString: query
          },
          from: 0,
          size: 5
        }]
      });

    return searchResults.value[0].hitsContainers[0].hits.map((hit: any) => ({
      id: hit.resource.id,
      name: hit.resource.name,
      content: hit.summary || '',
      lastModified: hit.resource.lastModifiedDateTime
    }));
  } catch (error) {
    console.error('Error searching documents:', error);
    throw error;
  }
}