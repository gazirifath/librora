import Header from "@/components/Header";
import Footer from "@/components/Footer";

const DMCA = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 container py-12 max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-foreground mb-6">DMCA Policy</h1>
      <div className="prose prose-sm text-foreground/85 space-y-4">
        <p>Librora respects the intellectual property rights of others. All book summaries on this site are original works of commentary and analysis, created independently.</p>
        <p>If you believe that any content on this site infringes your copyright, please contact us at dmca@librora.store with the following information:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Description of the copyrighted work</li>
          <li>URL of the allegedly infringing content</li>
          <li>Your contact information</li>
          <li>A statement of good faith belief</li>
        </ul>
        <p>We will review and respond to all legitimate DMCA notices promptly.</p>
      </div>
    </main>
    <Footer />
  </div>
);

export default DMCA;
