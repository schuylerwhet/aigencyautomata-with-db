import React, { useEffect, useState, useRef } from 'react';
import { BlogPost } from '../types';
import { fetchLatestBlogPosts, fetchPostContent } from '../services/notion';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

interface BlogProps {
  limit?: number;
  showViewAll?: boolean;
  titleOverride?: string;
  subtitleOverride?: string;
}

const Blog: React.FC<BlogProps> = ({ 
  limit, 
  showViewAll, 
  titleOverride, 
  subtitleOverride 
}) => {
  const [posts, setPosts] = useState<(BlogPost & { syncHash?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [selectedPost, setSelectedPost] = useState<(BlogPost & { syncHash?: string }) | null>(null);
  const [isFetchingContent, setIsFetchingContent] = useState(false);
  const [readProgress, setReadProgress] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const readingRef = useRef<HTMLDivElement>(null);

  const categories = ['ALL', ...Array.from(new Set(posts.map(p => p.category.toUpperCase())))];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'ALL' || post.category.toUpperCase() === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const heroPost = filteredPosts[0];
  const featuredPosts = filteredPosts.slice(1, 4);
  const archivePosts = filteredPosts.slice(4);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } as any }
  };

  const checkConnection = async () => {
    try {
      const res = await fetch('/api/blog?limit=1');
      const connected = res.ok;
      setIsConnected(connected);
      return connected;
    } catch {
      setIsConnected(false);
      return false;
    }
  };

  const performSync = async () => {
    setIsLoading(true);
    setIsSyncing(true);
    await checkConnection();
    try {
      const data = await fetchLatestBlogPosts(limit || 100);
      setPosts(data);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    performSync();
  }, []);

  useEffect(() => {
    if (!selectedPost) return;
    const el = readingRef.current;
    if (!el) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const progress = scrollTop / (scrollHeight - clientHeight);
      setReadProgress(Math.min(progress * 100, 100));
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [selectedPost]);

  const openPost = async (post: BlogPost & { syncHash?: string }) => {
    setSelectedPost(post);
    setReadProgress(0);
    document.body.style.overflow = 'hidden';

    if (!post.content) {
      setIsFetchingContent(true);
      try {
        const content = await fetchPostContent(post.id);
        const updatedPosts = posts.map(p => p.id === post.id ? { ...p, content } : p);
        setPosts(updatedPosts);
        setSelectedPost({ ...post, content });
      } catch (error) {
        console.error('Error fetching post content:', error);
      } finally {
        setIsFetchingContent(false);
      }
    }
  };

  const closePost = () => {
    setSelectedPost(null);
    setReadProgress(0);
    document.body.style.overflow = 'unset';
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <section id="blog" className="bg-black py-20 border-b border-white/10 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/[0.03] rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/[0.02] rounded-full blur-[120px]"></div>
      </div>
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 0.5px, transparent 0)', backgroundSize: '32px 32px' }}></div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="container mx-auto px-6 relative z-10"
      >
        {/* Header Section */}
        <div className="mb-20">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-12 mb-16">
            <div>
              <div className="flex items-center space-x-4 mb-6">
                <span className="w-12 h-0.5 bg-red-600"></span>
                <span className="text-red-600 font-black text-[10px] uppercase tracking-[0.5em]">Insights & Intel</span>
                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
              </div>
              <h2 className="text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-tighter uppercase leading-[0.85]">
                {titleOverride || 'INTEL'}<br />{subtitleOverride || 'BUFFER'}
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed max-w-md mt-6 font-light">
                Proprietary automation strategies, LLM orchestration patterns, and high-performance workflow audits.
              </p>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col gap-4 lg:w-[480px]">
              <div className={`relative transition-all duration-500 ${isSearchFocused ? 'ring-1 ring-red-600/50' : ''}`}>
                <input 
                  type="text" 
                  placeholder="Search articles..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  aria-label="Search articles"
                  className="w-full bg-white/[0.04] backdrop-blur-xl border border-white/10 px-5 py-4 text-sm text-white focus:outline-none focus:border-red-600/50 focus:bg-white/[0.06] transition-all placeholder:text-gray-600 rounded-sm"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    aria-pressed={activeCategory === cat}
                    className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 rounded-sm ${
                      activeCategory === cat 
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' 
                        : 'text-gray-500 bg-white/[0.03] border border-white/5 hover:text-white hover:bg-white/[0.06] hover:border-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Sync Status — Collapsed */}
              <div className="flex items-center justify-between text-[10px] font-mono text-gray-700 uppercase tracking-wider px-1">
                <span className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-yellow-500 animate-pulse' : isConnected === false ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                  {isSyncing ? 'SYNCING' : isConnected === false ? 'OFFLINE' : 'NOTION_SYNC'}
                </span>
                <span>{filteredPosts.length} entries</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Post — Magazine Feature */}
        <AnimatePresence mode="wait">
          {!isLoading && heroPost ? (
            <motion.div 
              key={`hero-${activeCategory}-${searchQuery}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mb-16"
            >
              <button 
                onClick={() => openPost(heroPost)}
                className="group relative block w-full text-left overflow-hidden rounded-sm"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[480px]">
                  {/* Image Side */}
                  <div className="relative bg-gradient-to-br from-[#1a0a0a] to-[#0a0a0a] overflow-hidden min-h-[300px] lg:min-h-0">
                    {heroPost.image ? (
                      <>
                        <img src={heroPost.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-1000" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 via-[#0a0a0a] to-black">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(220,38,38,0.3) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                      </div>
                    )}
                    <div className="absolute bottom-6 left-6 z-10">
                      <span className="inline-flex items-center gap-2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm">
                        <span className="w-1 h-1 bg-white rounded-full"></span>
                        Featured
                      </span>
                    </div>
                  </div>

                  {/* Content Side */}
                  <div className="bg-[#080808] border border-white/5 p-10 lg:p-14 flex flex-col justify-between group-hover:bg-[#0c0c0c] group-hover:border-red-600/20 transition-all duration-700">
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <span className="text-red-500 text-[11px] font-bold uppercase tracking-wider">{heroPost.category}</span>
                        <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                        <span className="text-gray-600 text-[11px] font-medium">{formatDate(heroPost.date)}</span>
                      </div>
                      <h3 className="text-3xl lg:text-4xl xl:text-5xl font-black text-white leading-[1.05] tracking-tight mb-6 group-hover:text-red-50 transition-colors duration-500">
                        {heroPost.title}
                      </h3>
                      <p className="text-gray-400 text-base leading-relaxed font-light line-clamp-3 group-hover:text-gray-300 transition-colors">
                        {heroPost.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/5">
                      <div className="flex items-center gap-4">
                        {heroPost.author && (
                          <span className="text-gray-500 text-xs font-medium">{heroPost.author}</span>
                        )}
                        <span className="text-gray-700 text-xs">{heroPost.readingTime || '4 min read'}</span>
                      </div>
                      <div className="flex items-center text-red-600 text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-500">
                        Read Article
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Featured Grid — 3 Column Cards */}
        <AnimatePresence mode="wait">
          {!isLoading && featuredPosts.length > 0 ? (
            <motion.div 
              key={`featured-${activeCategory}-${searchQuery}`}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="mb-24"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredPosts.map((post, index) => (
                  <motion.button 
                    variants={itemVariants}
                    key={post.id} 
                    onClick={() => openPost(post)}
                    className="group relative block w-full text-left bg-[#080808] border border-white/5 overflow-hidden transition-all duration-600 hover:border-red-600/30 hover:shadow-2xl hover:shadow-red-600/5 rounded-sm"
                  >
                    {/* Card Image */}
                    <div className="relative h-52 overflow-hidden bg-gradient-to-br from-[#111] to-[#080808]">
                      {post.image ? (
                        <>
                          <img src={post.image} alt="" className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-110 transition-all duration-1000" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent"></div>
                        </>
                      ) : (
                        <div className="absolute inset-0">
                          <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 to-transparent"></div>
                          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#080808] to-transparent"></div>
                          <div className="absolute inset-0 flex items-center justify-center opacity-[0.04]">
                            <span className="text-[120px] font-black text-white select-none">{String(index + 1).padStart(2, '0')}</span>
                          </div>
                        </div>
                      )}
                      <div className="absolute top-4 left-4 z-10">
                        <span className="text-red-500 text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-sm border border-red-600/10">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 flex flex-col min-h-[200px]">
                      <h3 className="text-xl font-black text-white leading-tight tracking-tight mb-3 group-hover:text-red-50 transition-colors duration-500 line-clamp-3">
                        {post.title}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed font-light line-clamp-2 mb-auto group-hover:text-gray-400 transition-colors">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                        <span className="text-gray-600 text-xs">{formatDate(post.date)}</span>
                        <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-red-600 group-hover:bg-red-600/10 transition-all duration-500">
                          <svg className="w-3.5 h-3.5 text-gray-600 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : !isLoading && filteredPosts.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-32 text-center border border-dashed border-white/5 bg-white/[0.01] rounded-sm"
            >
              <div className="text-gray-600 mb-4">
                <svg className="w-12 h-12 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
              </div>
              <p className="text-gray-600 text-sm font-light">No articles match your search. Try different keywords.</p>
              <button 
                onClick={() => { setSearchQuery(''); setActiveCategory('ALL'); }}
                className="mt-4 text-red-600 text-xs font-bold uppercase tracking-wider hover:text-red-500 transition-colors"
              >
                Clear Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Archive Section */}
        {!isLoading && archivePosts.length > 0 && (limit === undefined || limit > 3) && (
          <div className="relative">
            <div className="flex items-center space-x-4 mb-10">
              <span className="w-8 h-px bg-white/20"></span>
              <span className="text-gray-400 font-bold text-xs uppercase tracking-[0.3em]">More Articles</span>
              <span className="flex-1 h-px bg-white/5"></span>
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {archivePosts.map((post) => (
                <motion.button 
                  variants={itemVariants}
                  key={post.id} 
                  onClick={() => openPost(post)}
                  className="group relative block w-full text-left bg-white/[0.02] p-6 border border-white/5 overflow-hidden transition-all duration-500 hover:bg-white/[0.04] hover:border-red-600/20 rounded-sm"
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-red-600/70 text-[10px] font-bold uppercase tracking-wider group-hover:text-red-500 transition-colors">
                        {post.category}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white/90 leading-snug tracking-tight mb-3 group-hover:text-white transition-colors duration-500 line-clamp-2 min-h-[48px]">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 text-sm leading-relaxed font-light line-clamp-2 mb-4 group-hover:text-gray-500 transition-colors">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <span className="text-gray-700 text-[11px] group-hover:text-gray-500 transition-colors">{formatDate(post.date)}</span>
                      <svg className="w-4 h-4 text-gray-800 group-hover:text-red-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            {/* Hero skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[480px] rounded-sm overflow-hidden animate-pulse">
              <div className="bg-white/[0.03]"></div>
              <div className="bg-white/[0.02] p-14">
                <div className="w-24 h-3 bg-white/5 mb-6 rounded"></div>
                <div className="w-full h-10 bg-white/5 mb-4 rounded"></div>
                <div className="w-3/4 h-10 bg-white/5 mb-8 rounded"></div>
                <div className="w-full h-4 bg-white/[0.03] mb-2 rounded"></div>
                <div className="w-2/3 h-4 bg-white/[0.03] rounded"></div>
              </div>
            </div>
            {/* Card skeletons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/[0.02] rounded-sm border border-white/5 animate-pulse">
                  <div className="h-52 bg-white/[0.03]"></div>
                  <div className="p-6">
                    <div className="w-full h-5 bg-white/5 mb-3 rounded"></div>
                    <div className="w-2/3 h-5 bg-white/5 mb-4 rounded"></div>
                    <div className="w-full h-3 bg-white/[0.03] rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showViewAll && posts.length > (limit || 0) && (
          <div className="mt-16 flex justify-center">
            <Link 
              to="/blog"
              className="group flex items-center space-x-3 bg-white/[0.03] border border-white/10 px-10 py-5 text-white font-bold uppercase tracking-widest text-xs hover:bg-red-600 hover:border-red-600 transition-all duration-500 rounded-sm"
            >
              <span>View All Insights</span>
              <svg className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        )}

        {/* Footer Trace */}
        <div className="mt-24 flex justify-between items-center border-t border-white/5 pt-8 text-[10px] font-mono text-gray-800 uppercase tracking-widest">
          <span>Source: Notion API v3</span>
          <span>Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </motion.div>

      {/* Full-Screen Reading Interface */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[100]"
          >
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={closePost}
            />

            {/* Reading Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-0.5 z-[110] bg-white/5" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(readProgress)} aria-label="Article reading progress">
              <motion.div 
                className="h-full bg-red-600"
                style={{ width: `${readProgress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            {/* Content Panel */}
            <motion.div
              ref={readingRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 140 }}
              className="absolute right-0 top-0 w-full lg:w-[75%] xl:w-[65%] h-full bg-[#0a0a0a] overflow-y-auto border-l border-white/5"
            >
              {/* Header Bar */}
              <div className="sticky top-0 z-20 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5 px-8 lg:px-16 py-5 flex items-center justify-between">
                <button 
                  onClick={closePost}
                  aria-label="Close article and return to blog"
                  className="group flex items-center text-gray-400 text-sm font-medium hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5 mr-3 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back
                </button>

                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span>{selectedPost.readingTime || '4 min read'}</span>
                  <span className="w-1 h-1 bg-gray-800 rounded-full"></span>
                  <span>{formatDate(selectedPost.date)}</span>
                </div>
              </div>

              {/* Article Content */}
              <div className="max-w-3xl mx-auto px-8 lg:px-16 py-16 lg:py-20">
                <header className="mb-16">
                  <div className="flex items-center gap-3 mb-8">
                    <span className="text-red-500 text-xs font-bold uppercase tracking-wider">{selectedPost.category}</span>
                    {selectedPost.status && (
                      <>
                        <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                        <span className="text-gray-600 text-xs">{selectedPost.status}</span>
                      </>
                    )}
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-8">
                    {selectedPost.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8">
                    {selectedPost.author && (
                      <span className="text-white font-medium">By {selectedPost.author}</span>
                    )}
                    <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                    <span>{formatDate(selectedPost.date)}</span>
                    <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                    <span>{selectedPost.readingTime || '4 min read'}</span>
                  </div>

                  {selectedPost.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedPost.tags.map(tag => (
                        <span key={tag} className="text-[11px] font-medium text-gray-500 border border-white/5 px-3 py-1 rounded-sm bg-white/[0.02]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </header>

                <div className="prose prose-invert max-w-none">
                  <p className="text-xl text-gray-300 font-light leading-relaxed border-l-2 border-red-600 pl-6 mb-12 not-italic">
                    {selectedPost.excerpt}
                  </p>
                   
                  {isFetchingContent ? (
                    <div className="space-y-6 animate-pulse">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className={`h-4 bg-white/5 rounded ${i % 3 === 0 ? 'w-full' : i % 3 === 1 ? 'w-5/6' : 'w-4/6'}`}></div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[17px] text-gray-300 leading-[1.9] font-light space-y-6">
                      {selectedPost.content?.split('\n').map((line, i) => {
                        if (line.startsWith('###')) {
                          return <h3 key={i} className="text-2xl font-black text-white tracking-tight mt-16 mb-6">{line.replace('###', '').trim()}</h3>;
                        }
                        if (line.startsWith('##')) {
                          return <h2 key={i} className="text-3xl font-black text-white tracking-tight mt-20 mb-8">{line.replace('##', '').trim()}</h2>;
                        }
                        if (line.startsWith('1.') || line.startsWith('-')) {
                          return (
                            <div key={i} className="flex items-start space-x-3 ml-2">
                              <span className="text-red-600 font-black mt-1.5 text-xs">›</span>
                              <p>{line.substring(2).trim()}</p>
                            </div>
                          );
                        }
                        return line.trim() ? <p key={i}>{line.trim()}</p> : null;
                      })}
                    </div>
                  )}
                </div>

                <footer className="mt-20 pt-10 border-t border-white/5">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                    <p className="text-gray-700 text-xs font-mono uppercase tracking-wider">End of article</p>
                    <button 
                      onClick={closePost}
                      className="bg-white text-black px-8 py-4 font-bold uppercase tracking-wider text-xs hover:bg-red-600 hover:text-white transition-all duration-500 rounded-sm"
                    >
                      Back to Articles
                    </button>
                  </div>
                </footer>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Blog;
