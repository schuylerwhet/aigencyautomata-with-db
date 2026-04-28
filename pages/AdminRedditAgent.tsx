import React, { useState } from 'react';
import PortalLayout from '../components/PortalLayout';
import {
    Search,
    Radar,
    Plus,
    Trash2,
    ExternalLink,
    Copy,
    Check,
    CheckCircle2,
    XCircle,
    RefreshCw,
    Sparkles,
    ArrowUpRight,
    MessageSquare,
    TrendingUp,
    Target,
    Eye,
    EyeOff,
    ChevronDown,
    ChevronUp,
    Package,
    Globe,
    Tag,
    Hash,
    Loader2,
    AlertCircle,
    Zap,
    Brain,
    Lightbulb,
    Shield,
    Pencil,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../src/components/ui/card';
import { Button } from '../src/components/ui/button';
import { cn } from '../src/lib/utils';
import { useRedditAgent, RedditProduct, RedditOpportunity } from '../src/hooks/useRedditAgent';
import { RedditPost, getRelativeTime } from '../services/reddit';
import { PerplexityRedditOpportunity } from '../services/perplexity';
import { generateRedditReply as generateRedditReplyDirect } from '../services/gemini';

// ─── Product Form ─────────────────────────────────────

const ProductForm: React.FC<{
    onSave: (product: Omit<RedditProduct, 'id' | 'created_at'>) => Promise<void>;
    onCancel: () => void;
    initial?: RedditProduct;
}> = ({ onSave, onCancel, initial }) => {
    const [name, setName] = useState(initial?.name || '');
    const [description, setDescription] = useState(initial?.description || '');
    const [url, setUrl] = useState(initial?.url || '');
    const [keywordsStr, setKeywordsStr] = useState(initial?.keywords?.join(', ') || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !description.trim()) return;

        setIsSaving(true);
        try {
            await onSave({
                name: name.trim(),
                description: description.trim(),
                url: url.trim(),
                keywords: keywordsStr.split(',').map(k => k.trim()).filter(Boolean),
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block">
                        Product / Service Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. AigencyAutomata"
                        className="w-full bg-white/5 border border-white/10 rounded px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600/50 focus:ring-1 focus:ring-red-600/20 transition-all font-mono"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block">
                        URL
                    </label>
                    <input
                        type="url"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        placeholder="https://yourproduct.com"
                        className="w-full bg-white/5 border border-white/10 rounded px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600/50 focus:ring-1 focus:ring-red-600/20 transition-all font-mono"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block">
                    Description
                </label>
                <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe your product/service and what problems it solves..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600/50 focus:ring-1 focus:ring-red-600/20 transition-all font-mono resize-none"
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block">
                    Search Keywords <span className="text-gray-700">(comma-separated)</span>
                </label>
                <input
                    type="text"
                    value={keywordsStr}
                    onChange={e => setKeywordsStr(e.target.value)}
                    placeholder="ai automation, marketing agency, chatbot integration"
                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600/50 focus:ring-1 focus:ring-red-600/20 transition-all font-mono"
                />
            </div>

            <div className="flex items-center space-x-3 pt-2">
                <Button
                    type="submit"
                    disabled={isSaving || !name.trim() || !description.trim()}
                    className="bg-red-600 hover:bg-red-700 text-white text-[10px] uppercase tracking-widest font-bold h-9 px-6"
                >
                    {isSaving ? (
                        <><Loader2 size={12} className="mr-2 animate-spin" /> Saving...</>
                    ) : initial ? (
                        <><Check size={12} className="mr-2" /> Update Product</>
                    ) : (
                        <><Plus size={12} className="mr-2" /> Save Product</>
                    )}
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    className="text-gray-500 hover:text-white text-[10px] uppercase tracking-widest h-9"
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
};

// ─── Search Result Card ───────────────────────────────

const SearchResultCard: React.FC<{
    post: RedditPost;
    onGenerateReply: (post: RedditPost) => void;
    isGenerating: boolean;
}> = ({ post, onGenerateReply, isGenerating }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="group border border-white/5 rounded-lg hover:border-red-600/20 transition-all duration-300 bg-white/[0.02] hover:bg-white/[0.04]">
            <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-red-600 bg-red-600/10 px-2 py-0.5 rounded border border-red-600/20">
                                r/{post.subreddit}
                            </span>
                            <span className="text-[10px] text-gray-600 font-mono">
                                {getRelativeTime(post.created_utc)}
                            </span>
                            <span className="text-[10px] text-gray-600 font-mono">
                                by u/{post.author}
                            </span>
                        </div>

                        <h4 className="text-sm font-bold text-gray-200 leading-snug mb-2 group-hover:text-white transition-colors">
                            {post.title}
                        </h4>

                        <div className="flex items-center space-x-4 text-[10px] text-gray-500 font-mono">
                            <span className="flex items-center space-x-1">
                                <ArrowUpRight size={10} className="text-green-500" />
                                <span>{post.score} pts</span>
                            </span>
                            <span className="flex items-center space-x-1">
                                <MessageSquare size={10} />
                                <span>{post.num_comments} comments</span>
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2 shrink-0">
                        <Button
                            size="sm"
                            onClick={() => onGenerateReply(post)}
                            disabled={isGenerating}
                            className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 text-[10px] uppercase tracking-widest font-bold h-8 px-4 transition-all"
                        >
                            {isGenerating ? (
                                <><Loader2 size={10} className="mr-1.5 animate-spin" /> Generating</>
                            ) : (
                                <><Sparkles size={10} className="mr-1.5" /> Generate Reply</>
                            )}
                        </Button>
                        <a
                            href={`https://www.reddit.com${post.permalink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-gray-600 hover:text-red-500 font-mono flex items-center space-x-1 transition-colors"
                        >
                            <ExternalLink size={10} />
                            <span>View on Reddit</span>
                        </a>
                    </div>
                </div>

                {post.selftext && (
                    <div className="mt-3">
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="flex items-center space-x-1 text-[10px] text-gray-500 hover:text-gray-300 font-mono transition-colors"
                        >
                            {expanded ? <EyeOff size={10} /> : <Eye size={10} />}
                            <span>{expanded ? 'Hide' : 'Show'} post body</span>
                            {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                        </button>
                        {expanded && (
                            <p className="text-xs text-gray-500 mt-2 leading-relaxed bg-white/[0.02] rounded p-3 border border-white/5 font-mono">
                                {post.selftext.length > 500 ? post.selftext.slice(0, 500) + '...' : post.selftext}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── AI Opportunity Card ────────────────────────────

const AiOpportunityCard: React.FC<{
    opportunity: PerplexityRedditOpportunity;
    onGenerateReply: (opp: PerplexityRedditOpportunity) => void;
    isGenerating: boolean;
}> = ({ opportunity, onGenerateReply, isGenerating }) => {
    const potentialConfig = {
        high: { label: 'High Potential', color: 'text-green-400 bg-green-500/10 border-green-500/20', icon: Zap },
        medium: { label: 'Medium', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', icon: Target },
        low: { label: 'Low', color: 'text-gray-400 bg-gray-500/10 border-gray-500/20', icon: Shield },
    };
    const potential = potentialConfig[opportunity.urgency] || potentialConfig.medium;

    return (
        <div className="group border border-purple-500/10 rounded-lg hover:border-purple-500/30 transition-all duration-300 bg-purple-500/[0.02] hover:bg-purple-500/[0.04]">
            <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2 flex-wrap gap-y-1">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-red-600 bg-red-600/10 px-2 py-0.5 rounded border border-red-600/20">
                                r/{opportunity.subreddit}
                            </span>
                            <span className={cn("text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border flex items-center space-x-1", potential.color)}>
                                <potential.icon size={8} />
                                <span>{potential.label}</span>
                            </span>
                            <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 flex items-center space-x-1">
                                <Brain size={8} />
                                <span>AI Found</span>
                            </span>
                        </div>

                        <h4 className="text-sm font-bold text-gray-200 leading-snug mb-2 group-hover:text-white transition-colors">
                            {opportunity.post_title}
                        </h4>

                        <p className="text-[11px] text-gray-500 font-mono leading-relaxed mb-2">
                            <span className="text-gray-400">Why relevant:</span> {opportunity.why_relevant}
                        </p>

                        <div className="bg-purple-500/5 rounded px-3 py-2 border border-purple-500/10">
                            <p className="text-[10px] font-mono uppercase tracking-widest text-purple-400 mb-1 flex items-center space-x-1">
                                <Lightbulb size={10} />
                                <span>Suggested Angle</span>
                            </p>
                            <p className="text-[11px] text-gray-400 font-mono">{opportunity.suggested_angle}</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2 shrink-0">
                        <Button
                            size="sm"
                            onClick={() => onGenerateReply(opportunity)}
                            disabled={isGenerating}
                            className="bg-purple-600/10 hover:bg-purple-600 text-purple-400 hover:text-white border border-purple-500/20 text-[10px] uppercase tracking-widest font-bold h-8 px-4 transition-all"
                        >
                            {isGenerating ? (
                                <><Loader2 size={10} className="mr-1.5 animate-spin" /> Generating</>
                            ) : (
                                <><Sparkles size={10} className="mr-1.5" /> Generate Reply</>
                            )}
                        </Button>
                        {opportunity.post_url && (
                            <a
                                href={opportunity.post_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-gray-600 hover:text-purple-400 font-mono flex items-center space-x-1 transition-colors"
                            >
                                <ExternalLink size={10} />
                                <span>View on Reddit</span>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Opportunity Row ──────────────────────────────────

const OpportunityRow: React.FC<{
    opportunity: RedditOpportunity;
    onMarkReplied: (id: string) => void;
    onMarkSkipped: (id: string) => void;
    onRegenerate: (opp: RedditOpportunity) => void;
    onDispatch: (opp: RedditOpportunity) => void;
    onDelete: (id: string) => void;
    isRegenerating: boolean;
}> = ({ opportunity, onMarkReplied, onMarkSkipped, onRegenerate, onDispatch, onDelete, isRegenerating }) => {
    const [expanded, setExpanded] = useState(false);
    const [copied, setCopied] = useState(false);

    const copyReply = async () => {
        await navigator.clipboard.writeText(opportunity.generated_reply);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const statusConfig = {
        new: { label: 'Pending', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' },
        replied: { label: 'Replied', color: 'text-green-500 bg-green-500/10 border-green-500/20' },
        skipped: { label: 'Skipped', color: 'text-gray-500 bg-gray-500/10 border-gray-500/20' },
    };

    const status = statusConfig[opportunity.status];

    return (
        <div className={cn(
            "border-b border-white/5 transition-colors",
            opportunity.status === 'new' ? 'hover:bg-white/[0.03]' : 'opacity-60 hover:opacity-100'
        )}>
            <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1.5">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-red-600 bg-red-600/10 px-2 py-0.5 rounded border border-red-600/20">
                                r/{opportunity.subreddit}
                            </span>
                            <span className={cn("text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border", status.color)}>
                                {status.label}
                            </span>
                        </div>
                        <h4
                            className="text-sm font-bold text-gray-300 leading-snug cursor-pointer hover:text-white transition-colors"
                            onClick={() => setExpanded(!expanded)}
                        >
                            {opportunity.post_title}
                        </h4>
                        <div className="flex items-center space-x-4 mt-1 text-[10px] text-gray-600 font-mono">
                            <span>{opportunity.post_score} pts</span>
                            <span>{opportunity.post_comments} comments</span>
                            <span>by u/{opportunity.post_author}</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                        {opportunity.status === 'new' && (
                            <>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onDispatch(opportunity)}
                                    className="text-gray-500 hover:text-blue-500 h-7 px-2"
                                    title="Dispatch to Reddit via Devvit"
                                >
                                    <Zap size={14} className={isRegenerating ? "animate-pulse" : ""} />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={copyReply}
                                    className="text-gray-500 hover:text-white h-7 px-2"
                                    title="Copy reply to clipboard"
                                >
                                    {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onMarkReplied(opportunity.id!)}
                                    className="text-gray-500 hover:text-green-500 h-7 px-2"
                                    title="Mark as replied"
                                >
                                    <CheckCircle2 size={14} />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onMarkSkipped(opportunity.id!)}
                                    className="text-gray-500 hover:text-yellow-500 h-7 px-2"
                                    title="Skip this post"
                                >
                                    <XCircle size={14} />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onRegenerate(opportunity)}
                                    disabled={isRegenerating}
                                    className="text-gray-500 hover:text-red-500 h-7 px-2"
                                    title="Regenerate reply"
                                >
                                    {isRegenerating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                </Button>
                            </>
                        )}
                        <a
                            href={opportunity.post_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-red-500 transition-colors"
                            title="Open on Reddit"
                        >
                            <ExternalLink size={14} />
                        </a>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDelete(opportunity.id!)}
                            className="text-gray-500 hover:text-red-600 h-7 px-2"
                            title="Delete"
                        >
                            <Trash2 size={14} />
                        </Button>
                    </div>
                </div>

                {expanded && (
                    <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        {opportunity.post_body && (
                            <div className="bg-white/[0.02] rounded p-3 border border-white/5">
                                <p className="text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-1">Original Post</p>
                                <p className="text-xs text-gray-500 font-mono leading-relaxed">{opportunity.post_body}</p>
                            </div>
                        )}
                        <div className="bg-red-600/5 rounded p-3 border border-red-600/10">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-[10px] font-mono uppercase tracking-widest text-red-600">Generated Reply</p>
                                <button onClick={copyReply} className="text-[10px] text-gray-500 hover:text-white font-mono flex items-center space-x-1 transition-colors">
                                    {copied ? <Check size={10} /> : <Copy size={10} />}
                                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                                </button>
                            </div>
                            <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{opportunity.generated_reply}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────

const AdminRedditAgent: React.FC = () => {
    const {
        products,
        activeProduct,
        setActiveProduct,
        saveProduct,
        updateProduct,
        deleteProduct,
        isLoadingProducts,
        searchResults,
        discoveredSubreddits,
        isSearching,
        searchReddit,
        aiOpportunities,
        aiSearchStrategy,
        isAiSearching,
        aiSearchReddit,
        saveAiOpportunity,
        opportunities,
        isLoadingOpportunities,
        isGenerating,
        generateReply,
        markAsReplied,
        markAsSkipped,
        regenerateReply,
        dispatchReplyToReddit,
        deleteOpportunity,
        stats,
        error,
        setError,
    } = useRedditAgent();

    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<RedditProduct | null>(null);
    const [activeTab, setActiveTab] = useState<'scanner' | 'history'>('scanner');
    const [aiGeneratingUrl, setAiGeneratingUrl] = useState<string | null>(null);

    const handleSaveProduct = async (product: Omit<RedditProduct, 'id' | 'created_at'>) => {
        if (editingProduct?.id) {
            await updateProduct(editingProduct.id, product);
            setEditingProduct(null);
            // refresh the active product if we edited it
            if (activeProduct?.id === editingProduct.id) {
                setActiveProduct({ ...editingProduct, ...product });
            }
        } else {
            const saved = await saveProduct(product);
            setActiveProduct(saved);
            setShowProductForm(false);
        }
    };

    const handleStartEdit = (product: RedditProduct) => {
        setEditingProduct(product);
        setShowProductForm(false); // close new form if open
    };

    const handleGenerateReply = async (post: RedditPost) => {
        try {
            await generateReply(post);
        } catch {
            setError('Failed to generate reply. Check API key.');
        }
    };

    const handleAiGenerateReply = async (opp: PerplexityRedditOpportunity) => {
        if (!activeProduct) return;
        setAiGeneratingUrl(opp.post_url);
        try {
            const reply = await generateRedditReplyDirect(
                opp.post_title,
                '',
                opp.subreddit,
                {
                    name: activeProduct.name,
                    description: activeProduct.description,
                    url: activeProduct.url,
                    keywords: activeProduct.keywords,
                }
            );
            await saveAiOpportunity(opp, reply);
        } catch {
            setError('Failed to generate reply for AI opportunity.');
        } finally {
            setAiGeneratingUrl(null);
        }
    };

    return (
        <PortalLayout type="admin">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-red-600/10 border border-red-600/20 flex items-center justify-center">
                            <Radar size={20} className="text-red-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tighter">Reddit Growth Agent</h1>
                            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                                Discover · Generate · Engage
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-600/10 border border-red-600/20 rounded-lg px-4 py-3 flex items-center justify-between animate-in fade-in duration-300">
                    <div className="flex items-center space-x-2">
                        <AlertCircle size={14} className="text-red-500" />
                        <span className="text-xs text-red-400 font-mono">{error}</span>
                    </div>
                    <button onClick={() => setError(null)} className="text-red-500 hover:text-white">
                        <XCircle size={14} />
                    </button>
                </div>
            )}

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Opportunities', value: stats.totalOpportunities, icon: Target, color: 'text-red-600' },
                    { label: 'Replied', value: stats.replied, icon: CheckCircle2, color: 'text-green-500' },
                    { label: 'Pending', value: stats.pending, icon: Zap, color: 'text-yellow-500' },
                    { label: 'Subreddits', value: stats.uniqueSubreddits, icon: Hash, color: 'text-blue-400' },
                ].map((stat, i) => (
                    <Card key={i} className="bg-black border-white/10 hover:border-red-600/30 transition-colors">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">{stat.label}</p>
                                    <p className="text-2xl font-bold tracking-tighter">{stat.value}</p>
                                </div>
                                <stat.icon size={18} className={stat.color} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Product Selector + Scanner */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left: Product Profiles */}
                <div className="lg:col-span-4 space-y-4">
                    <Card className="bg-black border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
                            <CardTitle className="text-xs uppercase tracking-widest flex items-center">
                                <Package size={14} className="mr-2 text-red-600" />
                                Products
                            </CardTitle>
                            <Button
                                size="sm"
                                onClick={() => {
                                    setShowProductForm(!showProductForm);
                                    setEditingProduct(null);
                                }}
                                className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 text-[10px] uppercase tracking-widest font-bold h-7 px-3 transition-all"
                            >
                                <Plus size={10} className="mr-1" /> New
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {showProductForm && (
                                <div className="p-5 border-b border-white/5">
                                    <ProductForm
                                        onSave={handleSaveProduct}
                                        onCancel={() => setShowProductForm(false)}
                                    />
                                </div>
                            )}

                            {isLoadingProducts ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 size={20} className="animate-spin text-red-600" />
                                </div>
                            ) : products.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                                    <Package size={32} className="text-gray-700 mb-3" />
                                    <p className="text-xs text-gray-500 font-mono">No products yet</p>
                                    <p className="text-[10px] text-gray-700 font-mono mt-1">Add a product to start scanning Reddit</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {products.map(product => (
                                        <div key={product.id}>
                                            {editingProduct?.id === product.id ? (
                                                <div className="p-5 bg-white/[0.03] border-l-2 border-yellow-500">
                                                    <p className="text-[10px] font-mono uppercase tracking-widest text-yellow-500 mb-3 flex items-center">
                                                        <Pencil size={10} className="mr-1.5" /> Editing {product.name}
                                                    </p>
                                                    <ProductForm
                                                        onSave={handleSaveProduct}
                                                        onCancel={() => setEditingProduct(null)}
                                                        initial={product}
                                                    />
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setActiveProduct(product)}
                                                    className={cn(
                                                        "w-full text-left p-4 transition-all duration-200 group relative",
                                                        activeProduct?.id === product.id
                                                            ? "bg-white/5"
                                                            : "hover:bg-white/[0.03]"
                                                    )}
                                                >
                                                    {activeProduct?.id === product.id && (
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600" />
                                                    )}
                                                    <div className="flex items-start justify-between">
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors truncate">
                                                                {product.name}
                                                            </p>
                                                            <p className="text-[10px] text-gray-600 font-mono mt-1 truncate">
                                                                {product.description.slice(0, 80)}...
                                                            </p>
                                                            {product.keywords?.length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-2">
                                                                    {product.keywords.slice(0, 3).map((kw, i) => (
                                                                        <span key={i} className="text-[9px] font-mono text-gray-600 bg-white/5 px-1.5 py-0.5 rounded">
                                                                            {kw}
                                                                        </span>
                                                                    ))}
                                                                    {product.keywords.length > 3 && (
                                                                        <span className="text-[9px] font-mono text-gray-700">
                                                                            +{product.keywords.length - 3}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleStartEdit(product);
                                                                }}
                                                                className="text-gray-700 hover:text-yellow-500 h-6 w-6 p-0"
                                                            >
                                                                <Pencil size={12} />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    deleteProduct(product.id!);
                                                                }}
                                                                className="text-gray-700 hover:text-red-600 h-6 w-6 p-0"
                                                            >
                                                                <Trash2 size={12} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Discovered Subreddits */}
                    {discoveredSubreddits.length > 0 && (
                        <Card className="bg-black border-white/10">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-xs uppercase tracking-widest flex items-center">
                                    <Globe size={14} className="mr-2 text-red-600" />
                                    Discovered Subreddits
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {discoveredSubreddits.map(sub => (
                                        <a
                                            key={sub}
                                            href={`https://www.reddit.com/r/${sub}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] font-mono text-gray-400 bg-white/5 hover:bg-red-600/10 hover:text-red-500 px-2.5 py-1 rounded border border-white/5 hover:border-red-600/20 transition-all"
                                        >
                                            r/{sub}
                                        </a>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right: Scanner + History */}
                <div className="lg:col-span-8 space-y-4">
                    {/* Tabs + Search */}
                    <div className="flex items-center justify-between">
                        <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
                            {(['scanner', 'history'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={cn(
                                        "text-[10px] font-mono uppercase tracking-widest px-4 py-2 rounded-md transition-all",
                                        activeTab === tab
                                            ? "bg-red-600 text-white"
                                            : "text-gray-500 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {tab === 'scanner' ? (
                                        <span className="flex items-center space-x-1.5">
                                            <Radar size={12} />
                                            <span>Scanner</span>
                                        </span>
                                    ) : (
                                        <span className="flex items-center space-x-1.5">
                                            <TrendingUp size={12} />
                                            <span>History ({opportunities.length})</span>
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {activeTab === 'scanner' && (
                            <div className="flex items-center space-x-2">
                                <Button
                                    onClick={searchReddit}
                                    disabled={isSearching || isAiSearching || !activeProduct}
                                    className="bg-red-600 hover:bg-red-700 text-white text-[10px] uppercase tracking-widest font-bold h-9 px-5"
                                >
                                    {isSearching ? (
                                        <><Loader2 size={12} className="mr-2 animate-spin" /> Scanning...</>
                                    ) : (
                                        <><Search size={12} className="mr-2" /> Basic Search</>
                                    )}
                                </Button>
                                <Button
                                    onClick={aiSearchReddit}
                                    disabled={isAiSearching || isSearching || !activeProduct}
                                    className="bg-purple-600/80 hover:bg-purple-600 text-white text-[10px] uppercase tracking-widest font-bold h-9 px-5 border border-purple-500/30"
                                >
                                    {isAiSearching ? (
                                        <><Loader2 size={12} className="mr-2 animate-spin" /> AI Searching...</>
                                    ) : (
                                        <><Brain size={12} className="mr-2" /> AI Search</>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Scanner Tab */}
                    {activeTab === 'scanner' && (
                        <div className="space-y-4">
                            {/* AI Search Results */}
                            {(isAiSearching || aiOpportunities.length > 0) && (
                                <Card className="bg-black border-purple-500/20">
                                    <CardHeader className="pb-3 border-b border-purple-500/10">
                                        <CardTitle className="text-xs uppercase tracking-widest flex items-center justify-between">
                                            <span className="flex items-center">
                                                <Brain size={14} className="mr-2 text-purple-400" />
                                                AI-Powered Results
                                            </span>
                                            {aiSearchStrategy && (
                                                <span className="text-[9px] font-mono text-purple-400/60 normal-case tracking-normal max-w-[300px] truncate">
                                                    {aiSearchStrategy}
                                                </span>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        {isAiSearching ? (
                                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                                <div className="relative">
                                                    <Brain size={40} className="text-purple-500 animate-pulse" />
                                                    <div className="absolute inset-0 animate-ping">
                                                        <Brain size={40} className="text-purple-500/20" />
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-400 font-mono mt-6">Perplexity AI is searching...</p>
                                                <p className="text-[10px] text-gray-600 font-mono mt-1">
                                                    Finding the best Reddit opportunities with AI intelligence
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3 p-4">
                                                <p className="text-[10px] font-mono text-purple-400/60 uppercase tracking-widest">
                                                    {aiOpportunities.length} AI-discovered opportunities
                                                </p>
                                                {aiOpportunities.map((opp, i) => (
                                                    <AiOpportunityCard
                                                        key={`${opp.post_url}-${i}`}
                                                        opportunity={opp}
                                                        onGenerateReply={handleAiGenerateReply}
                                                        isGenerating={aiGeneratingUrl === opp.post_url}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Basic Search Results */}
                            <Card className="bg-black border-white/10">
                                <CardContent className="p-0">
                                    {!activeProduct ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                            <Target size={40} className="text-gray-800 mb-4" />
                                            <p className="text-sm text-gray-500 font-mono">Select a product to start scanning</p>
                                            <p className="text-[10px] text-gray-700 font-mono mt-1">
                                                Choose or create a product profile from the left panel
                                            </p>
                                        </div>
                                    ) : isSearching ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                            <div className="relative">
                                                <Radar size={40} className="text-red-600 animate-pulse" />
                                                <div className="absolute inset-0 animate-ping">
                                                    <Radar size={40} className="text-red-600/30" />
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-400 font-mono mt-6">Scanning Reddit...</p>
                                            <p className="text-[10px] text-gray-600 font-mono mt-1">
                                                Searching for "{activeProduct.name}" across relevant subreddits
                                            </p>
                                        </div>
                                    ) : searchResults.length === 0 && aiOpportunities.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                            <Search size={40} className="text-gray-800 mb-4" />
                                            <p className="text-sm text-gray-500 font-mono">
                                                {activeProduct ? 'Click "Basic Search" or "AI Search" to find opportunities' : 'No results found'}
                                            </p>
                                            <p className="text-[10px] text-gray-700 font-mono mt-2 max-w-sm">
                                                <span className="text-red-600">Basic Search</span> scrapes Reddit directly.
                                                {' '}<span className="text-purple-400">AI Search</span> uses Perplexity to find smarter, contextual opportunities.
                                            </p>
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        <div className="divide-y divide-white/5">
                                            <div className="p-4 bg-white/[0.02]">
                                                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                                                    Found {searchResults.length} relevant post{searchResults.length !== 1 ? 's' : ''}
                                                    {' '}across {discoveredSubreddits.length} subreddit{discoveredSubreddits.length !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                            <div className="space-y-0 p-4 space-y-3">
                                                {searchResults.map(post => (
                                                    <SearchResultCard
                                                        key={post.id}
                                                        post={post}
                                                        onGenerateReply={handleGenerateReply}
                                                        isGenerating={isGenerating === post.id}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* History Tab */}
                    {activeTab === 'history' && (
                        <Card className="bg-black border-white/10">
                            <CardContent className="p-0">
                                {isLoadingOpportunities ? (
                                    <div className="flex items-center justify-center py-20">
                                        <Loader2 size={20} className="animate-spin text-red-600" />
                                    </div>
                                ) : opportunities.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <TrendingUp size={40} className="text-gray-800 mb-4" />
                                        <p className="text-sm text-gray-500 font-mono">No engagement history yet</p>
                                        <p className="text-[10px] text-gray-700 font-mono mt-1">
                                            Generate replies from the Scanner tab to start tracking
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        {/* Filter bar */}
                                        <div className="p-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                                            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                                                {opportunities.length} tracked opportunity{opportunities.length !== 1 ? 'ies' : 'y'}
                                            </p>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-[10px] font-mono text-green-500">{stats.replied} replied</span>
                                                <span className="text-[10px] font-mono text-gray-600">·</span>
                                                <span className="text-[10px] font-mono text-yellow-500">{stats.pending} pending</span>
                                                <span className="text-[10px] font-mono text-gray-600">·</span>
                                                <span className="text-[10px] font-mono text-gray-500">{stats.skipped} skipped</span>
                                            </div>
                                        </div>
                                        {opportunities.map(opp => (
                                            <OpportunityRow
                                                key={opp.id}
                                                opportunity={opp}
                                                onMarkReplied={markAsReplied}
                                                onMarkSkipped={markAsSkipped}
                                                onRegenerate={regenerateReply}
                                                onDispatch={dispatchReplyToReddit}
                                                onDelete={deleteOpportunity}
                                                isRegenerating={isGenerating === opp.reddit_post_id}
                                            />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </PortalLayout>
    );
};

export default AdminRedditAgent;
