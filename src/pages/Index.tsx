import { useState, useMemo } from "react";
import { Search, TrendingUp, BookOpen, ArrowRight, Leaf, Mail, Download, Flame, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { books, categories } from "@/data/books";
import BookCard from "@/components/BookCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const Index = () => {
  const [search, setSearch] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const filteredBooks = useMemo(() => {
    if (!search.trim()) return [];
    return books.filter(
      b =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const popularBooks = useMemo(
    () => [...books].sort((a, b) => b.downloadCount - a.downloadCount).slice(0, 4),
    []
  );

  const recentBooks = useMemo(
    () => [...books].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()).slice(0, 4),
    []
  );

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
              <span className="text-xs font-medium text-primary-foreground">Free Book Summaries</span>
            </div>
            <h1 className="font-heading text-4xl md:text-6xl font-bold text-primary-foreground max-w-3xl mx-auto leading-tight">
              Read the World's Best Books in Minutes
            </h1>
            <p className="text-primary-foreground/75 mt-4 text-lg max-w-xl mx-auto">
              High-quality summaries of bestselling non-fiction books. Download free PDFs and master key ideas.
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
                {filteredBooks.map(book => (
                  <Link
                    key={book.id}
                    to={`/${book.slug}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors"
                    onClick={() => setSearch("")}
                  >
                    <BookOpen className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{book.title}</p>
                      <p className="text-xs text-muted-foreground">{book.author}</p>
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
              {categories.map(cat => {
                const count = books.filter(b => b.category === cat).length;
                return (
                  <Link
                    key={cat}
                    to={`/categories/${cat.toLowerCase().replace(/\s+/g, "-")}`}
                    className="rounded-lg border border-border bg-card p-4 text-center hover:border-primary/40 hover:shadow-book transition-all cursor-pointer"
                  >
                    <p className="font-heading font-semibold text-foreground">{cat}</p>
                    <p className="text-xs text-muted-foreground mt-1">{count} {count === 1 ? 'book' : 'books'}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Popular */}
        <section className="py-16 bg-card">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-2xl font-bold text-foreground">Most Popular</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {popularBooks.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        </section>

        {/* Recent */}
        <section className="py-16">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-heading text-2xl font-bold text-foreground">Recently Added</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recentBooks.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16 gradient-hero">
          <div className="container text-center">
            <Mail className="h-8 w-8 text-primary-foreground mx-auto mb-4" />
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground">
              Get Weekly Book Summaries
            </h2>
            <p className="text-primary-foreground/75 mt-2 max-w-md mx-auto text-sm">
              Join thousands of readers. New summaries delivered to your inbox every week.
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

        {/* Ad placeholder */}
        <section className="py-8">
          <div className="container">
            <div className="rounded-lg border border-dashed border-border bg-muted p-8 text-center">
              <p className="text-xs text-muted-foreground">AdSense Placement Area</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
