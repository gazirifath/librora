import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { books } from "@/data/books";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookCard from "@/components/BookCard";
import EmailPopup from "@/components/EmailPopup";
import { Download, ShoppingCart, Clock, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";

const BookPage = () => {
  const { slug } = useParams();
  const book = books.find(b => b.slug === slug);
  const [showPopup, setShowPopup] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

  const relatedBooks = books.filter(b => b.category === book.category && b.id !== book.id).slice(0, 3);

  // JSON-LD Schema
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    author: { "@type": "Person", name: book.author },
    description: book.summary.substring(0, 160),
    url: `https://librora.store/${book.slug}`,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="container pt-6">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to all books
          </Link>
        </div>

        {/* Book Hero */}
        <section className="container py-10">
          <div className="grid md:grid-cols-[280px_1fr] gap-10">
            {/* Cover */}
            <div className="aspect-[3/4] rounded-xl gradient-hero flex items-center justify-center shadow-book">
              <div className="text-center p-6">
                <h2 className="font-heading text-2xl font-bold text-primary-foreground leading-tight">
                  {book.title}
                </h2>
                <p className="text-sm text-primary-foreground/70 mt-2">{book.author}</p>
              </div>
            </div>

            {/* Info */}
            <div>
              <span className="inline-block text-xs font-medium uppercase tracking-wider text-primary bg-secondary px-3 py-1 rounded-full mb-3">
                {book.category}
              </span>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
                {book.title} — Summary
              </h1>
              <p className="text-muted-foreground mt-1">by {book.author}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {book.readingTime}
                </span>
                <span className="flex items-center gap-1">
                  <Download className="h-4 w-4" /> {book.downloadCount.toLocaleString()} downloads
                </span>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button
                  onClick={() => setShowPopup(true)}
                  className="flex items-center justify-center gap-2 rounded-lg gradient-gold px-6 py-3 text-sm font-semibold text-accent-foreground shadow-gold hover:opacity-90 transition-opacity"
                >
                  <Download className="h-4 w-4" /> Download Free PDF
                </button>
                <a
                  href={book.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="flex items-center justify-center gap-2 rounded-lg border border-primary bg-transparent px-6 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <ShoppingCart className="h-4 w-4" /> Buy Hardcopy
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Ad */}
        <div className="container pb-6">
          <div className="rounded-lg border border-dashed border-border bg-muted p-6 text-center">
            <p className="text-xs text-muted-foreground">AdSense Placement</p>
          </div>
        </div>

        {/* Summary */}
        <section className="container pb-12">
          <div className="max-w-3xl">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Book Summary</h2>
            <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed space-y-4">
              {book.summary.split("\n\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </section>

        {/* Key Lessons */}
        <section className="container pb-12">
          <div className="max-w-3xl">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Key Lessons</h2>
            <div className="space-y-3">
              {book.keyLessons.map((lesson, i) => (
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

        {/* FAQ */}
        {book.faq.length > 0 && (
          <section className="container pb-12">
            <div className="max-w-3xl">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-6">FAQ</h2>
              <div className="space-y-2">
                {book.faq.map((item, i) => (
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

        {/* Download CTA */}
        <section className="container pb-12">
          <div className="max-w-3xl">
            <div className="gradient-hero rounded-xl p-8 text-center">
              <h3 className="font-heading text-xl font-bold text-primary-foreground">
                Get the complete PDF summary
              </h3>
              <p className="text-sm text-primary-foreground/75 mt-2">
                Download and read offline anytime.
              </p>
              <button
                onClick={() => setShowPopup(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg gradient-gold px-6 py-3 text-sm font-semibold text-accent-foreground shadow-gold hover:opacity-90 transition-opacity"
              >
                <Download className="h-4 w-4" /> Download Free PDF
              </button>
            </div>
          </div>
        </section>

        {/* Related */}
        {relatedBooks.length > 0 && (
          <section className="container pb-16">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Related Books</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {relatedBooks.map(b => (
                <BookCard key={b.id} book={b} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
      <EmailPopup
        bookSlug={book.slug}
        bookTitle={book.title}
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
      />
    </div>
  );
};

export default BookPage;
