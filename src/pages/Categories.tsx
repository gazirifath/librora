import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowRight, Download, Flame, Clock, Search } from "lucide-react";
import NewsletterCTA from "@/components/NewsletterCTA";

const categoryIcons: Record<string, string> = {
  "Self-Help": "🌱",
  Business: "💼",
  Psychology: "🧠",
  Productivity: "⚡",
  Finance: "💰",
  Leadership: "🎯",
  
  Philosophy: "📜",
  "Health & Wellness": "🧘",
  "Science & Technology": "🔬",
};

export { categoryIcons };

const Categories = () => {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [posts, setPosts] = useState<{ category_name: string; download_count: number; created_at: string }[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const [catsRes, postsRes] = await Promise.all([
        supabase.from("categories").select("id, name, slug").order("name"),
        supabase.from("posts").select("download_count, created_at, categories(name)").eq("status", "published"),
      ]);
      setCategories(catsRes.data || []);
      setPosts(
        ((postsRes.data as any) || []).map((p: any) => ({
          category_name: p.categories?.name || "",
          download_count: p.download_count || 0,
          created_at: p.created_at,
        }))
      );
    };
    fetch();
  }, []);

  const categoryStats = useMemo(() => {
    return categories.map((cat) => {
      const catPosts = posts.filter((p) => p.category_name === cat.name);
      const totalDownloads = catPosts.reduce((sum, p) => sum + p.download_count, 0);
      const recentCount = catPosts.filter((p) => {
        const d = new Date(p.created_at);
        const ago = new Date(); ago.setDate(ago.getDate() - 30);
        return d >= ago;
      }).length;
      const avgDownloads = catPosts.length > 0 ? Math.round(totalDownloads / catPosts.length) : 0;
      return { cat, count: catPosts.length, totalDownloads, recentBooks: recentCount, avgDownloads };
    });
  }, [categories, posts]);

  const maxDownloads = Math.max(...categoryStats.map((s) => s.totalDownloads), 1);
  const trendingCats = new Set(
    [...categoryStats]
      .filter((s) => s.count > 0)
      .sort((a, b) => b.avgDownloads - a.avgDownloads)
      .slice(0, 3)
      .map((s) => s.cat.name)
  );
  const topDownloadCat = [...categoryStats].sort((a, b) => b.totalDownloads - a.totalDownloads)[0]?.cat.name;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="container py-12">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
            Browse by Category
          </h1>
          <p className="text-muted-foreground mb-10 max-w-xl">
            Explore our curated collection of PDF books organized by topic.
          </p>

          <div className="relative max-w-md mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categoryStats.filter(({ cat }) => cat.name.toLowerCase().includes(search.toLowerCase())).map(({ cat, count, totalDownloads, recentBooks }) => {
              const isTrending = trendingCats.has(cat.name);
              const isTopDownload = cat.name === topDownloadCat && totalDownloads > 0;

              return (
                <Link
                  key={cat.id}
                  to={`/categories/${cat.slug}`}
                  className="group relative rounded-xl border border-border bg-card p-6 hover:shadow-book transition-all duration-300"
                >
                  <div className="flex flex-wrap gap-1.5 absolute top-3 right-3">
                    {isTopDownload && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold">
                        <Download className="h-2.5 w-2.5" /> Most Downloaded
                      </span>
                    )}
                    {isTrending && !isTopDownload && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent/80 text-accent-foreground px-2 py-0.5 text-[10px] font-semibold">
                        <Flame className="h-2.5 w-2.5" /> Trending
                      </span>
                    )}
                    {recentBooks > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground px-2 py-0.5 text-[10px] font-semibold">
                        <Clock className="h-2.5 w-2.5" /> New
                      </span>
                    )}
                  </div>

                  <span className="text-3xl mb-3 block">
                    {categoryIcons[cat.name] || "📚"}
                  </span>
                  <h2 className="font-heading text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {cat.name}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-3">
                    {count} {count === 1 ? "book" : "books"}
                  </p>

                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                    Browse <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
        
      </main>
      <Footer />
    </div>
  );
};

export default Categories;
