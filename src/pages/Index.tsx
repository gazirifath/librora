import { useState, useMemo, useEffect } from "react";
import { Search, TrendingUp, BookOpen, ArrowRight, Leaf, Mail, Download, Flame, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BookCard, { BookCardPost } from "@/components/BookCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";

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
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [posts, setPosts] = useState<DbPost[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);

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

  const popularBooks = useMemo(
    () => [...posts].sort((a, b) => (b.download_count || 0) - (a.download_count || 0)).slice(0, 4),
    [posts]
  );

  const recentBooks = useMemo(
    () => [...posts].slice(0, 4),
    [posts]
  );

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

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    toast.success("Subscribed! Welcome to Librora.");
    setNewsletterEmail("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="gradient-hero py-20 md:py-28">
        <div className="container text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 px-4 py-1.5 mb-6">
              <Leaf className="h-4 w-4 text-primary-foreground" />
              <span className="text-xs font-medium text-primary-foreground">Free PDF Books</span>
            </div>
            <h1 className="font-heading text-4xl md:text-6xl font-bold text-primary-foreground max-w-3xl mx-auto leading-tight">
              Download the World's Best Books for Free
            </h1>
            <p className="text-primary-foreground/75 mt-4 text-lg max-w-xl mx-auto">
              Free PDF downloads of bestselling non-fiction books. Read offline and master key ideas.
            </p>
          </div>

          {/* Search */}
          <div className="relative mt-8 max-w-lg mx-auto animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search books, authors..."
              className="w-full rounded-xl bg-background pl-12 pr-4 py-4 text-sm text-foreground shadow-book placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {filteredBooks.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-border bg-background shadow-book overflow-hidden z-10">
                {filteredBooks.map(post => (
                  <Link
                    key={post.id}
                    to={`/${post.slug}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors"
                    onClick={() => setSearch("")}
                  >
                    <BookOpen className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{post.title}</p>
                      <p className="text-xs text-muted-foreground">{post.author}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <main className="flex-1">
        {/* Categories */}
        <section className="py-16">
          <div className="container">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-8">Browse Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {catStats.map(({ cat, count, totalDl, hasRecent }) => {
                const isTop = totalDl === maxDl && totalDl > 0;
                return (
                  <Link
                    key={cat.id}
                    to={`/categories/${cat.slug}`}
                    className="relative rounded-lg border border-border bg-card p-4 text-center hover:border-primary/40 hover:shadow-book transition-all cursor-pointer"
                  >
                    <div className="flex flex-wrap gap-1 justify-center mb-2">
                      {isTop && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 text-primary px-1.5 py-0.5 text-[9px] font-semibold">
                          <Download className="h-2.5 w-2.5" /> Top
                        </span>
                      )}
                      {hasRecent && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-secondary text-secondary-foreground px-1.5 py-0.5 text-[9px] font-semibold">
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
          </div>
        </section>

        {/* Popular */}
        {popularBooks.length > 0 && (
          <section className="py-16 bg-card">
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
          </section>
        )}

        {/* Recent */}
        {recentBooks.length > 0 && (
          <section className="py-16">
            <div className="container">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-8">Recently Added</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recentBooks.map(book => (
                  <BookCard key={book.id} book={toBookCard(book)} />
                ))}
              </div>
            </div>
          </section>
        )}

        {loading && (
          <div className="py-16 text-center text-muted-foreground">Loading books...</div>
        )}

        {/* Newsletter */}
        <section className="py-16 gradient-hero">
          <div className="container text-center">
            <Mail className="h-8 w-8 text-primary-foreground mx-auto mb-4" />
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground">
              Get Weekly Free Books
            </h2>
            <p className="text-primary-foreground/75 mt-2 max-w-md mx-auto text-sm">
              Join thousands of readers. New free PDF books delivered to your inbox every week.
            </p>
            <form onSubmit={handleNewsletter} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={newsletterEmail}
                onChange={e => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 px-4 py-3 text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30"
              />
              <button
                type="submit"
                className="rounded-lg gradient-gold px-6 py-3 text-sm font-semibold text-accent-foreground shadow-gold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Subscribe <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>

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
