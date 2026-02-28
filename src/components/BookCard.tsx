import { Book } from "@/data/books";
import { Link } from "react-router-dom";
import { Download, Clock } from "lucide-react";

interface BookCardProps {
  book: Book;
}

const BookCard = ({ book }: BookCardProps) => {
  return (
    <Link
      to={`/${book.slug}`}
      className="group block rounded-lg border border-border bg-card p-4 transition-all duration-300 hover:shadow-book hover:-translate-y-1"
    >
      <div className="aspect-[3/4] rounded-md gradient-hero mb-4 flex items-center justify-center overflow-hidden">
        <div className="text-center p-4">
          <h3 className="font-heading text-lg font-bold text-primary-foreground leading-tight">
            {book.title}
          </h3>
          <p className="text-xs text-primary-foreground/70 mt-1">{book.author}</p>
        </div>
      </div>
      <div>
        <span className="inline-block text-[10px] font-medium uppercase tracking-wider text-primary bg-secondary px-2 py-0.5 rounded-full mb-2">
          {book.category}
        </span>
        <h3 className="font-heading font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {book.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            {book.downloadCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {book.readingTime}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
