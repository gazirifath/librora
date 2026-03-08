import { Link, useParams } from "react-router-dom";
import { categories, books } from "@/data/books";
import { categoryIcons } from "@/pages/Categories";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();

  const matchedCategory = categories.find(
    (cat) => cat.toLowerCase().replace(/\s+/g, "-") === category
  );

  if (!matchedCategory) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-12 text-center">
          <h1 className="font-heading text-2xl font-bold text-foreground mb-4">Category not found</h1>
          <Link to="/categories" className="text-primary hover:underline">Browse all categories</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const catBooks = books.filter((b) => b.category === matchedCategory);
  const icon = categoryIcons[matchedCategory] || "📚";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="container py-12">
          <Link
            to="/categories"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> All Categories
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{icon}</span>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
              {matchedCategory}
            </h1>
          </div>
          <p className="text-muted-foreground mb-10">
            {catBooks.length} {catBooks.length === 1 ? "book summary" : "book summaries"} in this category
          </p>

          {catBooks.length === 0 ? (
            <p className="text-muted-foreground">No books in this category yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {catBooks.map((book) => (
                <Link
                  key={book.slug}
                  to={`/${book.slug}`}
                  className="rounded-xl border border-border bg-card p-6 hover:shadow-book transition-all duration-300 group"
                >
                  <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">by {book.author}</p>
                  <p className="text-xs text-muted-foreground mt-3">{book.readingTime} read</p>
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                    {book.summary.slice(0, 120)}...
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;
