import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { usePageBySlug } from "@/hooks/usePageContent";
import DOMPurify from "dompurify";

interface DynamicPageProps {
  slug: string;
  fallbackTitle: string;
  fallbackContent: string;
}

const DynamicPage = ({ slug, fallbackTitle, fallbackContent }: DynamicPageProps) => {
  const { data: page, isLoading } = usePageBySlug(slug);

  const title = page?.title || fallbackTitle;
  const rawContent = page?.content || fallbackContent;
  const content = DOMPurify.sanitize(rawContent);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-12 max-w-3xl">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <h1 className="font-heading text-3xl font-bold text-foreground mb-6">{title}</h1>
            <div
              className="prose prose-sm max-w-none text-foreground/85 space-y-4 prose-headings:font-heading prose-headings:text-foreground prose-h2:text-xl prose-h2:font-semibold prose-h2:mt-6 prose-ul:list-disc prose-ul:pl-6 prose-li:space-y-1 prose-strong:font-semibold prose-a:text-primary prose-p:text-foreground/85 dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default DynamicPage;
