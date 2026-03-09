const shimmer = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-primary/5 before:to-transparent";

export const BookCardSkeleton = () => (
  <div className={`rounded-lg border border-border bg-card p-4 ${shimmer}`}>
    <div className="aspect-[3/4] rounded-md bg-muted mb-4" />
    <div className="h-3 w-16 rounded-full bg-muted mb-2" />
    <div className="h-4 w-3/4 rounded bg-muted mb-1.5" />
    <div className="h-3 w-1/2 rounded bg-muted mb-3" />
    <div className="flex gap-3">
      <div className="h-3 w-12 rounded bg-muted" />
      <div className="h-3 w-12 rounded bg-muted" />
    </div>
  </div>
);

export const BookGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <BookCardSkeleton key={i} />
    ))}
  </div>
);

export const CategorySkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className={`rounded-lg border border-border bg-card p-4 text-center ${shimmer}`}>
        <div className="h-8 w-8 rounded bg-muted mx-auto mb-2" />
        <div className="h-4 w-20 rounded bg-muted mx-auto mb-1" />
        <div className="h-3 w-12 rounded bg-muted mx-auto" />
      </div>
    ))}
  </div>
);

export const HeroSkeleton = () => (
  <div className="gradient-hero py-20 md:py-28">
    <div className="container text-center">
      <div className="h-6 w-28 rounded-full bg-primary-foreground/10 mx-auto mb-6" />
      <div className="h-12 w-3/4 max-w-xl rounded bg-primary-foreground/10 mx-auto mb-4" />
      <div className="h-5 w-1/2 max-w-md rounded bg-primary-foreground/10 mx-auto" />
    </div>
  </div>
);
