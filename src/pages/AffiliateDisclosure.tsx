import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AffiliateDisclosure = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 container py-12 max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-foreground mb-6">Affiliate Disclosure</h1>
      <div className="prose prose-sm text-foreground/85 space-y-4">
        <p>Librora is a participant in the Amazon Associates Program and other affiliate programs. This means we earn a small commission when you purchase a book through our affiliate links, at no additional cost to you.</p>
        <p>These commissions help us maintain the site and continue providing PDF book downloads. We only recommend books we genuinely believe provide value.</p>
        <p>Our editorial opinions are not influenced by affiliate partnerships. We always prioritize honest, helpful content for our readers.</p>
      </div>
    </main>
    <Footer />
  </div>
);

export default AffiliateDisclosure;
