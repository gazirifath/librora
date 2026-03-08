import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { categoryIcons } from "@/pages/Categories";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import NewsletterCTA from "@/components/NewsletterCTA";

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const [catName, setCatName] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Find category by slug
      const { data: catData } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("slug", category || "")
        .maybeSingle();

      if (!catData) {
        setLoading(false);
        return;
      }

      setCatName(catData.name);

      const { data: postsData } = await supabase
        .from("posts")
        .select("id, slug, title, author, cover_url, summary, reading_time, download_count")
        .eq("status", "published")
        .eq("category_id", catData.id)
        .order("created_at", { ascending: false });

      setPosts(postsData || []);
      setLoading(false);
    };
    fetchData();
  }, [category]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-12 text-center text-muted-foreground">Loading...</main>
        <Footer />
      </div>
    );
  }

  if (!catName) {
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

  const icon = categoryIcons[catName] || "📚";

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
              {catName}
            </h1>
          </div>
          <p className="text-muted-foreground mb-10">
            {posts.length} {posts.length === 1 ? "book" : "books"} in this category
          </p>

          {posts.length === 0 ? (
            <p className="text-muted-foreground">No books in this category yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  to={`/${post.slug}`}
                  className="rounded-xl border border-border bg-card p-6 hover:shadow-book transition-all duration-300 group"
                >
                  {post.cover_url && (
                    <img src={post.cover_url} alt={post.title} className="w-full h-40 object-cover rounded-md mb-4" loading="lazy" />
                  )}
                  <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">by {post.author}</p>
                  <p className="text-xs text-muted-foreground mt-3">{post.reading_time || "5 min"} read</p>
                  {post.summary && (
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {post.summary.slice(0, 120)}...
                    </p>
                  )}
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
