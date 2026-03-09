import { Link } from "react-router-dom";
import { Download, Clock, ArrowRight } from "lucide-react";

export interface BookCardPost {
  id: string;
  slug: string;
  title: string;
  author: string;
  cover_url?: string | null;
  category_name?: string;
  summary?: string | null;
  download_count?: number | null;
  reading_time?: string | null;
}

interface BookCardProps {
  book: BookCardPost;
}

const BookCard = ({ book }: BookCardProps) => {
  return (
    <Link
      to={`/${book.slug}`}
      className="group relative block rounded-xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-book hover:-translate-y-1.5 hover:border-primary/30"
    >
      {/* Cover */}
      <div className="aspect-[3/4] overflow-hidden relative">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full gradient-hero flex items-center justify-center p-4 text-center">
            <div>
              <h3 className="font-heading text-lg font-bold text-primary-foreground leading-tight">
                {book.title}
              </h3>
              <p className="text-xs text-primary-foreground/70 mt-1">{book.author}</p>
            </div>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            Download PDF <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        {book.category_name && (
          <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full mb-2">
            {book.category_name}
          </span>
        )}
        <h3 className="font-heading font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 text-sm">
          {book.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
        <div className="flex items-center gap-3 mt-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            {(book.download_count || 0).toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {book.reading_time || "5 min"}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
