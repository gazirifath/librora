import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookCard, { BookCardPost } from "@/components/BookCard";
import NewsletterCTA from "@/components/NewsletterCTA";
import EmailPopup from "@/components/EmailPopup";
import { Download, ShoppingCart, Clock, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";

interface DbPost {
  id: string;
  slug: string;
  title: string;
  author: string;
  cover_url: string | null;
  summary: string | null;
  key_lessons: string[] | null;
  faq: { question: string; answer: string }[] | null;
  affiliate_url: string | null;
  download_url: string | null;
  download_count: number | null;
  reading_time: string | null;
  category_id: string | null;
  categories: { name: string } | null;
}

const BookPage = () => {
  const { slug } = useParams();
  const [book, setBook] = useState<DbPost | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<DbPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select("*, categories(name)")
        .eq("slug", slug || "")
        .maybeSingle();

      setBook(data as any);

      if (data?.category_id) {
        const { data: related } = await supabase
          .from("posts")
          .select("*, categories(name)")
          .eq("status", "published")
          .eq("category_id", data.category_id)
          .neq("id", data.id)
          .limit(3);
        setRelatedBooks((related as any) || []);
      }
      setLoading(false);
    };
    fetchBook();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading...</div>
        <Footer />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading text-2xl font-bold text-foreground">Book not found</h1>
            <Link to="/" className="text-primary text-sm mt-2 inline-block hover:underline">Go home</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const categoryName = book.categories?.name || "";
  const faqItems = (book.faq as any[]) || [];
  const keyLessons = book.key_lessons || [];

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    author: { "@type": "Person", name: book.author },
    description: (book.summary || "").substring(0, 160),
    url: `https://librora.store/${book.slug}`,
  };

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <main className="flex-1">
        <div className="container pt-6">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to all books
          </Link>
        </div>

        <section className="container py-10">
          <div className="grid md:grid-cols-[280px_1fr] gap-10">
            <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-book">
              {book.cover_url ? (
                <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full gradient-hero flex items-center justify-center p-6 text-center">
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-primary-foreground leading-tight">{book.title}</h2>
                    <p className="text-sm text-primary-foreground/70 mt-2">{book.author}</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              {categoryName && (
                <span className="inline-block text-xs font-medium uppercase tracking-wider text-primary bg-secondary px-3 py-1 rounded-full mb-3">
                  {categoryName}
                </span>
              )}
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
                {book.title} — PDF Download
              </h1>
              <p className="text-muted-foreground mt-1">by {book.author}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {book.reading_time || "5 min"}
                </span>
                <span className="flex items-center gap-1">
                  <Download className="h-4 w-4" /> {(book.download_count || 0).toLocaleString()} downloads
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button
                  onClick={() => setShowPopup(true)}
                  className="flex items-center justify-center gap-2 rounded-lg gradient-gold px-6 py-3 text-sm font-semibold text-accent-foreground shadow-gold hover:opacity-90 transition-opacity"
                >
                   <Download className="h-4 w-4" /> Download PDF
                </button>
                {book.affiliate_url && (
                  <a
                    href={book.affiliate_url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="flex items-center justify-center gap-2 rounded-lg border border-primary bg-transparent px-6 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <ShoppingCart className="h-4 w-4" /> Buy Hardcopy
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="container pb-6">
          <div className="min-h-[90px]" id="ad-bookpage"></div>
        </div>

        {book.summary && (
          <section className="container pb-12">
            <div className="max-w-3xl">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-6">About This Book</h2>
              <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed space-y-4">
                {book.summary.split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </section>
        )}

        {keyLessons.length > 0 && (
          <section className="container pb-12">
            <div className="max-w-3xl">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Key Lessons</h2>
              <div className="space-y-3">
                {keyLessons.map((lesson, i) => (
                  <div key={i} className="flex gap-3 items-start rounded-lg border border-border bg-card p-4">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="text-sm text-foreground">{lesson}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {faqItems.length > 0 && (
          <section className="container pb-12">
            <div className="max-w-3xl">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-6">FAQ</h2>
              <div className="space-y-2">
                {faqItems.map((item, i) => (
                  <div key={i} className="rounded-lg border border-border bg-card overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-foreground text-left"
                    >
                      {item.question}
                      {openFaq === i ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </button>
                    {openFaq === i && (
                      <div className="px-4 pb-4 text-sm text-muted-foreground">
                        {item.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="container pb-12">
          <div className="max-w-3xl">
            <div className="gradient-hero rounded-xl p-8 text-center">
              <Download className="h-8 w-8 text-primary-foreground mx-auto mb-3" />
              <h3 className="font-heading text-2xl font-bold text-primary-foreground">
                Ready to dive in?
              </h3>
              <p className="text-sm text-primary-foreground/75 mt-2 max-w-md mx-auto">
                Grab your PDF copy of <span className="font-semibold text-primary-foreground">{book.title}</span> and start reading — online or offline, on any device.
              </p>
              <button
                onClick={() => setShowPopup(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-lg gradient-gold px-8 py-3.5 text-sm font-semibold text-accent-foreground shadow-gold hover:opacity-90 transition-opacity"
              >
                <Download className="h-4 w-4" /> Get Your PDF Now
              </button>
              <p className="text-xs text-primary-foreground/50 mt-3">
                Instant download • No sign-up required
              </p>
            </div>
          </div>
        </section>

        {relatedBooks.length > 0 && (
          <section className="container pb-16">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Related Books</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {relatedBooks.map(b => (
                <BookCard key={b.id} book={toBookCard(b)} />
              ))}
            </div>
          </section>
        )}

        
      </main>

      <Footer />
      <EmailPopup
        bookSlug={book.slug}
        bookTitle={book.title}
        bookCategory={categoryName}
        postId={book.id}
        downloadUrl={book.download_url}
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
      />
    </div>
  );
};

export default BookPage;
