import { Link } from "react-router-dom";
import { categories, books } from "@/data/books";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowRight } from "lucide-react";

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
            {categories.map((cat) => {
              const catBooks = books.filter((b) => b.category === cat);
              return (
                <Link
                  key={cat}
                  to={`/categories/${cat.toLowerCase().replace(/\s+/g, "-")}`}
                  className="group rounded-xl border border-border bg-card p-6 hover:shadow-book transition-all duration-300"
                >
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
