import { NOTION_CONFIG, BLOG_POSTS } from '../constants';
import { BlogPost } from '../types';
import { blink } from '../src/lib/blink';

/**
 * Fetches the latest blog posts from the Notion database using the Blink Connector.
 */
export const fetchLatestBlogPosts = async (limit: number = 10): Promise<BlogPost[]> => {
  try {
    // Check connection status first
    const statusResponse = await blink.connectors.status('notion');
    if (!statusResponse.data.connected) {
      console.warn('Notion not connected. Using fallback data.');
      return getFallbackPosts();
    }

    const response = await blink.connectors.execute('notion', {
      method: `/databases/${NOTION_CONFIG.DATABASE_ID}/query`,
      http_method: 'POST',
      params: {
        page_size: limit,
        filter: {
          property: 'Status',
          status: { equals: 'Published' }
        },
        sorts: [
          { property: 'Date', direction: 'descending' }
        ]
      }
    });

    const results = response.data.results || [];
    return results.map(mapNotionToBlogPost);
  } catch (error) {
    console.error('Error fetching blog posts from Notion:', error);
    return getFallbackPosts();
  }
};

const getFallbackPosts = (): BlogPost[] => {
  return BLOG_POSTS.map((post) => ({
    ...post,
    status: 'Published' as const,
    author: 'AIGENCY_SYSTEMS',
    syncHash: `HASH_0x${Math.random().toString(16).slice(2, 10).toUpperCase()}`
  } as BlogPost & { syncHash: string }));
};

/**
 * Fetches the content (blocks) of a specific Notion page.
 */
export const fetchPostContent = async (pageId: string): Promise<string> => {
  try {
    const response = await blink.connectors.execute('notion', {
      method: `/blocks/${pageId}/children`,
      http_method: 'GET'
    });

    const blocks = response.data.results || [];
    return blocks.map((block: any) => {
      const type = block.type;
      const content = block[type]?.rich_text?.[0]?.plain_text || '';
      
      switch (type) {
        case 'heading_1': return `### ${content}`;
        case 'heading_2': return `### ${content}`;
        case 'heading_3': return `### ${content}`;
        case 'paragraph': return content;
        case 'bulleted_list_item': return `- ${content}`;
        case 'numbered_list_item': return `1. ${content}`;
        case 'code': return `\`\`\`\n${content}\n\`\`\``;
        case 'quote': return `> ${content}`;
        default: return '';
      }
    }).filter(Boolean).join('\n\n');
  } catch (error) {
    console.error('Error fetching post content:', error);
    return '';
  }
};

/**
 * Blueprint for Notion property mapping.
 */
export const mapNotionToBlogPost = (notionPage: any): BlogPost => {
  return {
    id: notionPage.id,
    notionId: notionPage.id,
    title: notionPage.properties.Title?.title[0]?.plain_text || 'Untitled_Entry',
    category: notionPage.properties.Category?.select?.name || 'GENERIC',
    date: notionPage.properties.Date?.date?.start || new Date().toISOString().split('T')[0],
    excerpt: notionPage.properties.Summary?.rich_text[0]?.plain_text || '',
    tags: notionPage.properties.Tags?.multi_select?.map((t: any) => t.name) || [],
    link: notionPage.url,
    image: notionPage.cover?.external?.url || notionPage.cover?.file?.url,
    status: notionPage.properties.Status?.status?.name || 'Published',
  };
};