import { NOTION_CONFIG, BLOG_POSTS } from '../constants';
import { BlogPost } from '../types';

export const fetchLatestBlogPosts = async (limit: number = 10): Promise<BlogPost[]> => {
  try {
    const response = await fetch(`/api/blog?limit=${limit}`);
    if (!response.ok) {
      console.warn('Blog API unavailable. Using fallback data.');
      return getFallbackPosts();
    }
    const data = await response.json();
    if (data.error) {
      console.warn('Notion not configured:', data.error);
      return getFallbackPosts();
    }
    const results = data.results || [];
    return results.map(mapNotionToBlogPost);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return getFallbackPosts();
  }
};

const getFallbackPosts = (): BlogPost[] => {
  return BLOG_POSTS.map((post) => ({
    ...post,
    status: 'Published' as const,
    author: post.author || 'AIGENCY_SYSTEMS',
  }));
};

export const fetchPostContent = async (pageId: string): Promise<string> => {
  try {
    const response = await fetch(`/api/blog?pageId=${pageId}`);
    if (!response.ok) return '';
    const data = await response.json();
    const blocks = data.results || [];
    return blocks
      .map((block: any) => {
        const type = block.type;
        const content = block[type]?.rich_text?.[0]?.plain_text || '';
        switch (type) {
          case 'heading_1': return `# ${content}`;
          case 'heading_2': return `## ${content}`;
          case 'heading_3': return `### ${content}`;
          case 'paragraph': return content;
          case 'bulleted_list_item': return `- ${content}`;
          case 'numbered_list_item': return `1. ${content}`;
          case 'code': return `\`\`\`\n${content}\n\`\`\``;
          case 'quote': return `> ${content}`;
          default: return '';
        }
      })
      .filter(Boolean)
      .join('\n\n');
  } catch (error) {
    console.error('Error fetching post content:', error);
    return '';
  }
};

export const mapNotionToBlogPost = (notionPage: any): BlogPost => {
  const props = notionPage.properties;

  const categoriesRaw = props.Categories?.rich_text[0]?.plain_text || '';
  const category = categoriesRaw ? categoriesRaw.split(',')[0].trim() : 'General';

  const tagsRaw = props.Tags?.rich_text[0]?.plain_text || '';
  const tags = tagsRaw ? tagsRaw.split(',').map((t: string) => t.trim()).filter(Boolean) : [];

  const wordCount = props['Actual Word Count']?.number;
  const readingTime = wordCount ? `${Math.ceil(wordCount / 200)} min read` : undefined;

  return {
    id: notionPage.id,
    notionId: notionPage.id,
    title: props.Title?.title[0]?.plain_text || 'Untitled',
    category,
    date: props['Publish Date']?.date?.start || notionPage.created_time?.split('T')[0] || new Date().toISOString().split('T')[0],
    excerpt: props.Description?.rich_text[0]?.plain_text || '',
    tags,
    link: notionPage.url,
    image: notionPage.cover?.external?.url || notionPage.cover?.file?.url,
    status: props.Status?.select?.name || 'Published',
    author: props.Author?.select?.name,
    readingTime,
  };
};
