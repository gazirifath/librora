import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { categories, books } from "@/data/books";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowRight, TrendingUp, Download, Flame, Clock, Search } from "lucide-react";

const categoryIcons: Record<string, string> = {
  "Self-Help": "🌱",
  Business: "💼",
  Psychology: "🧠",
  Productivity: "⚡",
  Finance: "💰",
  Leadership: "🎯",
  Health: "❤️",
  Philosophy: "📜",
};

export { categoryIcons };

const Categories = () => {
  const categoryStats = useMemo(() => {
    return categories.map((cat) => {
      const catBooks = books.filter((b) => b.category === cat);
      const totalDownloads = catBooks.reduce((sum, b) => sum + b.downloadCount, 0);
      const recentBooks = catBooks.filter((b) => {
        const addedDate = new Date(b.dateAdded);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return addedDate >= thirtyDaysAgo;
      });
      const avgDownloads = catBooks.length > 0 ? Math.round(totalDownloads / catBooks.length) : 0;
      return { cat, catBooks, totalDownloads, recentBooks: recentBooks.length, avgDownloads };
    });
  }, []);

  const maxDownloads = Math.max(...categoryStats.map((s) => s.totalDownloads), 1);

  // Top trending = highest avg downloads per book
  const trendingCats = new Set(
    [...categoryStats]
      .filter((s) => s.catBooks.length > 0)
      .sort((a, b) => b.avgDownloads - a.avgDownloads)
      .slice(0, 3)
      .map((s) => s.cat)
  );

  // Most downloaded category
  const topDownloadCat = [...categoryStats].sort((a, b) => b.totalDownloads - a.totalDownloads)[0]?.cat;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="container py-12">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
            Browse by Category
          </h1>
          <p className="text-muted-foreground mb-10 max-w-xl">
            Explore our curated book summaries organized by topic.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categoryStats.map(({ cat, catBooks, totalDownloads, recentBooks, avgDownloads }) => {
              const isTrending = trendingCats.has(cat);
              const isTopDownload = cat === topDownloadCat;
              const downloadPercent = Math.round((totalDownloads / maxDownloads) * 100);

              return (
                <Link
                  key={cat}
                  to={`/categories/${cat.toLowerCase().replace(/\s+/g, "-")}`}
                  className="group relative rounded-xl border border-border bg-card p-6 hover:shadow-book transition-all duration-300"
                >
                  {/* Badges */}
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
                    {categoryIcons[cat] || "📚"}
                  </span>
                  <h2 className="font-heading text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {cat}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-3">
                    {catBooks.length} {catBooks.length === 1 ? "book" : "books"}
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
