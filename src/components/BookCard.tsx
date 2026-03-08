import { Link } from "react-router-dom";
import { Download, Clock } from "lucide-react";

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
      className="group block rounded-lg border border-border bg-card p-4 transition-all duration-300 hover:shadow-book hover:-translate-y-1"
    >
      <div className="aspect-[3/4] rounded-md overflow-hidden mb-4">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="w-full h-full object-cover"
            loading="lazy"
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
      </div>
      <div>
        {book.category_name && (
          <span className="inline-block text-[10px] font-medium uppercase tracking-wider text-primary bg-secondary px-2 py-0.5 rounded-full mb-2">
            {book.category_name}
          </span>
        )}
        <h3 className="font-heading font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {book.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
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
