/**
 * Reddit Public JSON API Service
 * Uses Reddit's public .json endpoints — no OAuth required.
 * Rate-limited client-side; respects Reddit ToS.
 */

export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  subreddit: string;
  subreddit_name_prefixed: string;
  author: string;
  score: number;
  num_comments: number;
  created_utc: number;
  permalink: string;
  url: string;
  is_self: boolean;
}

export interface RedditSearchResult {
  posts: RedditPost[];
  subreddits: string[];
  query: string;
  timestamp: number;
}

const REDDIT_BASE = 'https://www.reddit.com';
const USER_AGENT_HEADER = 'AigencyAutomata/1.0 (Reddit Growth Agent)';

/**
 * Delays execution to respect rate limits.
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetches JSON from Reddit's public API.
 */
const fetchRedditJSON = async (url: string): Promise<any> => {
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 429) {
      // Rate limited — wait and retry once
      await delay(2000);
      const retry = await fetch(url, {
        headers: { 'Accept': 'application/json' },
      });
      if (!retry.ok) throw new Error(`Reddit API error: ${retry.status}`);
      return retry.json();
    }
    throw new Error(`Reddit API error: ${response.status}`);
  }

  return response.json();
};

/**
 * Maps raw Reddit listing data to our RedditPost interface.
 */
const mapRedditPosts = (listing: any): RedditPost[] => {
  if (!listing?.data?.children) return [];
  
  return listing.data.children
    .filter((child: any) => child.kind === 't3') // t3 = link/post
    .map((child: any) => {
      const d = child.data;
      return {
        id: d.id,
        title: d.title || '',
        selftext: (d.selftext || '').slice(0, 1000), // Cap body length
        subreddit: d.subreddit,
        subreddit_name_prefixed: d.subreddit_name_prefixed || `r/${d.subreddit}`,
        author: d.author,
        score: d.score || 0,
        num_comments: d.num_comments || 0,
        created_utc: d.created_utc,
        permalink: d.permalink,
        url: d.url,
        is_self: d.is_self,
      };
    });
};

/**
 * Search Reddit for posts matching a query.
 * Uses Reddit's /search.json endpoint.
 */
export const searchReddit = async (
  query: string,
  options: {
    sort?: 'relevance' | 'hot' | 'new' | 'top' | 'comments';
    timeframe?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
    limit?: number;
    subreddit?: string;
  } = {}
): Promise<RedditSearchResult> => {
  const {
    sort = 'relevance',
    timeframe = 'month',
    limit = 25,
    subreddit,
  } = options;

  const encodedQuery = encodeURIComponent(query);
  
  let url: string;
  if (subreddit) {
    url = `${REDDIT_BASE}/r/${subreddit}/search.json?q=${encodedQuery}&sort=${sort}&t=${timeframe}&limit=${limit}&restrict_sr=on`;
  } else {
    url = `${REDDIT_BASE}/search.json?q=${encodedQuery}&sort=${sort}&t=${timeframe}&limit=${limit}`;
  }

  const data = await fetchRedditJSON(url);
  const posts = mapRedditPosts(data);

  // Extract unique subreddits from results
  const subreddits = [...new Set(posts.map(p => p.subreddit))];

  return {
    posts,
    subreddits,
    query,
    timestamp: Date.now(),
  };
};

/**
 * Find relevant subreddits for a given topic/keyword.
 * Searches and extracts unique subreddits from results.
 */
export const findRelevantSubreddits = async (
  keywords: string[]
): Promise<{ name: string; postCount: number }[]> => {
  const subredditMap: Record<string, number> = {};

  for (const keyword of keywords.slice(0, 5)) { // Max 5 keywords to avoid rate limiting
    try {
      const result = await searchReddit(keyword, { limit: 25, timeframe: 'month' });
      for (const post of result.posts) {
        subredditMap[post.subreddit] = (subredditMap[post.subreddit] || 0) + 1;
      }
      await delay(500); // Rate limit buffer between requests
    } catch (e) {
      console.warn(`Failed to search keyword "${keyword}":`, e);
    }
  }

  return Object.entries(subredditMap)
    .map(([name, postCount]) => ({ name, postCount }))
    .sort((a, b) => b.postCount - a.postCount);
};

/**
 * Multi-keyword search combining results from product keywords.
 */
export const searchRedditForProduct = async (
  productName: string,
  productDescription: string,
  keywords: string[]
): Promise<RedditSearchResult> => {
  const allPosts: RedditPost[] = [];
  const allSubreddits = new Set<string>();
  const seenIds = new Set<string>();

  // Search strategies: product name, keywords, description snippet
  const queries = [
    productName,
    ...keywords.slice(0, 3),
    productDescription.split('.')[0]?.slice(0, 100), // First sentence of description
  ].filter(Boolean);

  for (const query of queries) {
    try {
      const result = await searchReddit(query, {
        sort: 'relevance',
        timeframe: 'month',
        limit: 15,
      });

      for (const post of result.posts) {
        if (!seenIds.has(post.id)) {
          seenIds.add(post.id);
          allPosts.push(post);
          allSubreddits.add(post.subreddit);
        }
      }
      await delay(600); // Rate limit buffer
    } catch (e) {
      console.warn(`Search failed for "${query}":`, e);
    }
  }

  // Sort by a composite relevance score
  allPosts.sort((a, b) => {
    const scoreA = a.score + a.num_comments * 2;
    const scoreB = b.score + b.num_comments * 2;
    return scoreB - scoreA;
  });

  return {
    posts: allPosts.slice(0, 50), // Cap total results
    subreddits: [...allSubreddits],
    query: queries.join(' | '),
    timestamp: Date.now(),
  };
};

/**
 * Format a Reddit post URL.
 */
export const getRedditPostUrl = (permalink: string): string => {
  return `https://www.reddit.com${permalink}`;
};

/**
 * Format relative time from UTC timestamp.
 */
export const getRelativeTime = (utcTimestamp: number): string => {
  const now = Date.now() / 1000;
  const diff = now - utcTimestamp;

  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)}w ago`;
  return `${Math.floor(diff / 2592000)}mo ago`;
};
