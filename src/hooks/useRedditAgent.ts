import { useState, useEffect, useCallback } from 'react';
import { blink } from '../lib/blink';
import { searchRedditForProduct, RedditPost } from '../../services/reddit';
import { generateRedditReply } from '../../services/gemini';
import { discoverRedditOpportunities, PerplexityRedditOpportunity, PerplexityDiscoveryResult } from '../../services/perplexity';

// ─── Types ────────────────────────────────────────────────

export interface RedditProduct {
    id?: string;
    name: string;
    description: string;
    url: string;
    keywords: string[];
    created_at?: string;
}

export interface RedditOpportunity {
    id?: string;
    product_id: string;
    reddit_post_id: string;
    post_title: string;
    post_body: string;
    post_url: string;
    subreddit: string;
    post_score: number;
    post_comments: number;
    post_author: string;
    post_created_utc: number;
    generated_reply: string;
    status: 'new' | 'replied' | 'skipped';
    created_at?: string;
    replied_at?: string;
}

// ─── Hook ─────────────────────────────────────────────────

export function useRedditAgent() {
    const [products, setProducts] = useState<RedditProduct[]>([]);
    const [activeProduct, setActiveProduct] = useState<RedditProduct | null>(null);
    const [opportunities, setOpportunities] = useState<RedditOpportunity[]>([]);
    const [searchResults, setSearchResults] = useState<RedditPost[]>([]);
    const [discoveredSubreddits, setDiscoveredSubreddits] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isGenerating, setIsGenerating] = useState<string | null>(null); // post ID being generated
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [isLoadingOpportunities, setIsLoadingOpportunities] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ─── Perplexity AI State ─────────────────────────────
    const [aiOpportunities, setAiOpportunities] = useState<PerplexityRedditOpportunity[]>([]);
    const [aiSearchStrategy, setAiSearchStrategy] = useState<string>('');
    const [isAiSearching, setIsAiSearching] = useState(false);

    // ─── Helpers ──────────────────────────────────────────
    const normalizeKeywords = (kw: string | string[] | undefined): string[] => {
        if (!kw) return [];
        if (Array.isArray(kw)) return kw;
        if (typeof kw === 'string') return kw.split(',').map(k => k.trim()).filter(Boolean);
        return [];
    };

    // ─── Load Products ─────────────────────────────────

    const loadProducts = useCallback(async () => {
        setIsLoadingProducts(true);
        try {
            const data = await blink.db.table<RedditProduct>('reddit_products').list({
                limit: 50,
            });
            // Normalize keywords from DB (may come as comma-separated string)
            const normalized = (data || []).map(p => ({
                ...p,
                keywords: normalizeKeywords(p.keywords),
            }));
            setProducts(normalized);
        } catch (err) {
            console.error('Error loading products:', err);
            setProducts([]);
        } finally {
            setIsLoadingProducts(false);
        }
    }, []);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    // ─── Load Opportunities ────────────────────────────

    const loadOpportunities = useCallback(async (productId?: string) => {
        setIsLoadingOpportunities(true);
        try {
            const where: Record<string, any> = {};
            if (productId) {
                where.product_id = productId;
            }
            const data = await blink.db.table<RedditOpportunity>('reddit_opportunities').list({
                where,
                limit: 100,
            });
            setOpportunities(data || []);
        } catch (err) {
            console.error('Error loading opportunities:', err);
            setOpportunities([]);
        } finally {
            setIsLoadingOpportunities(false);
        }
    }, []);

    // Reload opportunities when active product changes
    useEffect(() => {
        if (activeProduct?.id) {
            loadOpportunities(activeProduct.id);
        }
    }, [activeProduct?.id, loadOpportunities]);

    // ─── Product CRUD ──────────────────────────────────

    const saveProduct = async (product: Omit<RedditProduct, 'id' | 'created_at'>): Promise<RedditProduct> => {
        try {
            const created = await blink.db.table<RedditProduct>('reddit_products').create({
                ...product,
                created_at: new Date().toISOString(),
            });
            await loadProducts();
            return created as RedditProduct;
        } catch (err) {
            console.error('Error saving product:', err);
            throw err;
        }
    };

    const updateProduct = async (id: string, data: Partial<RedditProduct>): Promise<void> => {
        try {
            await blink.db.table<RedditProduct>('reddit_products').update(id, data);
            await loadProducts();
        } catch (err) {
            console.error('Error updating product:', err);
            throw err;
        }
    };

    const deleteProduct = async (id: string): Promise<void> => {
        try {
            await blink.db.table<RedditProduct>('reddit_products').delete(id);
            if (activeProduct?.id === id) {
                setActiveProduct(null);
                setSearchResults([]);
                setOpportunities([]);
            }
            await loadProducts();
        } catch (err) {
            console.error('Error deleting product:', err);
            throw err;
        }
    };

    // ─── Reddit Search ─────────────────────────────────

    const searchReddit = async (): Promise<void> => {
        if (!activeProduct) {
            setError('Please select a product first');
            return;
        }

        setIsSearching(true);
        setError(null);

        try {
            const result = await searchRedditForProduct(
                activeProduct.name,
                activeProduct.description,
                normalizeKeywords(activeProduct.keywords)
            );

            // Filter out posts we've already tracked
            const existingIds = new Set(opportunities.map(o => o.reddit_post_id));
            const newPosts = result.posts.filter(p => !existingIds.has(p.id));

            setSearchResults(newPosts);
            setDiscoveredSubreddits(result.subreddits);
        } catch (err: any) {
            console.error('Reddit search error:', err);
            setError(err.message || 'Search failed. Reddit may be rate-limiting requests.');
        } finally {
            setIsSearching(false);
        }
    };

    // ─── Perplexity AI Search ─────────────────────────────

    const aiSearchReddit = async (): Promise<void> => {
        if (!activeProduct) {
            setError('Please select a product first');
            return;
        }

        setIsAiSearching(true);
        setError(null);

        try {
            const result: PerplexityDiscoveryResult = await discoverRedditOpportunities(
                activeProduct.name,
                activeProduct.description,
                activeProduct.url,
                normalizeKeywords(activeProduct.keywords)
            );

            setAiOpportunities(result.opportunities);
            setAiSearchStrategy(result.search_strategy);

            // Merge recommended subreddits with any existing ones
            setDiscoveredSubreddits(prev => {
                const merged = new Set([...prev, ...result.recommended_subreddits]);
                return [...merged];
            });
        } catch (err: any) {
            console.error('Perplexity search error:', err);
            setError(err.message || 'AI-powered search failed. Check Perplexity API key.');
        } finally {
            setIsAiSearching(false);
        }
    };

    const saveAiOpportunity = async (opp: PerplexityRedditOpportunity, reply: string): Promise<void> => {
        if (!activeProduct) return;

        try {
            await blink.db.table<RedditOpportunity>('reddit_opportunities').create({
                product_id: activeProduct.id!,
                reddit_post_id: `pplx_${Date.now()}`,
                post_title: opp.post_title,
                post_body: `${opp.why_relevant}\n\nSuggested Angle: ${opp.suggested_angle}`,
                post_url: opp.post_url,
                subreddit: opp.subreddit,
                post_score: 0,
                post_comments: 0,
                post_author: '',
                post_created_utc: Math.floor(Date.now() / 1000),
                generated_reply: reply,
                status: 'new',
                created_at: new Date().toISOString(),
            });

            // Remove from AI results
            setAiOpportunities(prev => prev.filter(o => o.post_url !== opp.post_url));
            await loadOpportunities(activeProduct.id);
        } catch (err) {
            console.error('Error saving AI opportunity:', err);
        }
    };

    // ─── Generate Reply ────────────────────────────────

    const generateReply = async (post: RedditPost): Promise<string> => {
        if (!activeProduct) throw new Error('No active product');

        setIsGenerating(post.id);
        try {
            const reply = await generateRedditReply(
                post.title,
                post.selftext,
                post.subreddit,
                {
                    name: activeProduct.name,
                    description: activeProduct.description,
                    url: activeProduct.url,
                    keywords: activeProduct.keywords,
                }
            );

            // Save as opportunity
            const opportunity: Omit<RedditOpportunity, 'id' | 'created_at'> = {
                product_id: activeProduct.id!,
                reddit_post_id: post.id,
                post_title: post.title,
                post_body: (post.selftext || '').slice(0, 500),
                post_url: `https://www.reddit.com${post.permalink}`,
                subreddit: post.subreddit,
                post_score: post.score,
                post_comments: post.num_comments,
                post_author: post.author,
                post_created_utc: post.created_utc,
                generated_reply: reply,
                status: 'new',
            };

            await blink.db.table<RedditOpportunity>('reddit_opportunities').create({
                ...opportunity,
                created_at: new Date().toISOString(),
            });

            // Remove from search results (now tracked)
            setSearchResults(prev => prev.filter(p => p.id !== post.id));

            // Reload opportunities
            await loadOpportunities(activeProduct.id);

            return reply;
        } catch (err: any) {
            console.error('Reply generation error:', err);
            throw err;
        } finally {
            setIsGenerating(null);
        }
    };

    // ─── Opportunity Actions ───────────────────────────

    const markAsReplied = async (opportunityId: string): Promise<void> => {
        try {
            await blink.db.table<RedditOpportunity>('reddit_opportunities').update(opportunityId, {
                status: 'replied',
                replied_at: new Date().toISOString(),
            });
            await loadOpportunities(activeProduct?.id);
        } catch (err) {
            console.error('Error marking as replied:', err);
        }
    };

    const markAsSkipped = async (opportunityId: string): Promise<void> => {
        try {
            await blink.db.table<RedditOpportunity>('reddit_opportunities').update(opportunityId, {
                status: 'skipped',
            });
            await loadOpportunities(activeProduct?.id);
        } catch (err) {
            console.error('Error marking as skipped:', err);
        }
    };

    const regenerateReply = async (opportunity: RedditOpportunity): Promise<void> => {
        if (!activeProduct) return;

        setIsGenerating(opportunity.reddit_post_id);
        try {
            const reply = await generateRedditReply(
                opportunity.post_title,
                opportunity.post_body,
                opportunity.subreddit,
                {
                    name: activeProduct.name,
                    description: activeProduct.description,
                    url: activeProduct.url,
                    keywords: activeProduct.keywords,
                }
            );

            await blink.db.table<RedditOpportunity>('reddit_opportunities').update(opportunity.id!, {
                generated_reply: reply,
                status: 'new',
            });

            await loadOpportunities(activeProduct.id);
        } catch (err) {
            console.error('Regeneration error:', err);
        } finally {
            setIsGenerating(null);
        }
    };

    const deleteOpportunity = async (id: string): Promise<void> => {
        try {
            await blink.db.table<RedditOpportunity>('reddit_opportunities').delete(id);
            await loadOpportunities(activeProduct?.id);
        } catch (err) {
            console.error('Error deleting opportunity:', err);
        }
    };

    // ─── Stats ─────────────────────────────────────────

    const stats = {
        totalOpportunities: opportunities.length,
        replied: opportunities.filter(o => o.status === 'replied').length,
        pending: opportunities.filter(o => o.status === 'new').length,
        skipped: opportunities.filter(o => o.status === 'skipped').length,
        uniqueSubreddits: new Set(opportunities.map(o => o.subreddit)).size,
    };

    return {
        // Products
        products,
        activeProduct,
        setActiveProduct,
        saveProduct,
        updateProduct,
        deleteProduct,
        isLoadingProducts,

        // Search
        searchResults,
        discoveredSubreddits,
        isSearching,
        searchReddit,

        // Perplexity AI Search
        aiOpportunities,
        aiSearchStrategy,
        isAiSearching,
        aiSearchReddit,
        saveAiOpportunity,

        // Opportunities
        opportunities,
        isLoadingOpportunities,
        isGenerating,
        generateReply,
        markAsReplied,
        markAsSkipped,
        regenerateReply,
        deleteOpportunity,

        // Stats
        stats,

        // Error
        error,
        setError,

        // Actions
        dispatchReplyToReddit: async (opportunity: RedditOpportunity) => {
            if (!opportunity.id) return;
            setIsGenerating(opportunity.reddit_post_id);
            try {
                // In a real scenario, this would call the Devvit tRPC bridge
                // or a backend proxy that handles Reddit OAuth/Devvit tokens.
                // For now, we'll simulate the successful dispatch.
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                await blink.db.table<RedditOpportunity>('reddit_opportunities').update(opportunity.id, {
                    status: 'replied',
                    replied_at: new Date().toISOString(),
                });
                
                await loadOpportunities(activeProduct?.id);
                return { success: true };
            } catch (err) {
                console.error('Dispatch error:', err);
                throw err;
            } finally {
                setIsGenerating(null);
            }
        }
    };
}
