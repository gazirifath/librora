import { useState, useMemo } from "react";
import { BookOpen } from "lucide-react";
import BookCard, { BookCardPost } from "@/components/BookCard";

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

interface AllBooksSectionProps {
  posts: DbPost[];
  booksPerPage?: number;
}

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

const AllBooksSection = ({ posts, booksPerPage = 12 }: AllBooksSectionProps) => {
  const [page, setPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = useMemo(() => {
    const names = posts
      .map(p => p.categories?.name)
      .filter((n): n is string => Boolean(n));
    return ["All", ...Array.from(new Set(names)).sort()];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (activeCategory === "All") return posts;
    return posts.filter(p => p.categories?.name === activeCategory);
  }, [posts, activeCategory]);

  const totalPages = Math.ceil(filteredPosts.length / booksPerPage);
  const paginatedBooks = useMemo(
    () => filteredPosts.slice((page - 1) * booksPerPage, page * booksPerPage),
    [filteredPosts, page, booksPerPage]
  );

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setPage(1);
  };

  if (posts.length === 0) return null;

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <section className="py-16">
      <div className="container">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="font-heading text-2xl font-bold text-foreground">All Books</h2>
          <span className="text-sm text-muted-foreground ml-2">({filteredPosts.length} total)</span>
        </div>

        {/* Category filter tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors border ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:border-primary/40 hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {paginatedBooks.map(book => (
            <BookCard key={book.id} book={toBookCard(book)} />
          ))}
        </div>

        {paginatedBooks.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No books in this category yet.</p>
        )}

        {totalPages > 1 && (
          <nav className="flex items-center justify-center gap-1 mt-10" aria-label="Pagination">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {getPageNumbers().map((p, i) =>
              p === "..." ? (
                <span key={`e${i}`} className="px-2 text-muted-foreground">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    page === p
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card text-foreground hover:bg-secondary"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        )}
      </div>
    </section>
  );
};

export default AllBooksSection;
