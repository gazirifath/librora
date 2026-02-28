import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Terms = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 container py-12 max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-foreground mb-6">Terms & Conditions</h1>
      <div className="prose prose-sm text-foreground/85 space-y-4">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p>By using Librora, you agree to these terms. Our book summaries are original content created for educational purposes.</p>
        <h2 className="font-heading text-xl font-semibold text-foreground mt-6">Use of Content</h2>
        <p>All summaries are for personal use only. You may not redistribute, republish, or sell our summaries without written permission.</p>
        <h2 className="font-heading text-xl font-semibold text-foreground mt-6">Affiliate Links</h2>
        <p>Some links on this site are affiliate links. We may earn a commission if you purchase through these links at no extra cost to you.</p>
        <h2 className="font-heading text-xl font-semibold text-foreground mt-6">Disclaimer</h2>
        <p>Our summaries are interpretations of the original works. For the full content, we encourage purchasing the original books.</p>
      </div>
    </main>
    <Footer />
  </div>
);

export default Terms;
