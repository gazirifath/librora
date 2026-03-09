import { useState, useMemo, useEffect } from "react";
import { Search, TrendingUp, BookOpen, Leaf, Download, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BookCard, { BookCardPost } from "@/components/BookCard";
import AllBooksSection from "@/components/AllBooksSection";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { BookGridSkeleton, CategorySkeleton } from "@/components/Skeletons";
import { categoryIcons } from "@/pages/Categories";
import { addSearchHistory, getSearchHistory } from "@/lib/cookies";

interface DbPost {
  id: string;
  slug: string;
  title: string;
  author: string;
  cover_url: string | null;
  summary: string | null;
  download_count: number | null;
  reading_time: string | null;
  created_at: string;
  categories: { name: string } | null;
}

interface DbCategory {
  id: string;
  name: string;
  slug: string;
}

const Index = () => {
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState<DbPost[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchHistory] = useState(getSearchHistory);

  useEffect(() => {
    const fetchData = async () => {
      const [postsRes, catsRes] = await Promise.all([
        supabase
          .from("posts")
          .select("id, slug, title, author, cover_url, summary, download_count, reading_time, created_at, categories(name)")
          .eq("status", "published")
          .order("created_at", { ascending: false }),
        supabase.from("categories").select("*").order("name"),
      ]);
      setPosts((postsRes.data as any) || []);
      setCategories(catsRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const toBookCard = (p: DbPost): BookCardPost => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    author: p.author,
    cover_url: p.cover_url,
    category_name: p.categories?.name,
    summary: p.summary,
    download_count: p.download_count,
    reading_time: p.reading_time,
  });

  const filteredBooks = useMemo(() => {
    if (!search.trim()) return [];
    return posts.filter(
      b =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, posts]);

  const handleSearchSelect = (slug: string) => {
    if (search.trim()) addSearchHistory(search.trim());
    setSearch("");
  };

  const popularBooks = useMemo(
    () => [...posts].sort((a, b) => (b.download_count || 0) - (a.download_count || 0)).slice(0, 8),
    [posts]
  );

  const recentBooks = useMemo(() => [...posts].slice(0, 8), [posts]);

  const catStats = useMemo(() => {
    return categories.map(cat => {
      const catPosts = posts.filter(p => p.categories?.name === cat.name);
      const totalDl = catPosts.reduce((s, p) => s + (p.download_count || 0), 0);
      const hasRecent = catPosts.some(p => {
        const d = new Date(p.created_at);
        const ago = new Date(); ago.setDate(ago.getDate() - 30);
        return d >= ago;
      });
      return { cat, count: catPosts.length, totalDl, hasRecent };
    });
  }, [categories, posts]);

  const maxDl = Math.max(...catStats.map(c => c.totalDl), 1);

  const totalBooks = posts.length;
  const totalDownloads = posts.reduce((s, p) => s + (p.download_count || 0), 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="gradient-hero py-20 md:py-28 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-primary-foreground/5" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-primary-foreground/5" />
        </div>

        <div className="container text-center relative z-10">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 px-4 py-1.5 mb-6">
              <Leaf className="h-4 w-4 text-primary-foreground" />
              <span className="text-xs font-medium text-primary-foreground">PDF Books</span>
            </div>
            <h1 className="font-heading text-4xl md:text-6xl font-bold text-primary-foreground max-w-3xl mx-auto leading-tight">
              Download the World's Best Books
            </h1>
            <p className="text-primary-foreground/75 mt-4 text-lg max-w-xl mx-auto">
              PDF downloads of bestselling non-fiction books. Read offline and master key ideas.
            </p>
          </div>

          {/* Stats */}
          {!loading && (
            <div className="flex items-center justify-center gap-8 mt-6 animate-fade-in" style={{ animationDelay: "0.15s" }}>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-foreground">{totalBooks.toLocaleString()}+</p>
                <p className="text-xs text-primary-foreground/60">Books</p>
              </div>
              <div className="w-px h-8 bg-primary-foreground/20" />
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-foreground">{totalDownloads.toLocaleString()}+</p>
                <p className="text-xs text-primary-foreground/60">Downloads</p>
              </div>
              <div className="w-px h-8 bg-primary-foreground/20" />
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-foreground">{categories.length}</p>
                <p className="text-xs text-primary-foreground/60">Categories</p>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="relative mt-8 max-w-lg mx-auto animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search books, authors..."
              className="w-full rounded-xl bg-background pl-12 pr-4 py-4 text-sm text-foreground shadow-book placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
            {/* Search results dropdown */}
            {filteredBooks.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-border bg-background shadow-book overflow-hidden z-10 animate-scale-in">
                {filteredBooks.slice(0, 6).map(post => (
                  <Link
                    key={post.id}
                    to={`/${post.slug}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors"
                    onClick={() => handleSearchSelect(post.slug)}
                  >
                    <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{post.title}</p>
                      <p className="text-xs text-muted-foreground">{post.author}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {/* Search history hints */}
            {!search && searchHistory.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
                {searchHistory.map(q => (
                  <button
                    key={q}
                    onClick={() => setSearch(q)}
                    className="text-xs bg-primary-foreground/10 text-primary-foreground/70 px-3 py-1 rounded-full hover:bg-primary-foreground/20 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <main className="flex-1">
        {/* Categories */}
        <AnimatedSection className="py-16">
          <div className="container">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-8">Browse Categories</h2>
            {loading ? (
              <CategorySkeleton />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {catStats.map(({ cat, count, totalDl, hasRecent }) => {
                  const isTop = totalDl === maxDl && totalDl > 0;
                  return (
                    <Link
                      key={cat.id}
                      to={`/categories/${cat.slug}`}
                      className="relative rounded-xl border border-border bg-card p-4 text-center hover:border-primary/40 hover:shadow-book hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                    >
                      <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform duration-300">
                        {categoryIcons[cat.name] || "📚"}
                      </span>
                      <div className="flex flex-wrap gap-1 justify-center mb-2">
                        {isTop && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 text-primary px-1.5 py-0.5 text-[9px] font-semibold">
                            <Download className="h-2.5 w-2.5" /> Top
                          </span>
                        )}
                        {hasRecent && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-accent/15 text-foreground px-1.5 py-0.5 text-[9px] font-semibold">
                            <Clock className="h-2.5 w-2.5" /> New
                          </span>
                        )}
                      </div>
                      <p className="font-heading font-semibold text-foreground">{cat.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{count} {count === 1 ? 'book' : 'books'}</p>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </AnimatedSection>

        {/* Popular */}
        {loading ? (
          <section className="py-16 bg-card">
            <div className="container">
              <div className="flex items-center gap-2 mb-8">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-2xl font-bold text-foreground">Most Popular</h2>
              </div>
              <BookGridSkeleton />
            </div>
          </section>
        ) : popularBooks.length > 0 && (
          <AnimatedSection className="py-16 bg-card">
            <div className="container">
              <div className="flex items-center gap-2 mb-8">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-2xl font-bold text-foreground">Most Popular</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {popularBooks.map(book => (
                  <BookCard key={book.id} book={toBookCard(book)} />
                ))}
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* Recent */}
        {loading ? (
          <section className="py-16">
            <div className="container">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-8">Recently Added</h2>
              <BookGridSkeleton />
            </div>
          </section>
        ) : recentBooks.length > 0 && (
          <AnimatedSection className="py-16">
            <div className="container">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-8">Recently Added</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recentBooks.map(book => (
                  <BookCard key={book.id} book={toBookCard(book)} />
                ))}
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* All Books paginated */}
        {!loading && posts.length > 0 && (
          <AnimatedSection>
            <AllBooksSection posts={posts} />
          </AnimatedSection>
        )}

        {/* Ad space */}
        <section className="py-8">
          <div className="container">
            <div className="min-h-[90px]" id="ad-homepage"></div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
