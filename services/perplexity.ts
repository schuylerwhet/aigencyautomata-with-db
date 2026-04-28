

const API_KEY = process.env.VITE_PERPLEXITY_API_KEY || process.env.PERPLEXITY_API_KEY || "";


export const searchPerplexity = async (query: string): Promise<string> => {
    if (!API_KEY) {
        console.error("Perplexity API Key is missing");
        return "Error: API Key missing";
    }

    try {
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'sonar-pro',
                messages: [
                    { role: 'system', content: 'You are a helpful research assistant. Return only the requested data.' },
                    { role: 'user', content: query }
                ],
                max_tokens: 1000 // Reasonable limit
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Perplexity API Error: ${response.status} ${errText}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "";
    } catch (error) {
        console.error("Perplexity Search Error:", error);
        return "";
    }
};

// ─── Reddit Opportunity Discovery ─────────────────────────────────────────────

export interface PerplexityRedditOpportunity {
    post_title: string;
    post_url: string;
    subreddit: string;
    why_relevant: string;
    suggested_angle: string;
    urgency: 'high' | 'medium' | 'low';
}

export interface PerplexityDiscoveryResult {
    opportunities: PerplexityRedditOpportunity[];
    recommended_subreddits: string[];
    search_strategy: string;
}

export const discoverRedditOpportunities = async (
    productName: string,
    productDescription: string,
    productUrl: string,
    keywords: string[]
): Promise<PerplexityDiscoveryResult> => {
    const prompt = `You are a Reddit growth expert. Find recent Reddit posts where someone could naturally mention "${productName}" as a helpful solution.

Product: ${productName}
Description: ${productDescription}
URL: ${productUrl}
Keywords: ${keywords.join(', ')}

Search Reddit for posts in the last 7 days where people are asking about problems this product solves. Return a JSON object with this exact structure:
{
  "opportunities": [
    {
      "post_title": "exact post title",
      "post_url": "https://reddit.com/r/subreddit/comments/...",
      "subreddit": "subredditname",
      "why_relevant": "why this post is relevant",
      "suggested_angle": "how to naturally mention the product",
      "urgency": "high|medium|low"
    }
  ],
  "recommended_subreddits": ["subreddit1", "subreddit2"],
  "search_strategy": "brief description of the search strategy used"
}

Return ONLY the JSON object, no other text.`;

    try {
        const responseText = await searchPerplexity(prompt);
        // Extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in Perplexity response');
        }
        const result = JSON.parse(jsonMatch[0]) as PerplexityDiscoveryResult;
        return {
            opportunities: result.opportunities || [],
            recommended_subreddits: result.recommended_subreddits || [],
            search_strategy: result.search_strategy || '',
        };
    } catch (error) {
        console.error('Error discovering Reddit opportunities:', error);
        return {
            opportunities: [],
            recommended_subreddits: [],
            search_strategy: 'Search failed - check Perplexity API key',
        };
    }
};
